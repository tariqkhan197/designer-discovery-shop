import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/brand";
import { useAdminPayouts, useSetPayoutStatus } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/payouts")({
  head: () => ({
    meta: [
      { title: "Payouts — LUXORA Admin" },
      { name: "description", content: "Review and settle designer payouts." },
      { property: "og:title", content: "Payouts — LUXORA Admin" },
      { property: "og:description", content: "Review and settle designer payouts." },
    ],
  }),
  component: AdminPayouts,
});

const STATUS_LABEL: Record<string, string> = { requested: "Processing", paid: "Paid", rejected: "Declined" };

function AdminPayouts() {
  const { data: payouts = [], isLoading } = useAdminPayouts();
  const setStatus = useSetPayoutStatus();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!payouts.length) return <p className="text-muted-foreground">No payout requests yet.</p>;

  return (
    <ul className="divide-y divide-border border-y border-border">
      {payouts.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <p className="text-lg">{p.vendor?.name ?? "Unknown shop"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Requested {new Date(p.requested_at).toLocaleDateString()}
              {p.paid_at && ` · paid ${new Date(p.paid_at).toLocaleDateString()}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg">{formatPrice(p.amount)}</span>
            <span className="text-sm capitalize text-muted-foreground">{STATUS_LABEL[p.status] ?? p.status}</span>
            {p.status === "requested" && (
              <div className="flex gap-2">
                <Button
                  variant="luxe"
                  size="sm"
                  disabled={setStatus.isPending}
                  onClick={() =>
                    setStatus.mutate(
                      { id: p.id, status: "paid" },
                      { onSuccess: () => toast.success("Payout marked as paid"), onError: (e) => toast.error(e.message) },
                    )
                  }
                >
                  Mark paid
                </Button>
                <Button
                  variant="luxeOutline"
                  size="sm"
                  disabled={setStatus.isPending}
                  onClick={() =>
                    setStatus.mutate(
                      { id: p.id, status: "rejected" },
                      { onSuccess: () => toast.success("Payout declined"), onError: (e) => toast.error(e.message) },
                    )
                  }
                >
                  Decline
                </Button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
