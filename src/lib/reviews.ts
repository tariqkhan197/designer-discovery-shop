// Product reviews: public reading, verified-purchase writing (enforced in the database).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
};

export function summarize(reviews: { rating: number }[]) {
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { count, average };
}

export function useProductReviews(productId?: string) {
  return useQuery({
    queryKey: ["reviews", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews").select("*").eq("product_id", productId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });
}

export function useCanReview(productId?: string, userId?: string) {
  return useQuery({
    queryKey: ["can-review", productId, userId],
    enabled: !!productId && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_purchased", { _product_id: productId! });
      if (error) throw error;
      return !!data;
    },
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { productId: string; rating: number; title: string; body: string }) => {
      const { error } = await supabase.rpc("submit_review", {
        _product_id: v.productId, _rating: v.rating, _title: v.title, _body: v.body,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

/** Reviews across every product in a designer's shop. */
export function useVendorReviews(vendorId?: string) {
  return useQuery({
    queryKey: ["reviews", "vendor", vendorId],
    enabled: !!vendorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, product:products!inner(id, name, slug, vendor_id)")
        .eq("product.vendor_id", vendorId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as (Review & { product: { id: string; name: string; slug: string } })[];
    },
  });
}
