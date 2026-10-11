import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useIsAdmin } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — LUXORA" },
      { name: "description", content: "LUXORA marketplace administration." },
      { property: "og:title", content: "Admin — LUXORA" },
      { property: "og:description", content: "LUXORA marketplace administration." },
    ],
  }),
  component: AdminLayout,
});

const TABS = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/vendors", label: "Designers", exact: false },
  { to: "/admin/payouts", label: "Payouts", exact: false },
  { to: "/admin/orders", label: "Orders", exact: false },
  { to: "/admin/products", label: "Products", exact: false },
] as const;

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const { data: isAdmin, isLoading } = useIsAdmin(user.id);

  if (isLoading) return <div className="py-32 text-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) {
    return (
      <div className="py-32 text-center">
        <h1 className="text-4xl">No access</h1>
        <p className="mt-4 text-muted-foreground">This area is reserved for marketplace administrators.</p>
        <Link to="/" className="mt-6 inline-block border-b border-foreground pb-1 text-xs uppercase tracking-[0.2em]">Back to the shop</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="border-b border-border pb-6">
        <p className="eyebrow">Administration</p>
        <h1 className="mt-2 text-5xl">Command center</h1>
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
