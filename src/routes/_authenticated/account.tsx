import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/brand";
import { useOrders } from "@/lib/shopper";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account — LUXORA" },
      { name: "description", content: "Your LUXORA orders and account." },
      { property: "og:title", content: "My Account — LUXORA" },
      { property: "og:description", content: "Your LUXORA orders and account." },
    ],
  }),
  component: Account,
});

function Account() {
  const { user } = Route.useRouteContext();
  const { data: orders, isLoading } = useOrders(user.id);
  const qc = useQueryClient();
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{user.email}</p>
          <h1 className="mt-3 text-5xl">My account</h1>
        </div>
        <Button variant="luxeOutline" onClick={async () => { await supabase.auth.signOut(); qc.clear(); }}>Sign out</Button>
      </div>
      <h2 className="mt-14 text-3xl">Orders</h2>
      {isLoading ? <p className="mt-6 text-muted-foreground">Loading…</p> : !orders?.length ? (
        <p className="mt-6 text-muted-foreground">No orders yet. <Link to="/shop" className="underline">Start shopping</Link></p>
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {orders.map((o) => (
            <li key={o.id}>
              <Link to="/orders/$id" params={{ id: o.id }} className="flex items-center justify-between py-5 text-sm hover:text-bronze">
                <span>#{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
                <span className="capitalize">{o.status}</span>
                <span>{formatPrice(o.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
