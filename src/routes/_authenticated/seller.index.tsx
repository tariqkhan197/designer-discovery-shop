import { createFileRoute, Link } from "@tanstack/react-router";
import { formatPrice } from "@/lib/brand";
import { useMyVendor, useSellerOrders, useSellerProducts } from "@/lib/seller";

export const Route = createFileRoute("/_authenticated/seller/")({
  component: Overview,
});

function Overview() {
  const { user } = Route.useRouteContext();
  const { data: vendor } = useMyVendor(user.id);
  const { data: products = [] } = useSellerProducts(vendor?.id);
  const { data: lines = [] } = useSellerOrders(vendor?.id);

  const revenue = lines.filter((l) => l.fulfillment_status !== "cancelled").reduce((s, l) => s + Number(l.unit_price) * l.quantity, 0);
  const pending = lines.filter((l) => l.fulfillment_status === "pending").length;
  const lowStock = products.filter((p) => p.stock <= 3);

  const stats = [
    { label: "Sales", value: formatPrice(revenue) },
    { label: "To ship", value: pending },
    { label: "Live products", value: products.filter((p) => p.is_active).length },
    { label: "Low stock", value: lowStock.length },
  ];

  return (
    <div className="space-y-12">
      <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-background p-8">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-3 font-display text-4xl">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <div className="flex items-baseline justify-between"><h2 className="text-3xl">To ship</h2><Link to="/seller/orders" className="eyebrow">All orders</Link></div>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {lines.filter((l) => l.fulfillment_status === "pending").slice(0, 5).map((l) => (
              <li key={l.id} className="flex justify-between py-3 text-sm">
                <span>{l.product_name}{l.size && ` · ${l.size}`} × {l.quantity}</span>
                <span className="text-muted-foreground">{l.order.ship_name}</span>
              </li>
            ))}
            {!pending && <li className="py-3 text-sm text-muted-foreground">Nothing waiting to ship.</li>}
          </ul>
        </section>
        <section>
          <div className="flex items-baseline justify-between"><h2 className="text-3xl">Low stock</h2><Link to="/seller/products" className="eyebrow">Manage</Link></div>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {lowStock.slice(0, 5).map((p) => (
              <li key={p.id} className="flex justify-between py-3 text-sm">
                <span>{p.name}</span>
                <span className={p.stock === 0 ? "text-destructive" : "text-bronze"}>{p.stock} left</span>
              </li>
            ))}
            {!lowStock.length && <li className="py-3 text-sm text-muted-foreground">All products are well stocked.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
