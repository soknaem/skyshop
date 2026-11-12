import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import { adminApi } from "@/lib/api";
import { dateTime, money } from "@/lib/format";
import type { DayPoint, Page, ReportOrderRow, ShopConfig, Summary, TopProduct } from "@/lib/types";
import SalesChart from "@/components/admin/SalesChart";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function Dashboard() {
  const [summary, days, top, recent, cfg] = await Promise.all([
    adminApi<Summary>("/api/reports/summary"),
    adminApi<DayPoint[]>("/api/reports/sales-by-day?days=14"),
    adminApi<TopProduct[]>("/api/reports/top-products?limit=5"),
    adminApi<Page<ReportOrderRow>>("/api/reports/orders?page_size=6"),
    adminApi<ShopConfig>("/api/ops/config"),
  ]);
  const cur = summary.currency ?? cfg.currency;
  const split = summary.pickup_orders + summary.delivery_orders || 1;
  const topMax = Math.max(...top.map((t) => t.qty), 1);

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-sm text-slate-500">How the shop is doing. New orders appear here live.</p></div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (all time)" value={money(summary.total_revenue, cur)} icon={<Banknote className="h-5 w-5" />} tone="ink" />
        <StatCard label="Paid orders" value={String(summary.total_orders)} hint={`${summary.open_orders} still to complete`} icon={<ShoppingBag className="h-5 w-5" />} />
        <StatCard label="Today's revenue" value={money(summary.today_revenue, cur)} hint={`${summary.today_orders} order${summary.today_orders === 1 ? "" : "s"} today`} icon={<TrendingUp className="h-5 w-5" />} tone="volt" />
        <StatCard label="Average order" value={money(summary.average_order, cur)} icon={<Receipt className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="card p-5 sm:p-6"><h2 className="mb-5 text-lg font-bold">Revenue, last 14 days</h2><SalesChart data={days} currency={cur} /></section>
        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-bold">Pickup vs delivery</h2>
          <div className="flex h-3 overflow-hidden rounded-full bg-mist"><div className="bg-volt transition-all duration-700" style={{ width: `${(summary.pickup_orders / split) * 100}%` }} /><div className="bg-brand transition-all duration-700" style={{ width: `${(summary.delivery_orders / split) * 100}%` }} /></div>
          <dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><dt className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-volt" />Pickup in store</dt><dd className="font-semibold">{summary.pickup_orders}</dd></div><div className="flex justify-between"><dt className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-brand" />Delivery</dt><dd className="font-semibold">{summary.delivery_orders}</dd></div></dl>
          <h2 className="mb-3 mt-8 text-lg font-bold">Top products</h2>
          {top.length === 0 ? <p className="text-sm text-slate-500">No sales yet.</p> : (
            <ol className="space-y-3">{top.map((t) => (
              <li key={t.product_name} className="text-sm"><div className="mb-1 flex justify-between gap-2"><span className="truncate font-medium">{t.product_name}</span><span className="shrink-0 text-slate-500">{t.qty} sold</span></div><div className="h-1.5 overflow-hidden rounded-full bg-mist"><div className="h-full origin-left animate-grow rounded-full bg-brand" style={{ width: `${(t.qty / topMax) * 100}%`, animationName: "fade-in" }} /></div></li>
            ))}</ol>
          )}
        </section>
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between p-5"><h2 className="text-lg font-bold">Latest orders</h2><Link href="/admin/orders" className="text-sm font-semibold text-brand hover:underline">View all</Link></div>
        {recent.items.length === 0 ? <p className="px-5 pb-8 text-sm text-slate-500">Paid orders will appear here.</p> : (
          <ul className="divide-y divide-line border-t border-line">
            {recent.items.map((o) => (
              <li key={o.id}><Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 text-sm transition hover:bg-brand-soft/40">
                <span className="font-mono font-semibold text-brand">{o.order_no}</span><span className="min-w-0 flex-1 truncate">{o.customer_name}</span>
                <StatusBadge value={o.fulfillment} /><StatusBadge value={o.fulfillment_status} /><span className="font-semibold">{money(o.total_amount, o.currency)}</span><span className="text-slate-500">{dateTime(o.order_date)}</span>
              </Link></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
