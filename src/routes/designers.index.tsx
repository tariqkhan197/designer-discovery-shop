import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { vendorsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/designers/")({
  head: () => ({
    meta: [
      { title: "Designers — LUXORA" },
      { name: "description", content: "Meet the independent luxury houses selling on LUXORA." },
      { property: "og:title", content: "Designers — LUXORA" },
      { property: "og:description", content: "Meet the independent luxury houses selling on LUXORA." },
    ],
  }),
  component: Designers,
});

function Designers() {
  const { data } = useQuery(vendorsQuery());
  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <p className="eyebrow">The houses</p>
      <h1 className="mt-3 text-5xl">Designers</h1>
      <div className="mt-12 divide-y divide-border border-y border-border">
        {data?.map((v) => (
          <Link key={v.id} to="/designers/$slug" params={{ slug: v.slug }} className="group flex items-baseline justify-between gap-6 py-8">
            <span className="font-display text-4xl transition-colors group-hover:text-bronze">{v.name}</span>
            <span className="eyebrow">{v.country}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
