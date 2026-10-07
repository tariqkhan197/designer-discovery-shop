import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cartTotals, Totals } from "@/components/site/Totals";
import { useCart } from "@/lib/shopper";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — LUXORA" },
      { name: "description", content: "Complete your LUXORA order." },
      { property: "og:title", content: "Checkout — LUXORA" },
      { property: "og:description", content: "Complete your LUXORA order." },
    ],
  }),
  component: Checkout,
});

const FIELDS = [
  ["name", "Full name"], ["address", "Address"], ["city", "City"], ["postal", "Postal code"], ["country", "Country"],
] as const;

function Checkout() {
  const { user } = Route.useRouteContext();
  const { data: lines = [] } = useCart(user.id);
  const [form, setForm] = useState({ name: "", address: "", city: "", postal: "", country: "" });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  if (!lines.length) return (
    <div className="py-32 text-center">
      <h1 className="text-4xl">Nothing to check out</h1>
      <Link to="/shop" className="mt-6 inline-block border-b border-foreground pb-1 text-xs uppercase tracking-[0.2em]">Shop now</Link>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-16 px-5 py-14 lg:grid-cols-[1fr_340px]">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const { data, error } = await supabase.rpc("place_order", {
            _name: form.name, _address: form.address, _city: form.city, _country: form.country, _postal: form.postal,
          });
          setBusy(false);
          if (error) { toast.error(error.message); return; }
          qc.invalidateQueries();
          navigate({ to: "/orders/$id", params: { id: data as string } });
        }}
      >
        <h1 className="text-5xl">Checkout</h1>
        <p className="eyebrow mt-10">Shipping</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {FIELDS.map(([k, l]) => (
            <div key={k} className={`space-y-2 ${k === "name" || k === "address" ? "sm:col-span-2" : ""}`}>
              <Label htmlFor={k}>{l}</Label>
              <Input id={k} required maxLength={200} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
        </div>
        <p className="eyebrow mt-10">Payment</p>
        <p className="mt-3 border border-dashed border-border p-4 text-sm text-muted-foreground">
          Card payments are coming soon. Your order will be placed without charge for now.
        </p>
        <Button variant="luxe" size="xl" className="mt-10 w-full" disabled={busy}>{busy ? "Placing order…" : "Place order"}</Button>
      </form>
      <aside className="h-fit bg-surface p-8">
        <p className="eyebrow">{lines.length} item{lines.length > 1 ? "s" : ""}</p>
        <Totals {...cartTotals(lines)} />
      </aside>
    </div>
  );
}
