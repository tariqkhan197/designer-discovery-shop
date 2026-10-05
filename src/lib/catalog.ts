import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PRODUCT_FIELDS =
  "id, name, slug, description, price, compare_at_price, sizes, stock, image_key, is_featured, vendor:vendors(name, slug), category:categories(name, slug)";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sizes: string[];
  stock: number;
  image_key: string;
  is_featured: boolean;
  vendor: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
};

export type ProductFilters = {
  category?: string;
  designer?: string;
  q?: string;
  sort?: "new" | "price-asc" | "price-desc";
  max?: number;
};

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name, slug").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const vendorsQuery = () =>
  queryOptions({
    queryKey: ["vendors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendors").select("id, name, slug, story, country").order("name");
      if (error) throw error;
      return data;
    },
  });

export const vendorQuery = (slug: string) =>
  queryOptions({
    queryKey: ["vendor", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendors").select("id, name, slug, story, country").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const productsQuery = (f: ProductFilters = {}) =>
  queryOptions({
    queryKey: ["products", f],
    queryFn: async () => {
      let q = supabase.from("products").select(
        PRODUCT_FIELDS.replace("vendor:vendors(", "vendor:vendors!inner(").replace("category:categories(", f.category ? "category:categories!inner(" : "category:categories("),
      );
      if (f.category) q = q.eq("category.slug", f.category);
      if (f.designer) q = q.eq("vendor.slug", f.designer);
      if (f.q) q = q.ilike("name", `%${f.q.replace(/[%_,()]/g, "")}%`);
      if (f.max) q = q.lte("price", f.max);
      if (f.sort === "price-asc") q = q.order("price", { ascending: true });
      else if (f.sort === "price-desc") q = q.order("price", { ascending: false });
      else q = q.order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

export const featuredQuery = () =>
  queryOptions({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select(PRODUCT_FIELDS).eq("is_featured", true).limit(4);
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select(PRODUCT_FIELDS).eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data as unknown as Product | null;
    },
  });
