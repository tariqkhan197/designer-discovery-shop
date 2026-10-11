import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { formatPrice } from "@/lib/brand";
import { useAdminProducts, useAdminUpdateProduct } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({
    meta: [
      { title: "Products — LUXORA Admin" },
      { name: "description", content: "Moderate marketplace products." },
      { property: "og:title", content: "Products — LUXORA Admin" },
      { property: "og:description", content: "Moderate marketplace products." },
    ],
  }),
  component: AdminProducts,
});

function AdminProducts() {
  const { data: products = [], isLoading } = useAdminProducts();
  const update = useAdminUpdateProduct();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!products.length) return <p className="text-muted-foreground">No products yet.</p>;

  const toggle = (id: string, patch: { is_active?: boolean; is_featured?: boolean }) =>
    update.mutate({ id, ...patch }, { onError: (e) => toast.error(e.message) });

  return (
    <ul className="divide-y divide-border border-y border-border">
      {products.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <p className="text-lg">{p.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {p.vendor?.name ?? "—"} · {formatPrice(p.price)} · {p.stock} in stock
            </p>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <label className="flex items-center gap-2">
              <Switch checked={p.is_featured} onCheckedChange={(v) => toggle(p.id, { is_featured: v })} />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <Switch checked={p.is_active} onCheckedChange={(v) => toggle(p.id, { is_active: v })} />
              Live
            </label>
          </div>
        </li>
      ))}
    </ul>
  );
}
