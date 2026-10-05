import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import hero from "@/assets/hero.jpg";
import knit from "@/assets/p-knit.jpg";
import tote from "@/assets/p-tote.jpg";
import { Button } from "@/components/ui/button";
import { ProductCard, ProductGridSkeleton } from "@/components/site/ProductCard";
import { featuredQuery, vendorsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LUXORA — Curated Luxury Fashion & Lifestyle" },
      { name: "description", content: "Discover ready-to-wear, bags, shoes and jewellery from independent luxury designers." },
      { property: "og:title", content: "LUXORA — Curated Luxury Fashion & Lifestyle" },
      { property: "og:description", content: "Discover ready-to-wear, bags, shoes and jewellery from independent luxury designers." },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = useQuery(featuredQuery());
  const vendors = useQuery(vendorsQuery());
  return (
    <>
      <section className="relative">
        <img src={hero} alt="Model in a camel wool overcoat" width={1600} height={1008} className="h-[78vh] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 max-w-7xl px-5 pb-16 md:px-16">
          <p className="eyebrow animate-rise text-primary-foreground/80">Autumn / Winter Edit</p>
          <h1 className="mt-4 animate-rise text-6xl leading-none text-primary-foreground md:text-8xl">The Quiet Season</h1>
          <Link to="/shop" className="mt-8 inline-block animate-rise">
            <Button variant="luxe" size="xl" className="bg-background text-foreground hover:bg-background/85">Shop the edit</Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="eyebrow">Selected for you</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Featured pieces</h2>
          </div>
          <Link to="/shop" className="border-b border-foreground pb-1 text-xs uppercase tracking-[0.2em]">View all</Link>
        </div>
        {featured.isLoading ? <ProductGridSkeleton /> : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
            {featured.data?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-2">
        {[
          { img: knit, title: "Ready-to-Wear", slug: "ready-to-wear" },
          { img: tote, title: "Leather Goods", slug: "bags" },
        ].map((c) => (
          <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="group relative block overflow-hidden">
            <img src={c.img} alt={c.title} loading="lazy" width={768} height={1024} className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/60 to-transparent p-8">
              <h3 className="text-4xl text-primary-foreground">{c.title}</h3>
              <p className="eyebrow mt-2 text-primary-foreground/80">Discover</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <p className="eyebrow text-center">The houses</p>
        <h2 className="mt-3 text-center text-4xl md:text-5xl">Our designers</h2>
        <div className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {vendors.data?.map((v) => (
            <Link key={v.id} to="/designers/$slug" params={{ slug: v.slug }} className="bg-background p-8 transition-colors hover:bg-surface">
              <p className="font-display text-2xl">{v.name}</p>
              <p className="eyebrow mt-2">{v.country}</p>
              <p className="mt-4 text-sm text-muted-foreground">{v.story}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
