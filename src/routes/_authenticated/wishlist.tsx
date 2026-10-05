import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { useWishlist } from "@/lib/shopper";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — LUXORA" },
      { name: "description", content: "Pieces you've saved on LUXORA." },
      { property: "og:title", content: "Wishlist — LUXORA" },
      { property: "og:description", content: "Pieces you've saved on LUXORA." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { user } = Route.useRouteContext();
  const { data, isLoading } = useWishlist(user.id);
  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <p className="eyebrow">Saved</p>
      <h1 className="mt-3 text-5xl">Wishlist</h1>
      {isLoading ? null : !data?.length ? (
        <p className="mt-10 text-muted-foreground">Nothing saved yet. <Link to="/shop" className="underline">Discover pieces</Link></p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {data.map((w) => <ProductCard key={w.id} product={w.product} />)}
        </div>
      )}
    </div>
  );
}
