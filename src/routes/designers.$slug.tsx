import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductCard, ProductGridSkeleton } from "@/components/site/ProductCard";
import { productsQuery, vendorQuery } from "@/lib/catalog";

export const Route = createFileRoute("/designers/$slug")({
  head: ({ params }) => {
    const name = params.slug.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
    return {
      meta: [
        { title: `${name} — Designers — LUXORA` },
        { name: "description", content: `Shop ${name} on LUXORA.` },
        { property: "og:title", content: `${name} — LUXORA` },
        { property: "og:description", content: `Shop ${name} on LUXORA.` },
      ],
    };
  },
  component: Designer,
});

function Designer() {
  const { slug } = Route.useParams();
  const vendor = useQuery(vendorQuery(slug));
  const products = useQuery(productsQuery({ designer: slug }));
  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{vendor.data?.country}</p>
        <h1 className="mt-3 text-6xl">{vendor.data?.name ?? " "}</h1>
        <p className="mt-6 text-muted-foreground">{vendor.data?.story}</p>
      </div>
      <div className="mt-16">
        {products.isLoading ? <ProductGridSkeleton /> : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
            {products.data?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
