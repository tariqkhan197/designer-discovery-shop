import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductForm } from "@/components/seller/ProductForm";
import { formatPrice } from "@/lib/brand";
import { productImage } from "@/lib/images";
import { useDeleteProduct, useMyVendor, useSaveProduct, useSellerProducts, useUpdateStock, type SellerProduct } from "@/lib/seller";

export const Route = createFileRoute("/_authenticated/seller/products")({
  component: Products,
});

function Products() {
  const { user } = Route.useRouteContext();
  const { data: vendor } = useMyVendor(user.id);
  const { data: products = [], isLoading } = useSellerProducts(vendor?.id);
  const save = useSaveProduct(vendor?.id);
  const update = useUpdateStock();
  const del = useDeleteProduct();
  const [editing, setEditing] = useState<SellerProduct | "new" | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} products</p>
        <Button variant="luxe" onClick={() => setEditing("new")}><Plus /> Add product</Button>
      </div>

      {isLoading ? <p className="mt-8 text-muted-foreground">Loading…</p> : !products.length ? (
        <div className="mt-8 border border-dashed border-border py-20 text-center">
          <p className="font-display text-3xl">No products yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Add your first piece to start selling.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="eyebrow border-b border-border text-left">
                <th className="py-3 font-normal">Product</th><th className="font-normal">Price</th><th className="font-normal">Stock</th><th className="font-normal">Visible</th><th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-4">
                      <img src={productImage(p.image_key)} alt="" loading="lazy" className="h-16 w-12 bg-surface object-cover" />
                      <div><p>{p.name}</p>{p.sizes.length > 0 && <p className="text-xs text-muted-foreground">{p.sizes.join(" · ")}</p>}</div>
                    </div>
                  </td>
                  <td>{formatPrice(p.price)}</td>
                  <td>
                    <StockInput value={p.stock} onSave={(stock) => update.mutate({ id: p.id, stock }, { onSuccess: () => toast.success("Stock updated"), onError: (e) => toast.error(e.message) })} />
                  </td>
                  <td><Switch checked={p.is_active} onCheckedChange={(v) => update.mutate({ id: p.id, is_active: v })} aria-label="Visible in shop" /></td>
                  <td className="text-right">
                    <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing(p)}><Pencil /></Button>
                    <Button
                      variant="ghost" size="icon" aria-label="Delete"
                      onClick={() => { if (confirm(`Delete ${p.name}?`)) del.mutate(p.id, { onError: (e) => toast.error(e.message) }); }}
                    ><Trash2 /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none sm:max-w-xl">
          <DialogHeader><DialogTitle className="font-display text-3xl font-normal">{editing === "new" ? "New product" : "Edit product"}</DialogTitle></DialogHeader>
          {editing && (
            <ProductForm
              key={editing === "new" ? "new" : editing.id}
              userId={user.id}
              initial={editing === "new" ? undefined : editing}
              busy={save.isPending}
              onSubmit={(input) =>
                save.mutate({ id: editing === "new" ? undefined : editing.id, input }, {
                  onSuccess: () => { toast.success("Saved"); setEditing(null); },
                  onError: (e) => toast.error(e.message),
                })
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StockInput({ value, onSave }: { value: number; onSave: (n: number) => void }) {
  const [v, setV] = useState(String(value));
  const changed = Number(v) !== value;
  return (
    <div className="flex items-center gap-2">
      <Input type="number" min="0" step="1" value={v} onChange={(e) => setV(e.target.value)} className={`h-8 w-20 ${value <= 3 ? "border-bronze" : ""}`} aria-label="Stock" />
      {changed && <button className="text-xs uppercase tracking-[0.15em] underline" onClick={() => onSave(Math.max(0, Math.floor(Number(v) || 0)))}>Save</button>}
    </div>
  );
}
