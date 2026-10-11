import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminVendors, useSetCommission } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/vendors")({
  head: () => ({
    meta: [
      { title: "Designers — LUXORA Admin" },
      { name: "description", content: "Manage designers and commission rates." },
      { property: "og:title", content: "Designers — LUXORA Admin" },
      { property: "og:description", content: "Manage designers and commission rates." },
    ],
  }),
  component: AdminVendors,
});

function CommissionCell({ id, rate }: { id: string; rate: number }) {
  const [value, setValue] = useState(String(Math.round(rate * 100)));
  const setCommission = useSetCommission();
  const pct = Number(value);
  const dirty = Number.isFinite(pct) && pct !== Math.round(rate * 100);
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        max={50}
        className="w-20"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <span className="text-sm text-muted-foreground">%</span>
      {dirty && (
        <Button
          variant="luxeOutline"
          size="sm"
          disabled={setCommission.isPending}
          onClick={() =>
            setCommission.mutate(
              { id, rate: pct / 100 },
              { onSuccess: () => toast.success("Commission updated"), onError: (e) => toast.error(e.message) },
            )
          }
        >
          Save
        </Button>
      )}
    </div>
  );
}

function AdminVendors() {
  const { data: vendors = [], isLoading } = useAdminVendors();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!vendors.length) return <p className="text-muted-foreground">No designers yet.</p>;

  return (
    <ul className="divide-y divide-border border-y border-border">
      {vendors.map((v) => (
        <li key={v.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <Link to="/designers/$slug" params={{ slug: v.slug }} className="text-lg hover:text-bronze">{v.name}</Link>
            <p className="mt-1 text-sm text-muted-foreground">
              {v.country || "—"} · joined {new Date(v.created_at).toLocaleDateString()}
              {!v.owner_id && " · sample brand (no account)"}
            </p>
          </div>
          <CommissionCell id={v.id} rate={Number(v.commission_rate)} />
        </li>
      ))}
    </ul>
  );
}
