"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { removeFromCart, updateCartQty } from "@/lib/actions/shop";
import { imageSrc, money } from "@/lib/format";
import type { CartItem } from "@/lib/types";
import { useToast } from "@/components/ui/Toaster";

export default function CartRow({ item, currency }: { item: CartItem; currency: string }) {
  const toast = useToast();
  const [pending, start] = useTransition();

  function setQty(qty: number) {
    start(async () => {
      const r = await updateCartQty(item.product_id, qty);
      if (!r.ok) toast.error(r.message ?? "Could not update the quantity");
    });
  }
  function remove() {
    start(async () => {
      const r = await removeFromCart(item.product_id);
      if (r.ok) toast.success(`${item.name} removed`); else toast.error(r.message ?? "Could not remove the item");
    });
  }

  return (
    <li className={`flex gap-4 p-4 transition sm:p-5 ${pending ? "opacity-60" : ""}`}>
      <Link href={`/products/${item.product_id}`} className="shrink-0 overflow-hidden rounded-xl bg-mist">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc(item.image_url)} alt="" className="h-20 w-20 object-cover sm:h-24 sm:w-24" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {item.brand && <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.brand}</p>}
            <Link href={`/products/${item.product_id}`} className="line-clamp-2 font-semibold leading-snug hover:text-brand">{item.name}</Link>
            <p className="mt-0.5 text-sm text-slate-500">{money(item.price, currency)} each</p>
          </div>
          <p className="shrink-0 font-display text-lg font-bold">{money(item.subtotal, currency)}</p>
        </div>
        {!item.available && <p className="mt-1 text-xs font-medium text-sale">{item.stock_qty > 0 ? `Only ${item.stock_qty} in stock. Lower the quantity.` : "Out of stock. Please remove it."}</p>}
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center rounded-xl border border-line bg-surface">
            <button type="button" aria-label="Decrease quantity" disabled={pending} onClick={() => setQty(item.qty - 1)} className="flex h-9 w-9 items-center justify-center rounded-l-xl transition hover:bg-mist"><Minus className="h-3.5 w-3.5" /></button>
            <span className="w-9 text-center text-sm font-semibold">{item.qty}</span>
            <button type="button" aria-label="Increase quantity" disabled={pending || item.qty >= item.stock_qty} onClick={() => setQty(item.qty + 1)} className="flex h-9 w-9 items-center justify-center rounded-r-xl transition hover:bg-mist disabled:opacity-40"><Plus className="h-3.5 w-3.5" /></button>
          </div>
          <button type="button" onClick={remove} disabled={pending} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-sale-soft hover:text-sale"><Trash2 className="h-4 w-4" />Remove</button>
        </div>
      </div>
    </li>
  );
}
