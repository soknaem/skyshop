"use client";

import { useActionState, useEffect, useState } from "react";
import { Clock, MapPin, Store, Truck } from "lucide-react";
import { placeOrder } from "@/lib/actions/shop";
import { imageSrc, money } from "@/lib/format";
import type { Cart, ShopConfig } from "@/lib/types";
import { useToast } from "@/components/ui/Toaster";

type Defaults = { name: string; email: string; phone: string };

export default function CheckoutForm({ cart, config, defaults }: { cart: Cart; config: ShopConfig; defaults: Defaults }) {
  const toast = useToast();
  const [state, action, pending] = useActionState(placeOrder, undefined);
  const [mode, setMode] = useState<"PICKUP" | "DELIVERY">(state?.values?.fulfillment === "DELIVERY" ? "DELIVERY" : "PICKUP");
  const v = state?.values ?? {};
  const fee = mode === "DELIVERY" ? config.delivery_fee : 0;

  useEffect(() => { if (state?.error) toast.error(state.error); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const option = (value: "PICKUP" | "DELIVERY", title: string, sub: string, Icon: typeof Store) => (
    <button type="button" role="radio" aria-checked={mode === value} onClick={() => setMode(value)}
      className={`relative flex flex-1 items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${mode === value ? "border-brand bg-brand-soft shadow-glow/20" : "border-line bg-surface hover:border-brand/40"}`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${mode === value ? "bg-brand text-white" : "bg-mist text-slate-500"}`}><Icon className="h-5 w-5" /></span>
      <span><span className="block font-semibold">{title}</span><span className="text-sm text-slate-500">{sub}</span></span>
      <span className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${mode === value ? "border-brand bg-brand" : "border-slate-300"}`}>{mode === value && <span className="h-2 w-2 rounded-full bg-surface" />}</span>
    </button>
  );

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <input type="hidden" name="fulfillment" value={mode} />
      <div className="space-y-6">
        <section className="card animate-fade-up p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-bold">How do you want to get your order?</h2>
          <div role="radiogroup" aria-label="Fulfillment" className="flex flex-col gap-3 sm:flex-row">
            {option("PICKUP", "Pick up in store", "Free. Nothing to fill in.", Store)}
            {option("DELIVERY", "Delivery", config.delivery_fee > 0 ? `${money(config.delivery_fee, cart.currency)} delivery fee` : "Free delivery to your address", Truck)}
          </div>
        </section>

        {mode === "PICKUP" ? (
          <section key="pickup" className="card animate-scale-in p-5 sm:p-6">
            <h2 className="mb-1 text-lg font-bold">Pickup details</h2>
            <p className="mb-4 text-sm text-slate-500">No personal details needed. Pay with KHQR next, then show your order ID at the shop.</p>
            <div className="space-y-3 rounded-2xl bg-mist p-4 text-sm">
              <p className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" /><span><b className="block">{config.shop_name}</b>{config.shop_address}</span></p>
              <p className="flex gap-3"><Clock className="h-5 w-5 shrink-0 text-brand" />{config.shop_hours}</p>
            </div>
          </section>
        ) : (
          <section key="delivery" className="card animate-scale-in space-y-4 p-5 sm:p-6">
            <div><h2 className="text-lg font-bold">Delivery details</h2><p className="text-sm text-slate-500">We only need a phone number and an address. Name and email are optional.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="phone">Phone number <span className="text-sale">*</span></label><input id="phone" name="phone" type="tel" required minLength={6} defaultValue={v.phone ?? defaults.phone} className="input" autoComplete="tel" placeholder="012 345 678" /></div>
              <div><label className="label" htmlFor="full_name">Name <span className="font-normal text-slate-400">(optional)</span></label><input id="full_name" name="full_name" defaultValue={v.full_name ?? defaults.name} className="input" autoComplete="name" /></div>
            </div>
            <div><label className="label" htmlFor="shipping_address">Delivery address <span className="text-sale">*</span></label><textarea id="shipping_address" name="shipping_address" required minLength={5} rows={3} defaultValue={v.shipping_address} className="input" autoComplete="street-address" placeholder="House no., street, sangkat, khan, city" /></div>
            <div><label className="label" htmlFor="email">Email <span className="font-normal text-slate-400">(optional)</span></label><input id="email" name="email" type="email" defaultValue={v.email ?? defaults.email} className="input" autoComplete="email" /></div>
          </section>
        )}
      </div>

      <aside className="h-fit animate-fade-up [animation-delay:100ms] lg:sticky lg:top-32">
        <div className="card p-6">
          <h2 className="text-lg font-bold">Order summary</h2>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {cart.items.map((i) => (
              <li key={i.product_id} className="flex items-center gap-3 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc(i.image_url)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <span className="min-w-0 flex-1"><span className="line-clamp-1 font-medium">{i.name}</span><span className="text-slate-500">× {i.qty}</span></span>
                <span className="font-semibold">{money(i.subtotal, cart.currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{money(cart.total, cart.currency)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">{mode === "PICKUP" ? "Pickup" : "Delivery"}</dt><dd className="font-semibold">{fee > 0 ? money(fee, cart.currency) : "Free"}</dd></div>
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-4"><span className="font-semibold">Total</span><span className="font-display text-2xl font-bold text-brand">{money(cart.total + fee, cart.currency)}</span></div>
          <button className="btn-primary mt-5 w-full !py-3.5 text-base" disabled={pending}>
            {pending ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Creating your KHQR code…</> : "Continue to KHQR payment"}
          </button>
        </div>
      </aside>
    </form>
  );
}
