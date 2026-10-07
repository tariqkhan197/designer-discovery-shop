import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/brand";
import { productImage } from "@/lib/images";
import { FULFILLMENT, useMyVendor, useSellerOrders, useSetFulfillment, type Fulfillment } from "@/lib/seller";

export const Route = createFileRoute("/_authenticated/seller/orders")({
  component: Orders,
});

function Orders() {
  const { user } = Route.useRouteContext();
  const { data: vendor } = useMyVendor(user.id);
  const { data: lines = [], isLoading } = useSellerOrders(vendor?.id);
  const setStatus = useSetFulfillment();
  const [filter, setFilter] = useState<Fulfillment | "all">("all");
  const shown = filter === "all" ? lines : lines.filter((l) => l.fulfillment_status === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-5 text-xs uppercase tracking-[0.15em]">
        {(["all", ...FULFILLMENT] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={filter === s ? "text-foreground underline underline-offset-4" : "text-muted-foreground hover:text-foreground"}>
            {s} ({s === "all" ? lines.length : lines.filter((l) => l.fulfillment_status === s).length})
          </button>
        ))}
      </div>
      {isLoading ? <p className="mt-8 text-muted-foreground">Loading…</p> : !shown.length ? (
        <p className="mt-8 border border-dashed border-border py-16 text-center text-muted-foreground">No orders here yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {shown.map((l) => (
            <li key={l.id} className="grid gap-4 py-5 md:grid-cols-[auto_1fr_1fr_auto] md:items-center">
              <img src={productImage(l.image_key)} alt="" loading="lazy" className="h-20 w-16 bg-surface object-cover" />
              <div className="text-sm">
                <p className="eyebrow">#{l.order.id.slice(0, 8).toUpperCase()} · {new Date(l.order.created_at).toLocaleDateString()}</p>
                <p className="mt-1">{l.product_name}</p>
                <p className="text-muted-foreground">{l.size && `Size ${l.size} · `}Qty {l.quantity} · {formatPrice(Number(l.unit_price) * l.quantity)}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="text-foreground">{l.order.ship_name}</p>
                <p>{l.order.ship_address}, {l.order.ship_city} {l.order.ship_postal}, {l.order.ship_country}</p>
              </div>
              <select
                aria-label="Fulfillment status"
                value={l.fulfillment_status}
                onChange={(e) => setStatus.mutate({ id: l.id, status: e.target.value as Fulfillment }, {
                  onSuccess: () => toast.success("Status updated"),
                  onError: (err) => toast.error(err.message),
                })}
                className="h-9 border border-input bg-transparent px-3 text-sm capitalize"
              >
                {FULFILLMENT.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
