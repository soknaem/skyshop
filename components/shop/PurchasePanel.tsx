"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Minus, Plus, Zap } from "lucide-react";
import { addToCart } from "@/lib/actions/shop";
import { money } from "@/lib/format";
import { useToast } from "@/components/ui/Toaster";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";

export default function PurchasePanel({ productId, stock, price, currency, loggedIn, wished }: {
  productId: number; stock: number; price: number; currency: string; loggedIn: boolean; wished: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const pathname = usePathname();
  const [qty, setQty] = useState(1);
  const [pending, start] = useTransition();
  const soldOut = stock <= 0;

  function buyNow() {
    if (!loggedIn) {
      toast.info("Please log in to buy. You can browse without an account.", { label: "Log in", href: `/login?next=${encodeURIComponent(pathname)}` });
      return;
    }
    start(async () => {
      const r = await addToCart(productId, qty);
      if (r.ok) router.push("/cart");
      else toast.error(r.message ?? "Could not add to cart");
    });
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500">Quantity</span>
          <div className="flex items-center rounded-xl border border-line bg-surface">
            <button type="button" aria-label="Decrease quantity" disabled={qty <= 1 || soldOut} onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center rounded-l-xl transition hover:bg-mist disabled:opacity-40"><Minus className="h-4 w-4" /></button>
            <input aria-label="Quantity" inputMode="numeric" value={qty} disabled={soldOut}
              onChange={(e) => { const n = parseInt(e.target.value.replace(/\D/g, ""), 10); setQty(Number.isNaN(n) ? 1 : Math.min(Math.max(1, n), Math.max(stock, 1))); }}
              className="h-11 w-12 border-x border-line text-center text-sm font-semibold focus:outline-none" />
            <button type="button" aria-label="Increase quantity" disabled={qty >= stock || soldOut} onClick={() => setQty((q) => Math.min(stock, q + 1))} className="flex h-11 w-11 items-center justify-center rounded-r-xl transition hover:bg-mist disabled:opacity-40"><Plus className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <AddToCartButton productId={productId} stock={stock} loggedIn={loggedIn} qty={qty} variant="solid" className="col-span-2 sm:col-span-1" />
          <button type="button" onClick={buyNow} disabled={pending || soldOut} className="btn-dark !py-3"><Zap className="h-4 w-4" />Buy now</button>
          <WishlistButton productId={productId} wished={wished} loggedIn={loggedIn} variant="button" className="!py-3" />
        </div>
      </div>

      {/* phones: sticky buy bar above the tab bar */}
      <div className="fixed inset-x-0 bottom-[58px] z-30 border-t border-line bg-surface/95 px-4 py-2.5 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div><p className="text-xs text-slate-500">Total</p><p className="font-display text-lg font-bold text-brand">{money(price * qty, currency)}</p></div>
          <AddToCartButton productId={productId} stock={stock} loggedIn={loggedIn} qty={qty} variant="solid" className="!py-2.5" />
        </div>
      </div>
    </>
  );
}
