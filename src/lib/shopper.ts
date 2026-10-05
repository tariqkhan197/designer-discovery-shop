// Shopper data: bag, wishlist, orders. All rows are protected per-user by database rules.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "./catalog";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, loading };
}

export type CartLine = { id: string; size: string; quantity: number; product: Product };

export function useCart(userId?: string) {
  return useQuery({
    queryKey: ["cart", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, size, quantity, product:products(id, name, slug, price, image_key, stock, sizes, vendor:vendors(name, slug))")
        .order("created_at");
      if (error) throw error;
      return data as unknown as CartLine[];
    },
  });
}

export function useWishlist(userId?: string) {
  return useQuery({
    queryKey: ["wishlist", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("id, product:products(id, name, slug, price, compare_at_price, image_key, vendor:vendors(name, slug))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as { id: string; product: Product }[];
    },
  });
}

export function useCartMutations(userId?: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["cart"] });
  const add = useMutation({
    mutationFn: async ({ productId, size }: { productId: string; size: string }) => {
      if (!userId) throw new Error("Please sign in");
      const { data: existing } = await supabase
        .from("cart_items").select("id, quantity").eq("product_id", productId).eq("size", size).maybeSingle();
      if (existing) {
        const { error } = await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").insert({ user_id: userId, product_id: productId, size });
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });
  const setQty = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { error } = quantity <= 0
        ? await supabase.from("cart_items").delete().eq("id", id)
        : await supabase.from("cart_items").update({ quantity }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { add, setQty };
}

export function useToggleWishlist(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, saved }: { productId: string; saved: boolean }) => {
      if (!userId) throw new Error("Please sign in");
      const { error } = saved
        ? await supabase.from("wishlist_items").delete().eq("product_id", productId)
        : await supabase.from("wishlist_items").insert({ user_id: userId, product_id: productId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

export function useOrders(userId?: string) {
  return useQuery({
    queryKey: ["orders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total, created_at, order_items(id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
