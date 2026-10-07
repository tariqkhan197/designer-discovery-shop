// Seller data layer: shop, products, inventory, incoming order lines.
// Access is enforced by database rules (sellers only reach their own shop's rows).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SellerProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sizes: string[];
  stock: number;
  image_key: string;
  is_active: boolean;
  is_featured: boolean;
  category_id: string | null;
  created_at: string;
};

export type ProductInput = Omit<SellerProduct, "id" | "slug" | "created_at" | "is_featured">;

export const FULFILLMENT = ["pending", "shipped", "delivered", "cancelled"] as const;
export type Fulfillment = (typeof FULFILLMENT)[number];

export function useMyVendor(userId: string) {
  return useQuery({
    queryKey: ["my-vendor", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors").select("id, name, slug, story, country").eq("owner_id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useBecomeVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { name: string; country: string; story: string }) => {
      const { data, error } = await supabase.rpc("become_vendor", { _name: v.name, _country: v.country, _story: v.story });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-vendor"] });
      qc.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}

export function useSellerProducts(vendorId?: string) {
  return useQuery({
    queryKey: ["seller-products", vendorId],
    enabled: !!vendorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, description, price, compare_at_price, sizes, stock, image_key, is_active, is_featured, category_id, created_at")
        .eq("vendor_id", vendorId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SellerProduct[];
    },
  });
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function useSaveProduct(vendorId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: ProductInput }) => {
      if (!vendorId) throw new Error("No shop found");
      if (!input.name.trim()) throw new Error("Name is required");
      if (!(input.price > 0)) throw new Error("Price must be above zero");
      if (input.stock < 0) throw new Error("Stock cannot be negative");
      if (!input.image_key) throw new Error("Please add a photo");
      if (id) {
        const { error } = await supabase.from("products").update(input).eq("id", id);
        if (error) throw error;
      } else {
        const slug = `${slugify(input.name)}-${Math.random().toString(36).slice(2, 6)}`;
        const { error } = await supabase.from("products").insert({ ...input, vendor_id: vendorId, slug });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; stock?: number; is_active?: boolean }) => {
      const { id, ...patch } = p;
      if (patch.stock !== undefined && (patch.stock < 0 || !Number.isInteger(patch.stock))) throw new Error("Invalid stock");
      const { error } = await supabase.from("products").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller-products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller-products"] }),
  });
}

export async function uploadProductImage(userId: string, file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
  if (error) throw error;
  // Long-lived link so shoppers can view the photo.
  const { data, error: e2 } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2) throw e2;
  return data.signedUrl;
}

export type SellerOrderLine = {
  id: string;
  product_name: string;
  image_key: string;
  size: string;
  quantity: number;
  unit_price: number;
  fulfillment_status: Fulfillment;
  order: {
    id: string;
    created_at: string;
    ship_name: string;
    ship_address: string;
    ship_city: string;
    ship_postal: string;
    ship_country: string;
  };
};

export function useSellerOrders(vendorId?: string) {
  return useQuery({
    queryKey: ["seller-orders", vendorId],
    enabled: !!vendorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("id, product_name, image_key, size, quantity, unit_price, fulfillment_status, order:orders!inner(id, created_at, ship_name, ship_address, ship_city, ship_postal, ship_country)")
        .eq("vendor_id", vendorId!);
      if (error) throw error;
      const rows = data as unknown as SellerOrderLine[];
      return rows.sort((a, b) => b.order.created_at.localeCompare(a.order.created_at));
    },
  });
}

export function useSetFulfillment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Fulfillment }) => {
      const { error } = await supabase.from("order_items").update({ fulfillment_status: status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller-orders"] }),
  });
}
