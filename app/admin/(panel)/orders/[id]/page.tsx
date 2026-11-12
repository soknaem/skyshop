import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, Store, Truck, UserRound } from "lucide-react";
import { ApiError, adminApi } from "@/lib/api";
import { dateTime, imageSrc, money } from "@/lib/format";
import type { ReportOrder, ShopConfig } from "@/lib/types";
import OrderStatusControl from "@/components/admin/OrderStatusControl";
import StatusBadge from "@/components/ui/StatusBadge";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let o: ReportOrder;
  try {
    o = await adminApi<ReportOrder>(`/api/reports/orders/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 422)) notFound();
    throw e;
  }
  const cfg = await adminApi<ShopConfig>("/api/ops/config");
  const pickup = o.fulfillment === "PICKUP";
  const row = (icon: React.ReactNode, label: string, value: string) => value ? <div className="flex gap-3"><span className="mt-0.5 text-slate-400">{icon}</span><div><p className="text-xs text-slate-500">{label}</p><p className="font-medium">{value}</p></div></div> : null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"><ArrowLeft className="h-4 w-4" />Back to orders</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-bold">Order <span className="font-mono">{o.order_no}</span></h1><StatusBadge value={o.fulfillment} /><StatusBadge value={o.fulfillment_status} /></div>
        <p className="text-sm text-slate-500">Paid on {dateTime(o.order_date)}</p>
      </div>

      <section className="card p-5 sm:p-6"><h2 className="mb-4 text-lg font-bold">Order status</h2><OrderStatusControl orderNo={o.order_no} fulfillment={o.fulfillment} status={o.fulfillment_status} /></section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="card overflow-hidden">
          <h2 className="p-5 text-lg font-bold">Purchased items</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-mist text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-3 pl-5 font-semibold">Item</th><th className="p-3 text-right font-semibold">Unit price</th><th className="p-3 text-right font-semibold">Qty</th><th className="p-3 pr-5 text-right font-semibold">Subtotal</th></tr></thead>
              <tbody>
                {o.items.map((i) => (
                  <tr key={i.product_id + i.product_name} className="border-t border-line">
                    <td className="p-3 pl-5"><div className="flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={imageSrc(i.image_url)} alt="" className="h-11 w-11 rounded-lg object-cover" /><span className="font-medium">{i.product_name}</span></div></td>
                    <td className="p-3 text-right">{money(i.unit_price, o.currency)}</td><td className="p-3 text-right">{i.qty}</td><td className="p-3 pr-5 text-right font-semibold">{money(i.subtotal, o.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="space-y-2 border-t border-line p-5 text-sm sm:ml-auto sm:max-w-xs">
            <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{money(o.subtotal, o.currency)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">{pickup ? "Pickup" : "Delivery"}</dt><dd className="font-semibold">{o.delivery_fee > 0 ? money(o.delivery_fee, o.currency) : "Free"}</dd></div>
            <div className="flex items-baseline justify-between border-t border-line pt-2"><dt className="font-semibold">Total</dt><dd className="font-display text-xl font-bold text-brand">{money(o.total_amount, o.currency)}</dd></div>
          </dl>
        </section>

        <aside className="card h-fit space-y-4 p-5 text-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold">{pickup ? <Store className="h-5 w-5 text-brand" /> : <Truck className="h-5 w-5 text-brand" />}{pickup ? "Pickup in store" : "Delivery"}</h2>
          {row(<UserRound className="h-4 w-4" />, "Customer", o.customer_name)}
          {row(<Phone className="h-4 w-4" />, "Phone", o.phone)}
          {row(<Mail className="h-4 w-4" />, "Email", o.email)}
          {pickup ? row(<MapPin className="h-4 w-4" />, "Collect at", cfg.shop_address) : row(<MapPin className="h-4 w-4" />, "Shipping address", o.shipping_address)}
          {pickup && !o.phone && !o.email && <p className="rounded-xl bg-mist p-3 text-slate-600">Pickup order: the customer gave no extra details. Match them by order ID.</p>}
        </aside>
      </div>
    </div>
  );
}
