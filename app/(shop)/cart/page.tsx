import type { Metadata } from "next";
import Link from "next/link";
import { LogIn, ShoppingCart, Store } from "lucide-react";
import { api, getCart } from "@/lib/api";
import { money } from "@/lib/format";
import { getSession } from "@/lib/session";
import type { ShopConfig } from "@/lib/types";
import EmptyState from "@/components/ui/EmptyState";
import CartRow from "@/components/shop/CartRow";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage() {
  const session = await getSession();
  if (!session) {
    return (
      <div className="container-page py-12">
        <EmptyState icon={<LogIn className="h-8 w-8" />} title="Log in to see your cart" text="You can browse freely, but you need an account to buy." href="/login?next=/cart" cta="Log in or sign up" />
      </div>
    );
  }
  const [cart, config] = await Promise.all([getCart(), api<ShopConfig>("/api/ops/config")]);
  if (cart.items.length === 0) {
    return <div className="container-page py-12"><EmptyState icon={<ShoppingCart className="h-8 w-8" />} title="Your cart is empty" text="Pick something you like and it will show up here." href="/products" cta="Browse products" /></div>;
  }
  const blocked = cart.items.some((i) => !i.available);
  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-3xl font-bold">Your cart <span className="text-lg font-medium text-slate-400">({cart.count} item{cart.count === 1 ? "" : "s"})</span></h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <ul className="card animate-fade-up divide-y divide-line overflow-hidden">
          {cart.items.map((i) => <CartRow key={i.product_id} item={i} currency={cart.currency} />)}
        </ul>
        <aside className="h-fit animate-fade-up [animation-delay:100ms] lg:sticky lg:top-32">
          <div className="card p-6">
            <h2 className="text-lg font-bold">Order summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{money(cart.total, cart.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Pickup in store</dt><dd className="font-semibold text-emerald-600">Free</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Delivery</dt><dd className="font-semibold">{config.delivery_fee > 0 ? money(config.delivery_fee, cart.currency) : "Free"}</dd></div>
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4"><span className="font-semibold">Total (pickup)</span><span className="font-display text-2xl font-bold text-brand">{money(cart.total, cart.currency)}</span></div>
            {blocked ? <p className="mt-4 rounded-xl bg-sale-soft p-3 text-sm text-sale">Please fix the items marked in red to continue.</p>
              : <Link href="/checkout" className="btn-primary mt-5 w-full !py-3.5 text-base">Checkout</Link>}
            <Link href="/products" className="btn-ghost mt-2 w-full">Continue shopping</Link>
          </div>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500"><Store className="h-4 w-4" />Choose pickup or delivery at checkout</p>
        </aside>
      </div>
    </div>
  );
}
