import Link from "next/link";
import { Flame } from "lucide-react";
import { imageSrc, money } from "@/lib/format";
import type { Product } from "@/lib/types";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";

/** The whole card is clickable: the name link is stretched over the card; buttons sit above it (z-10). */
export default function ProductCard({
  p, currency, wished, loggedIn, priority = false,
}: { p: Product; currency: string; wished: boolean; loggedIn: boolean; priority?: boolean }) {
  const low = p.stock_qty > 0 && p.stock_qty <= 5;
  return (
    <article className="card card-hover group relative flex flex-col overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-mist">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc(p.image_url)} alt={p.name} loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.06]" />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {p.discount_percent > 0 && <span className="rounded-full bg-sale px-2.5 py-1 text-xs font-bold text-white shadow">-{p.discount_percent}%</span>}
          {p.featured && <span className="inline-flex items-center gap-1 rounded-full bg-volt px-2.5 py-1 text-xs font-bold text-night shadow"><Flame className="h-3 w-3" />Popular</span>}
        </div>
        <WishlistButton productId={p.id} wished={wished} loggedIn={loggedIn} className="absolute right-3 top-3" />
        {p.stock_qty <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/65 backdrop-blur-[1px]">
            <span className="rounded-full bg-night px-3 py-1 text-xs font-semibold text-white">Out of stock</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {p.brand && <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{p.brand}</p>}
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug">
          <Link href={`/products/${p.id}`} className="after:absolute after:inset-0 after:z-[1] after:content-['']">{p.name}</Link>
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-brand">{money(p.price, currency)}</span>
          {p.compare_price && <span className="text-sm text-slate-400 line-through">{money(p.compare_price, currency)}</span>}
        </div>
        <p className="mt-1 h-4 text-xs text-slate-500">
          {low ? <span className="font-medium text-amber-600">Only {p.stock_qty} left</span> : p.sold_count >= 50 ? `${p.sold_count} sold` : ""}
        </p>
        <div className="relative z-10 mt-3">
          <AddToCartButton productId={p.id} stock={p.stock_qty} loggedIn={loggedIn} />
        </div>
      </div>
    </article>
  );
}
