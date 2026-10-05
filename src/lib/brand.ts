// Single source of truth for branding — change here to rebrand.
export const BRAND = {
  name: "LUXORA",
  tagline: "Curated luxury fashion and lifestyle marketplace.",
  freeShippingThreshold: 500,
  shippingFee: 25,
  currency: "USD",
};

export function formatPrice(value: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: BRAND.currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}
