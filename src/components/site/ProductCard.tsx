import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/brand";
import { productImage } from "@/lib/images";

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
  return (
    <Link to="/product/$slug" params={{ slug: product.slug }} className="group block animate-rise">
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        <img
          src={productImage(product.image_key)}
          alt={product.name}
          loading="lazy"
          width={768}
          height={1024}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {onSale && <span className="eyebrow absolute left-3 top-3 bg-background px-2 py-1 text-bronze">Sale</span>}
      </div>
      <div className="mt-4 space-y-1">
        <p className="eyebrow text-foreground">{product.vendor?.name}</p>
        <p className="text-sm text-muted-foreground">{product.name}</p>
        <p className="text-sm">
          {formatPrice(product.price)}
          {onSale && <span className="ml-2 text-muted-foreground line-through">{formatPrice(product.compare_at_price!)}</span>}
        </p>
      </div>
    </Link>
  );
}

export function ProductGridSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse bg-surface" />
      ))}
    </div>
  );
}
