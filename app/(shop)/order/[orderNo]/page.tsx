import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, MapPin, Phone, Store, Truck } from "lucide-react";
import { ApiError, authed } from "@/lib/api";
import { dateTime, imageSrc, money } from "@/lib/format";
import type { Order } from "@/lib/types";
import OrderTimeline from "@/components/shop/OrderTimeline";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await params;
  let o: Order;
  try {
    o = await authed<Order>(`/api/ops/orders/${encodeURIComponent(orderNo)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const paid = o.status === "PAID";
  const pickup = o.fulfillment === "PICKUP";

  return (
    <div className="container-page max-w-3xl py-8">
      <div className={`animate-scale-in rounded-3xl p-8 text-center ${paid ? "bg-gradient-to-br from-emerald-50 to-volt-soft" : "bg-amber-50"}`}>
        {paid ? <span className="mx-auto mb-4 flex h-16 w-16 animate-pulse-ring items-center justify-center rounded-full bg-emerald-500 text-white"><CheckCircle2 className="h-9 w-9" /></span>
          : <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-white"><Clock className="h-9 w-9" /></span>}
        <h1 className="text-3xl font-bold">{paid ? "Thank you! Your order is confirmed" : "Payment not completed"}</h1>
        <p className="mt-2 text-slate-600">{paid ? `Paid on ${dateTime(o.paid_at)}` : "This order has not been paid yet."}</p>
        <p className="mt-3 inline-block rounded-full bg-surface px-4 py-1.5 font-mono text-sm font-semibold shadow-card">Order ID: {o.order_no}</p>
        {!paid && o.status !== "CANCELLED" && <div><Link href={`/checkout?order=${o.order_no}`} className="btn-primary mt-5">Go to payment</Link></div>}
      </div>

      {paid && <section className="card mt-6 animate-fade-up p-6"><h2 className="mb-5 text-lg font-bold">Order progress</h2><OrderTimeline fulfillment={o.fulfillment} status={o.fulfillment_status} /></section>}

      <section className="card mt-6 animate-fade-up p-6 [animation-delay:100ms]">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">{pickup ? <Store className="h-5 w-5 text-brand" /> : <Truck className="h-5 w-5 text-brand" />}{pickup ? "Pickup in store" : "Delivery"}</h2>
            {pickup ? (
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{o.shop.address}</p>
                <p className="flex gap-2"><Clock className="h-4 w-4 shrink-0 text-brand" />{o.shop.hours}</p>
                <p className="rounded-xl bg-mist p-3 text-ink">Show your order ID <b className="font-mono">{o.order_no}</b> at the shop.</p>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{o.shipping_address}</p>
                <p className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-brand" />{o.phone}</p>
                {o.customer_name && <p>For: {o.customer_name}</p>}
                {o.email && <p>{o.email}</p>}
              </div>
            )}
          </div>
          <div>
            <h2 className="mb-3 text-lg font-bold">Payment summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{money(o.subtotal, o.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">{pickup ? "Pickup" : "Delivery"}</dt><dd className="font-semibold">{o.delivery_fee > 0 ? money(o.delivery_fee, o.currency) : "Free"}</dd></div>
              <div className="flex items-baseline justify-between border-t border-line pt-3"><dt className="font-semibold">Total paid</dt><dd className="font-display text-2xl font-bold text-brand">{money(o.total_amount, o.currency)}</dd></div>
            </dl>
          </div>
        </div>
        <ul className="mt-6 divide-y divide-line border-t border-line">
          {o.items.map((i) => (
            <li key={i.product_id + i.product_name} className="flex items-center gap-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc(i.image_url)} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-0 flex-1"><p className="line-clamp-1 font-medium">{i.product_name}</p><p className="text-sm text-slate-500">{money(i.unit_price, o.currency)} × {i.qty}</p></div>
              <p className="font-semibold">{money(i.subtotal, o.currency)}</p>
            </li>
          ))}
        </ul>
      </section>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/account" className="btn-outline">My orders</Link><Link href="/products" className="btn-primary">Continue shopping</Link></div>
    </div>
  );
}
