import { createFileRoute, Link } from "@tanstack/react-router";
import { useMyVendor } from "@/lib/seller";
import { summarize, useVendorReviews } from "@/lib/reviews";
import { ReviewItem, Stars } from "@/components/site/Reviews";

export const Route = createFileRoute("/_authenticated/seller/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Seller Dashboard — LUXORA" },
      { name: "description", content: "Read shopper feedback on your products." },
      { property: "og:title", content: "Reviews — Seller Dashboard — LUXORA" },
      { property: "og:description", content: "Read shopper feedback on your products." },
    ],
  }),
  component: SellerReviews,
});

function SellerReviews() {
  const { user } = Route.useRouteContext();
  const { data: vendor } = useMyVendor(user.id);
  const { data: reviews = [], isLoading } = useVendorReviews(vendor?.id);
  const { count, average } = summarize(reviews);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  return (
    <div className="grid gap-12 md:grid-cols-[260px_1fr]">
      <div>
        <p className="eyebrow">Average rating</p>
        <p className="mt-2 text-5xl">{count ? average.toFixed(1) : "—"}</p>
        <div className="mt-2"><Stars value={average} size={16} /></div>
        <p className="mt-1 text-sm text-muted-foreground">{count} review{count === 1 ? "" : "s"}</p>
        <div className="mt-6 space-y-2">
          {dist.map(({ n, c }) => (
            <div key={n} className="flex items-center gap-3 text-sm">
              <span className="w-4">{n}</span>
              <div className="h-1.5 flex-1 bg-surface"><div className="h-full bg-bronze" style={{ width: count ? `${(c / count) * 100}%` : 0 }} /></div>
              <span className="w-6 text-right text-muted-foreground">{c}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        {count === 0 ? (
          <p className="text-muted-foreground">No reviews yet. Feedback from shoppers who buy your pieces will appear here.</p>
        ) : (
          <ul className="divide-y divide-border">
            {reviews.map((r) => (
              <ReviewItem key={r.id} r={r} extra={
                <Link to="/product/$slug" params={{ slug: r.product.slug }} className="eyebrow mt-1 inline-block hover:text-bronze">{r.product.name}</Link>
              } />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
