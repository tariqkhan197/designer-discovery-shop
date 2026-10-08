import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { categoriesQuery } from "@/lib/catalog";
import { productImage } from "@/lib/images";
import { uploadProductImage, type ProductInput, type SellerProduct } from "@/lib/seller";

export function ProductForm({
  userId, initial, busy, onSubmit,
}: {
  userId: string;
  initial?: SellerProduct | undefined;
  busy: boolean;
  onSubmit: (input: ProductInput) => void;
}) {
  const cats = useQuery(categoriesQuery());
  const [f, setF] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial ? String(initial.price) : "",
    compare_at_price: initial?.compare_at_price ? String(initial.compare_at_price) : "",
    sizes: initial?.sizes.join(", ") ?? "",
    stock: initial ? String(initial.stock) : "0",
    image_key: initial?.image_key ?? "",
    is_active: initial?.is_active ?? true,
    category_id: initial?.category_id ?? "",
  });
  const [uploading, setUploading] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: f.name.trim(),
          description: f.description.trim() || null,
          price: Number(f.price),
          compare_at_price: f.compare_at_price ? Number(f.compare_at_price) : null,
          sizes: f.sizes.split(",").map((s) => s.trim()).filter(Boolean),
          stock: Math.max(0, Math.floor(Number(f.stock) || 0)),
          image_key: f.image_key,
          is_active: f.is_active,
          category_id: f.category_id || null,
        });
      }}
    >
      <div className="flex gap-5">
        <div className="h-32 w-24 shrink-0 bg-surface">
          {f.image_key && <img src={productImage(f.image_key)} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="space-y-2">
          <Label htmlFor="img">Photo</Label>
          <Input
            id="img"
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              try { setF((s) => ({ ...s, image_key: "" })); const url = await uploadProductImage(userId, file); setF((s) => ({ ...s, image_key: url })); }
              catch (err) { toast.error((err as Error).message); }
              finally { setUploading(false); }
            }}
          />
          <p className="text-xs text-muted-foreground">{uploading ? "Uploading…" : "Portrait photos look best."}</p>
        </div>
      </div>
      <div className="space-y-2"><Label htmlFor="pn">Name</Label><Input id="pn" required maxLength={120} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div className="space-y-2"><Label htmlFor="pd">Description</Label><Textarea id="pd" rows={3} maxLength={2000} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2"><Label htmlFor="pp">Price ($)</Label><Input id="pp" type="number" min="1" step="0.01" required value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></div>
        <div className="space-y-2"><Label htmlFor="pc">Was price ($)</Label><Input id="pc" type="number" min="0" step="0.01" value={f.compare_at_price} onChange={(e) => setF({ ...f, compare_at_price: e.target.value })} /></div>
        <div className="space-y-2"><Label htmlFor="ps">Stock</Label><Input id="ps" type="number" min="0" step="1" required value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cat">Category</Label>
          <select id="cat" value={f.category_id} onChange={(e) => setF({ ...f, category_id: e.target.value })} className="h-9 w-full border border-input bg-transparent px-3 text-sm">
            <option value="">—</option>
            {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-2"><Label htmlFor="sz">Sizes (comma separated)</Label><Input id="sz" placeholder="S, M, L" value={f.sizes} onChange={(e) => setF({ ...f, sizes: e.target.value })} /></div>
      </div>
      <label className="flex items-center gap-3 text-sm">
        <Switch checked={f.is_active} onCheckedChange={(v) => setF({ ...f, is_active: v })} /> Visible in the shop
      </label>
      <Button variant="luxe" size="xl" className="w-full" disabled={busy || uploading}>{initial ? "Save changes" : "Add product"}</Button>
    </form>
  );
}
