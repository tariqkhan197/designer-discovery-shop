import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productImage } from "@/lib/images";
import { formatPrice } from "@/lib/brand";
import { cartTotals, Totals } from "@/components/site/Totals";
import { useCart, useCartMutations } from "@/lib/shopper";

export const Route = createFileRoute("/_authenticated/bag")({
  head: () => ({
    meta: [
      { title: "Your Bag — LUXORA" },
      { name: "description", content: "Review the pieces in your shopping bag." },
      { property: "og:title", content: "Your Bag — LUXORA" },
      { property: "og:description", content: "Review the pieces in your shopping bag." },
    ],
  }),
  component: Bag,
});

function Bag() {
  const { user } = Route.useRouteContext();
  const { data: lines = [], isLoading } = useCart(user.id);
  const { setQty } = useCartMutations(user.id);
  const t = cartTotals(lines);

  if (isLoading) return <div className="py-32 text-center text-muted-foreground">Loading…</div>;
  if (!lines.length) return (
    <div className="py-32 text-center">
      <h1 className="text-5xl">Your bag is empty</h1>
      <Link to="/shop"><Button variant="luxe" size="xl" className="mt-8">Continue shopping</Button></Link>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-16 px-5 py-14 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="text-5xl">Your bag</h1>
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {lines.map((l) => (
            <li key={l.id} className="flex gap-6 py-6">
              <img src={productImage(l.product.image_key)} alt={l.product.name} loading="lazy" width={768} height={1024} className="h-36 w-28 bg-surface object-cover" />
              <div className="flex flex-1 flex-col">
                <p className="eyebrow text-foreground">{l.product.vendor?.name}</p>
                <Link to="/product/$slug" params={{ slug: l.product.slug }} className="mt-1 text-sm hover:text-bronze">{l.product.name}</Link>
                {l.size && <p className="mt-1 text-sm text-muted-foreground">Size {l.size}</p>}
                <div className="mt-auto flex items-center gap-3">
                  <button aria-label="Decrease" onClick={() => setQty.mutate({ id: l.id, quantity: l.quantity - 1 })}><Minus className="size-4" /></button>
                  <span className="w-6 text-center text-sm">{l.quantity}</span>
                  <button aria-label="Increase" disabled={l.quantity >= l.product.stock} onClick={() => setQty.mutate({ id: l.id, quantity: l.quantity + 1 })}><Plus className="size-4" /></button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button aria-label="Remove" onClick={() => setQty.mutate({ id: l.id, quantity: 0 })}><X className="size-4 text-muted-foreground" /></button>
                <p className="text-sm">{formatPrice(Number(l.product.price) * l.quantity)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="h-fit bg-surface p-8">
        <p className="eyebrow">Summary</p>
        <Totals {...t} />
        <Link to="/checkout"><Button variant="luxe" size="xl" className="mt-8 w-full">Checkout</Button></Link>
      </aside>
    </div>
  );
}

