import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { summarize, useCanReview, useDeleteReview, useProductReviews, useSubmitReview } from "@/lib/reviews";

export function Stars({ value, size = 14, onChange }: { value: number; size?: number; onChange?: ((n: number) => void) | undefined }) {
  return (
    <span className="inline-flex gap-0.5 text-bronze" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = <Star width={size} height={size} className={n <= Math.round(value) ? "fill-current" : "opacity-40"} />;
        return onChange ? (
          <button key={n} type="button" aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange(n)}>{icon}</button>
        ) : <span key={n}>{icon}</span>;
      })}
    </span>
  );
}

export function ProductReviews({ productId, userId }: { productId: string; userId?: string | undefined }) {
  const { data: reviews = [] } = useProductReviews(productId);
  const { data: canReview } = useCanReview(productId, userId);
  const submit = useSubmitReview();
  const del = useDeleteReview();
  const mine = reviews.find((r) => r.user_id === userId);
  const [form, setForm] = useState<{ rating: number; title: string; body: string } | null>(null);
  const { count, average } = summarize(reviews);
  const f = form ?? { rating: mine?.rating ?? 0, title: mine?.title ?? "", body: mine?.body ?? "" };

  return (
    <section className="mx-auto max-w-7xl border-t border-border px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Reviews</p>
          <h2 className="mt-2 text-4xl">What clients say</h2>
        </div>
        {count > 0 && (
          <div className="flex items-center gap-3">
            <Stars value={average} size={18} />
            <span className="text-sm text-muted-foreground">{average.toFixed(1)} · {count} review{count > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {canReview && (
        <form
          className="mt-10 max-w-xl space-y-4 border border-border p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!f.rating) { toast("Please choose a rating"); return; }
            submit.mutate({ productId, ...f }, {
              onSuccess: () => { toast.success(mine ? "Review updated" : "Thank you for your review"); setForm(null); },
              onError: (err) => toast.error(err.message),
            });
          }}
        >
          <p className="eyebrow">{mine ? "Edit your review" : "Review your purchase"}</p>
          <Stars value={f.rating} size={22} onChange={(rating) => setForm({ ...f, rating })} />
          <Input placeholder="Title" maxLength={120} value={f.title} onChange={(e) => setForm({ ...f, title: e.target.value })} />
          <Textarea placeholder="Share fit, quality, and how you wear it" rows={4} maxLength={2000} value={f.body} onChange={(e) => setForm({ ...f, body: e.target.value })} />
          <div className="flex gap-3">
            <Button variant="luxe" disabled={submit.isPending}>{mine ? "Update review" : "Post review"}</Button>
            {mine && (
              <Button type="button" variant="luxeOutline" disabled={del.isPending}
                onClick={() => del.mutate(mine.id, { onSuccess: () => { toast("Review removed"); setForm(null); } })}>
                Delete
              </Button>
            )}
          </div>
        </form>
      )}

      {count === 0 ? (
        <p className="mt-10 text-muted-foreground">No reviews yet. Shoppers who buy this piece can share their thoughts here.</p>
      ) : (
        <ul className="mt-10 divide-y divide-border">
          {reviews.map((r) => <ReviewItem key={r.id} r={r} />)}
        </ul>
      )}
    </section>
  );
}

export function ReviewItem({ r, extra }: { r: { rating: number; title: string; body: string; author_name: string; created_at: string }; extra?: React.ReactNode | undefined }) {
  return (
    <li className="py-6">
      <div className="flex flex-wrap items-center gap-3">
        <Stars value={r.rating} />
        {r.title && <p className="font-medium">{r.title}</p>}
      </div>
      {extra}
      {r.body && <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">{r.body}</p>}
      <p className="mt-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {r.author_name} · Verified buyer · {new Date(r.created_at).toLocaleDateString()}
      </p>
    </li>
  );
}
