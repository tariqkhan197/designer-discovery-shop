// Admin data layer: marketplace-wide oversight. Access is enforced by database
// rules (has_role 'admin'); these hooks only shape the queries.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin(userId?: string) {
  return useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: userId!, _role: "admin" });
      if (error) throw error;
      return !!data;
    },
  });
}

export type AdminVendor = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  commission_rate: number;
  created_at: string;
  owner_id: string | null;
};

export function useAdminVendors() {
  return useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("id, name, slug, country, commission_rate, created_at, owner_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AdminVendor[];
    },
  });
}

export function useSetCommission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rate }: { id: string; rate: number }) => {
      if (!(rate >= 0 && rate <= 0.5)) throw new Error("Commission must be between 0% and 50%");
      const { error } = await supabase.from("vendors").update({ commission_rate: rate }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vendors"] }),
  });
}

export type AdminPayout = {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  paid_at: string | null;
  vendor: { name: string } | null;
};

export function useAdminPayouts() {
  return useQuery({
    queryKey: ["admin-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payouts")
        .select("id, amount, status, requested_at, paid_at, vendor:vendors(name)")
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return data as unknown as AdminPayout[];
    },
  });
}

export function useSetPayoutStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "paid" | "rejected" }) => {
      const patch = status === "paid" ? { status, paid_at: new Date().toISOString() } : { status, paid_at: null };
      const { error } = await supabase.from("payouts").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-payouts"] }),
  });
}

export type AdminOrder = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  ship_name: string;
  ship_city: string;
  ship_country: string;
  order_items: { id: string; product_name: string; quantity: number; unit_price: number; fulfillment_status: string; vendor: { name: string } | null }[];
};

export function useAdminOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total, created_at, ship_name, ship_city, ship_country, order_items(id, product_name, quantity, unit_price, fulfillment_status, vendor:vendors(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as AdminOrder[];
    },
  });
}

export type AdminProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  vendor: { name: string } | null;
};

export function useAdminProducts() {
  return useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock, is_active, is_featured, vendor:vendors(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as AdminProduct[];
    },
  });
}

export function useAdminUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string; is_active?: boolean; is_featured?: boolean }) => {
      const { error } = await supabase.from("products").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
