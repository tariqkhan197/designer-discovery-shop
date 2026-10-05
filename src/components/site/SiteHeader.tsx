import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { BRAND } from "@/lib/brand";
import { useCart, useUser } from "@/lib/shopper";

const NAV = [
  { label: "New In", to: "/shop", search: {} },
  { label: "Ready-to-Wear", to: "/shop", search: { category: "ready-to-wear" } },
  { label: "Bags", to: "/shop", search: { category: "bags" } },
  { label: "Shoes", to: "/shop", search: { category: "shoes" } },
  { label: "Accessories", to: "/shop", search: { category: "accessories" } },
] as const;

export function SiteHeader() {
  const { user } = useUser();
  const { data: cart } = useCart(user?.id);
  const count = cart?.reduce((n, l) => n + l.quantity, 0) ?? 0;
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="bg-primary py-2 text-center text-[0.65rem] uppercase tracking-[0.3em] text-primary-foreground">
        Complimentary shipping on orders over ${BRAND.freeShippingThreshold}
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-5 py-5">
        <form
          className="hidden items-center gap-2 border-b border-border pb-1 md:flex md:w-56"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/shop", search: { q: q || undefined } });
          }}
        >
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            aria-label="Search products"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>
        <Link to="/" className="col-start-2 justify-self-center font-display text-3xl tracking-[0.35em]">
          {BRAND.name}
        </Link>
        <div className="col-start-3 flex items-center justify-end gap-5">
          <Link to={user ? "/account" : "/auth"} aria-label="Account"><User className="size-5" /></Link>
          <Link to="/wishlist" aria-label="Wishlist"><Heart className="size-5" /></Link>
          <Link to="/bag" aria-label="Shopping bag" className="relative">
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-bronze text-[0.6rem] text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-5 pb-4 md:justify-center">
        {NAV.map((n) => (
          <Link key={n.label} to={n.to} search={n.search} className="eyebrow whitespace-nowrap text-foreground hover:text-bronze">
            {n.label}
          </Link>
        ))}
        <Link to="/designers" className="eyebrow whitespace-nowrap text-foreground hover:text-bronze">Designers</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl tracking-[0.3em]">{BRAND.name}</p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{BRAND.tagline}</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="eyebrow">Shop</p>
          <Link to="/shop" className="block hover:text-bronze">All products</Link>
          <Link to="/designers" className="block hover:text-bronze">Designers</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="eyebrow">Account</p>
          <Link to="/account" className="block hover:text-bronze">My orders</Link>
          <Link to="/wishlist" className="block hover:text-bronze">Wishlist</Link>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} {BRAND.name}</p>
    </footer>
  );
}
