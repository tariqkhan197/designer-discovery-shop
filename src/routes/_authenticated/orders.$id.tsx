import { createFileRoute, Link } from "@tanstack/react-router";
import { productImage } from "@/lib/images";
import { formatPrice } from "@/lib/brand";
import { useOrder } from "@/lib/shopper";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order details — LUXORA" },
      { name: "description", content: "Your LUXORA order details." },
      { property: "og:title", content: "Order details — LUXORA" },
      { property: "og:description", content: "Your LUXORA order details." },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const { data: o, isLoading } = useOrder(id);
  if (isLoading) return <div className="py-32 text-center text-muted-foreground">Loading…</div>;
  if (!o) return <div className="py-32 text-center"><h1 className="text-4xl">Order not found</h1></div>;
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="eyebrow">Order #{o.id.slice(0, 8).toUpperCase()}</p>
      <h1 className="mt-3 text-5xl">Thank you</h1>
      <p className="mt-4 text-muted-foreground">
        Placed {new Date(o.created_at).toLocaleDateString()} · <span className="capitalize text-foreground">{o.status}</span>
      </p>
      <ul className="mt-10 divide-y divide-border border-y border-border">
        {o.order_items.map((i) => (
          <li key={i.id} className="flex gap-5 py-5">
            <img src={productImage(i.image_key)} alt={i.product_name} loading="lazy" width={768} height={1024} className="h-28 w-20 bg-surface object-cover" />
            <div className="flex-1 text-sm">
              <p>{i.product_name}</p>
              <p className="text-muted-foreground">{i.size && `Size ${i.size} · `}Qty {i.quantity}</p>
            </div>
            <p className="text-sm">{formatPrice(Number(i.unit_price) * i.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div className="text-sm">
          <p className="eyebrow mb-2">Ship to</p>
          <p>{o.ship_name}</p><p>{o.ship_address}</p><p>{o.ship_city} {o.ship_postal}</p><p>{o.ship_country}</p>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(o.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{Number(o.shipping) ? formatPrice(o.shipping) : "Complimentary"}</dd></div>
          <div className="flex justify-between border-t border-border pt-2 text-base"><dt>Total</dt><dd>{formatPrice(o.total)}</dd></div>
        </dl>
      </div>
      <Link to="/account" className="mt-12 inline-block border-b border-foreground pb-1 text-xs uppercase tracking-[0.2em]">All orders</Link>
    </div>
  );
}
