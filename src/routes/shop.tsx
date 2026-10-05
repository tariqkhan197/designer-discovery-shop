import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ProductCard, ProductGridSkeleton } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery, vendorsQuery } from "@/lib/catalog";
import { formatPrice } from "@/lib/brand";

const searchSchema = z.object({
  category: z.string().optional(),
  designer: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["new", "price-asc", "price-desc"]).optional(),
  max: z.number().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop All — LUXORA" },
      { name: "description", content: "Browse the full LUXORA collection by category, designer and price." },
      { property: "og:title", content: "Shop All — LUXORA" },
      { property: "og:description", content: "Browse the full LUXORA collection by category, designer and price." },
    ],
  }),
  component: Shop,
});

const PRICES = [300, 500, 1000];

function Shop() {
  const s = Route.useSearch();
  const products = useQuery(productsQuery(s));
  const cats = useQuery(categoriesQuery());
  const vendors = useQuery(vendorsQuery());
  const title = cats.data?.find((c) => c.slug === s.category)?.name ?? (s.q ? `“${s.q}”` : "All products");

  const chip = (active: boolean) =>
    `block py-1 text-sm transition-colors ${active ? "text-foreground underline underline-offset-4" : "text-muted-foreground hover:text-foreground"}`;

  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <p className="eyebrow">Shop</p>
      <h1 className="mt-3 text-5xl">{title}</h1>
      <div className="mt-12 grid gap-12 lg:grid-cols-[200px_1fr]">
        <aside className="space-y-8">
          <div>
            <p className="eyebrow mb-3">Category</p>
            <Link to="/shop" search={{ ...s, category: undefined }} className={chip(!s.category)}>All</Link>
            {cats.data?.map((c) => (
              <Link key={c.id} to="/shop" search={{ ...s, category: c.slug }} className={chip(s.category === c.slug)}>{c.name}</Link>
            ))}
          </div>
          <div>
            <p className="eyebrow mb-3">Designer</p>
            <Link to="/shop" search={{ ...s, designer: undefined }} className={chip(!s.designer)}>All</Link>
            {vendors.data?.map((v) => (
              <Link key={v.id} to="/shop" search={{ ...s, designer: v.slug }} className={chip(s.designer === v.slug)}>{v.name}</Link>
            ))}
          </div>
          <div>
            <p className="eyebrow mb-3">Price</p>
            <Link to="/shop" search={{ ...s, max: undefined }} className={chip(!s.max)}>Any</Link>
            {PRICES.map((p) => (
              <Link key={p} to="/shop" search={{ ...s, max: p }} className={chip(s.max === p)}>Under {formatPrice(p)}</Link>
            ))}
          </div>
        </aside>
        <div>
          <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
            <p className="text-sm text-muted-foreground">{products.data?.length ?? 0} pieces</p>
            <select
              aria-label="Sort"
              value={s.sort ?? "new"}
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set("sort", JSON.stringify(e.target.value));
                window.history.replaceState(null, "", url);
              }}
              className="hidden"
            />
            <div className="flex gap-4 text-xs uppercase tracking-[0.15em]">
              {([["new", "Newest"], ["price-asc", "Price ↑"], ["price-desc", "Price ↓"]] as const).map(([v, l]) => (
                <Link key={v} to="/shop" search={{ ...s, sort: v === "new" ? undefined : v }} className={(s.sort ?? "new") === v ? "text-foreground" : "text-muted-foreground hover:text-foreground"}>{l}</Link>
              ))}
            </div>
          </div>
          {products.isLoading ? <ProductGridSkeleton n={6} /> : products.data?.length ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3">
              {products.data.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="font-display text-3xl">Nothing matches yet</p>
              <Link to="/shop" className="mt-4 inline-block border-b border-foreground pb-1 text-xs uppercase tracking-[0.2em]">Clear filters</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
