import { createFileRoute } from "@tanstack/react-router";
import { formatPrice } from "@/lib/brand";
import { useAdminOrders, useAdminPayouts, useAdminProducts, useAdminVendors } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Overview — LUXORA" },
      { name: "description", content: "Marketplace overview for LUXORA administrators." },
      { property: "og:title", content: "Admin Overview — LUXORA" },
      { property: "og:description", content: "Marketplace overview for LUXORA administrators." },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const { data: orders = [] } = useAdminOrders();
  const { data: vendors = [] } = useAdminVendors();
  const { data: products = [] } = useAdminProducts();
  const { data: payouts = [] } = useAdminPayouts();

  const gmv = orders.reduce((s, o) => s + Number(o.total), 0);
  const pendingPayouts = payouts.filter((p) => p.status === "requested");
  const toShip = orders.flatMap((o) => o.order_items).filter((i) => i.fulfillment_status === "pending").length;

  const stats = [
    { label: "Marketplace sales", value: formatPrice(gmv) },
    { label: "Orders", value: String(orders.length) },
    { label: "Designers", value: String(vendors.length) },
    { label: "Live products", value: String(products.filter((p) => p.is_active).length) },
    { label: "Items to ship", value: String(toShip) },
    { label: "Payouts waiting", value: formatPrice(pendingPayouts.reduce((s, p) => s + Number(p.amount), 0)) },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="border border-border p-6">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-3 text-4xl">{s.value}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-14 text-3xl">Latest orders</h2>
      {!orders.length ? (
        <p className="mt-6 text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {orders.slice(0, 8).map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
              <span>#{o.id.slice(0, 8).toUpperCase()}</span>
              <span className="text-muted-foreground">{o.ship_name} · {o.ship_city}, {o.ship_country}</span>
              <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
              <span>{formatPrice(o.total)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
