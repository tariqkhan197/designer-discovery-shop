import { BRAND, formatPrice } from "@/lib/brand";

export function cartTotals(lines: { quantity: number; product: { price: number } }[]) {
  const subtotal = lines.reduce((s, l) => s + Number(l.product.price) * l.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= BRAND.freeShippingThreshold ? 0 : BRAND.shippingFee;
  return { subtotal, shipping, total: subtotal + shipping };
}

export function Totals({ subtotal, shipping, total }: { subtotal: number; shipping: number; total: number }) {
  return (
    <dl className="mt-6 space-y-3 text-sm">
      <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
      <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping ? formatPrice(shipping) : "Complimentary"}</dd></div>
      <div className="flex justify-between border-t border-border pt-3 text-base"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
    </dl>
  );
}
