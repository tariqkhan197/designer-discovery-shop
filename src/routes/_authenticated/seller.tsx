import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBecomeVendor, useMyVendor } from "@/lib/seller";

export const Route = createFileRoute("/_authenticated/seller")({
  head: () => ({
    meta: [
      { title: "Seller Dashboard — LUXORA" },
      { name: "description", content: "Manage your products, inventory and orders on LUXORA." },
      { property: "og:title", content: "Seller Dashboard — LUXORA" },
      { property: "og:description", content: "Manage your products, inventory and orders on LUXORA." },
    ],
  }),
  component: SellerLayout,
});

const TABS = [
  { to: "/seller", label: "Overview", exact: true },
  { to: "/seller/products", label: "Products & stock", exact: false },
  { to: "/seller/orders", label: "Orders", exact: false },
] as const;

function SellerLayout() {
  const { user } = Route.useRouteContext();
  const { data: vendor, isLoading } = useMyVendor(user.id);

  if (isLoading) return <div className="py-32 text-center text-muted-foreground">Loading…</div>;
  if (!vendor) return <Onboarding />;

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="eyebrow">Seller dashboard</p>
          <h1 className="mt-2 text-5xl">{vendor.name}</h1>
        </div>
        <Link to="/designers/$slug" params={{ slug: vendor.slug }} className="border-b border-foreground pb-1 text-xs uppercase tracking-[0.2em]">
          View my shop
        </Link>
      </div>
      <nav className="mt-6 flex gap-8 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={{ exact: t.exact }}
            className="eyebrow whitespace-nowrap pb-2"
            activeProps={{ className: "border-b border-foreground text-foreground" }}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="mt-10"><Outlet /></div>
    </div>
  );
}

function Onboarding() {
  const [f, setF] = useState({ name: "", country: "", story: "" });
  const become = useBecomeVendor();
  return (
    <div className="mx-auto max-w-lg px-5 py-20">
      <p className="eyebrow text-center">Sell on LUXORA</p>
      <h1 className="mt-3 text-center text-5xl">Open your shop</h1>
      <p className="mt-4 text-center text-muted-foreground">Tell shoppers about your house. You can add products right after.</p>
      <form
        className="mt-10 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          become.mutate(f, {
            onSuccess: () => toast.success("Your shop is open"),
            onError: (err) => toast.error(err.message),
          });
        }}
      >
        <div className="space-y-2"><Label htmlFor="sn">Shop name</Label><Input id="sn" required maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="space-y-2"><Label htmlFor="sc">Country</Label><Input id="sc" maxLength={80} value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} /></div>
        <div className="space-y-2"><Label htmlFor="ss">Your story</Label><Textarea id="ss" maxLength={1000} rows={4} value={f.story} onChange={(e) => setF({ ...f, story: e.target.value })} /></div>
        <Button variant="luxe" size="xl" className="w-full" disabled={become.isPending}>Open my shop</Button>
      </form>
    </div>
  );
}
