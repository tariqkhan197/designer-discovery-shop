import { createFileRoute } from "@tanstack/react-router";
import { formatPrice } from "@/lib/brand";
import { useAdminOrders } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders — LUXORA Admin" },
      { name: "description", content: "All marketplace orders." },
      { property: "og:title", content: "Orders — LUXORA Admin" },
      { property: "og:description", content: "All marketplace orders." },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const { data: orders = [], isLoading } = useAdminOrders();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!orders.length) return <p className="text-muted-foreground">No orders yet.</p>;

  return (
    <ul className="space-y-6">
      {orders.map((o) => (
        <li key={o.id} className="border border-border p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-lg">#{o.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(o.created_at).toLocaleDateString()} · {o.ship_name} · {o.ship_city}, {o.ship_country}
            </p>
            <p className="text-lg">{formatPrice(o.total)}</p>
          </div>
          <ul className="mt-4 divide-y divide-border border-t border-border text-sm">
            {o.order_items.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span>{i.product_name} × {i.quantity}</span>
                <span className="text-muted-foreground">{i.vendor?.name ?? "—"}</span>
                <span className="capitalize text-muted-foreground">{i.fulfillment_status}</span>
                <span>{formatPrice(i.unit_price * i.quantity)}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
