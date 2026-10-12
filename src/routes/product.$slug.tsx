import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { productQuery } from "@/lib/catalog";
import { productImage } from "@/lib/images";
import { BRAND, formatPrice } from "@/lib/brand";
import { useCartMutations, useToggleWishlist, useUser, useWishlist } from "@/lib/shopper";
import { ProductReviews } from "@/components/site/Reviews";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const name = params.slug.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
    return {
      meta: [
        { title: `${name} — LUXORA` },
        { name: "description", content: `Shop the ${name} at LUXORA.` },
        { property: "og:title", content: `${name} — LUXORA` },
        { property: "og:description", content: `Shop the ${name} at LUXORA.` },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: p, isLoading } = useQuery(productQuery(slug));
  const { user } = useUser();
  const wishlist = useWishlist(user?.id);
  const { add } = useCartMutations(user?.id);
  const toggle = useToggleWishlist(user?.id);
  const navigate = useNavigate();
  const [size, setSize] = useState<string>("");

  if (isLoading) return <div className="mx-auto max-w-7xl px-5 py-14"><div className="aspect-[3/4] max-w-xl animate-pulse bg-surface" /></div>;
  if (!p) return (
    <div className="py-32 text-center">
      <h1 className="text-4xl">Piece not found</h1>
      <Link to="/shop" className="mt-6 inline-block border-b border-foreground pb-1 text-xs uppercase tracking-[0.2em]">Back to shop</Link>
    </div>
  );

  const saved = !!wishlist.data?.some((w) => w.product.id === p.id);
  const needsSize = p.sizes.length > 0;
  const soldOut = p.stock <= 0;

  const requireUser = () => {
    if (!user) { navigate({ to: "/auth" }); return false; }
    return true;
  };

  return (
    <>
    <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-2">
      <div className="bg-surface">
        <img src={productImage(p.image_key)} alt={p.name} width={768} height={1024} className="w-full object-cover" />
      </div>
      <div className="md:sticky md:top-40 md:self-start">
        <Link to="/designers/$slug" params={{ slug: p.vendor!.slug }} className="eyebrow text-foreground hover:text-bronze">{p.vendor?.name}</Link>
        <h1 className="mt-3 text-5xl">{p.name}</h1>
        <p className="mt-4 text-lg">
          {formatPrice(p.price)}
          {p.compare_at_price && <span className="ml-3 text-muted-foreground line-through">{formatPrice(p.compare_at_price)}</span>}
        </p>
        <p className="mt-8 max-w-md leading-relaxed text-muted-foreground">{p.description}</p>

        {needsSize && (
          <div className="mt-10">
            <p className="eyebrow mb-3">Select size</p>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-11 min-w-12 border px-3 text-sm transition-colors ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex gap-3">
          <Button
            variant="luxe"
            size="xl"
            className="flex-1"
            disabled={soldOut || add.isPending}
            onClick={() => {
              if (!requireUser()) return;
              if (needsSize && !size) { toast("Please select a size"); return; }
              add.mutate({ productId: p.id, size }, {
                onSuccess: () => toast.success("Added to your bag"),
                onError: (e) => toast.error(e.message),
              });
            }}
          >
            {soldOut ? "Sold out" : "Add to bag"}
          </Button>
          <Button
            variant="luxeOutline"
            size="xl"
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            onClick={() => requireUser() && toggle.mutate({ productId: p.id, saved })}
          >
            <Heart className={saved ? "fill-current" : ""} />
          </Button>
        </div>
        {!soldOut && p.stock <= 5 && <p className="mt-3 text-sm text-bronze">Only {p.stock} left</p>}
        <div className="mt-10 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
          <p>Complimentary shipping over {formatPrice(BRAND.freeShippingThreshold)}</p>
          <p>Shipped directly from {p.vendor?.name}</p>
        </div>
      </div>
    </div>
    <ProductReviews productId={p.id} userId={user?.id} />
    </>
  );
}
