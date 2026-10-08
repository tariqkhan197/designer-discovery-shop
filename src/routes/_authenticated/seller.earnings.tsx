import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/brand";
import { useMyCommissionRate, useMyVendor, usePayouts, useRequestPayout, useSellerOrders } from "@/lib/seller";

export const Route = createFileRoute("/_authenticated/seller/earnings")({
  component: Earnings,
});

const MIN_PAYOUT = 50;

function Earnings() {
  const { user } = Route.useRouteContext();
  const { data: vendor } = useMyVendor(user.id);
  const { data: rate = 0.15 } = useMyCommissionRate(user.id);
  const { data: lines = [] } = useSellerOrders(vendor?.id);
  const { data: payouts = [] } = usePayouts(vendor?.id);
  const request = useRequestPayout();

  const live = lines.filter((l) => l.fulfillment_status !== "cancelled");
  const gross = (ls: typeof lines) => ls.reduce((s, l) => s + Number(l.unit_price) * l.quantity, 0);
  const totalGross = gross(live);
  const commission = totalGross * rate;
  const delivered = gross(live.filter((l) => l.fulfillment_status === "delivered")) * (1 - rate);
  const inTransit = gross(live.filter((l) => l.fulfillment_status !== "delivered")) * (1 - rate);
  const paidOut = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const processing = payouts.filter((p) => p.status === "requested").reduce((s, p) => s + Number(p.amount), 0);
  const available = Math.max(0, delivered - paidOut - processing);

  const stats = [
    { label: "Total sales", value: formatPrice(totalGross) },
    { label: `Commission (${Math.round(rate * 100)}%)`, value: formatPrice(commission) },
    { label: "Awaiting delivery", value: formatPrice(inTransit) },
    { label: "Paid out", value: formatPrice(paidOut) },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-6 border border-border p-8">
        <div>
          <p className="eyebrow">Available to pay out</p>
          <p className="mt-3 font-display text-5xl">{formatPrice(available)}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Earnings become available once an order is marked delivered. Minimum payout {formatPrice(MIN_PAYOUT)}.
          </p>
        </div>
        <Button
          variant="luxe"
          size="xl"
          disabled={request.isPending || processing > 0 || available < MIN_PAYOUT}
          onClick={() => request.mutate(undefined, { onSuccess: () => toast.success("Payout requested"), onError: (e) => toast.error(e.message) })}
        >
          {processing > 0 ? "Payout in progress" : "Request payout"}
        </Button>
      </div>

      <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-background p-8">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-3 font-display text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-3xl">Payout history</h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {payouts.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                <span>{new Date(p.requested_at).toLocaleDateString()}</span>
                <span className={p.status === "paid" ? "text-foreground" : p.status === "rejected" ? "text-destructive" : "text-bronze"}>
                  {p.status === "requested" ? "Processing" : p.status === "paid" ? "Paid" : "Declined"}
                </span>
                <span className="font-medium">{formatPrice(p.amount)}</span>
              </li>
            ))}
            {!payouts.length && <li className="py-3 text-sm text-muted-foreground">No payouts yet.</li>}
          </ul>
        </section>
        <section>
          <h2 className="text-3xl">Earnings by sale</h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {live.slice(0, 12).map((l) => {
              const g = Number(l.unit_price) * l.quantity;
              return (
                <li key={l.id} className="flex justify-between gap-4 py-3 text-sm">
                  <span className="truncate">{l.product_name} × {l.quantity}</span>
                  <span className="whitespace-nowrap text-muted-foreground">
                    {formatPrice(g)} − {formatPrice(g * rate)} = <span className="text-foreground">{formatPrice(g * (1 - rate))}</span>
                  </span>
                </li>
              );
            })}
            {!live.length && <li className="py-3 text-sm text-muted-foreground">No sales yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
