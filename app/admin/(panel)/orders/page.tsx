import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { adminApi } from "@/lib/api";
import { dateTime, money } from "@/lib/format";
import type { Page, ReportOrderRow } from "@/lib/types";
import ClickableRow from "@/components/admin/ClickableRow";
import Pagination from "@/components/shop/Pagination";
import StatusBadge from "@/components/ui/StatusBadge";

export const metadata: Metadata = { title: "Order history", robots: { index: false } };
const SIZE = 10;
type SP = { q?: string; fulfillment?: string; status?: string; page?: string };

export default async function AdminOrders({ searchParams }: { searchParams: Promise<SP> }) {
  const { q = "", fulfillment = "", status = "", page = "1" } = await searchParams;
  const pageNo = Math.max(1, parseInt(page, 10) || 1);
  const data = await adminApi<Page<ReportOrderRow>>(`/api/reports/orders?${new URLSearchParams({ q, fulfillment, status, page: String(pageNo), page_size: String(SIZE) })}`);
  const keep: Record<string, string> = {};
  if (q) keep.q = q;
  if (fulfillment) keep.fulfillment = fulfillment;
  if (status) keep.status = status;
  const tab = (value: string, label: string) => {
    const p = new URLSearchParams(keep); value ? p.set("fulfillment", value) : p.delete("fulfillment");
    return <Link key={label} href={`/admin/orders?${p}`} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${fulfillment === value ? "bg-night text-white" : "bg-surface text-slate-600 hover:bg-mist"}`}>{label}</Link>;
  };

  return (
    <>
      <div className="mb-6"><h1 className="text-3xl font-bold">Order history</h1><p className="text-sm text-slate-500">Paid orders. Click any row for details and to update its status.</p></div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-2xl border border-line bg-surface p-1">{tab("", "All")}{tab("PICKUP", "Pickup")}{tab("DELIVERY", "Delivery")}</div>
        <form action="/admin/orders" className="flex flex-1 flex-wrap gap-2">
          {fulfillment && <input type="hidden" name="fulfillment" value={fulfillment} />}
          <div className="relative min-w-[200px] flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input data-search-input name="q" defaultValue={q} placeholder="Order ID, name or phone  (press /)" className="input !pl-9" aria-label="Search orders" /></div>
          <select name="status" defaultValue={status} className="input !w-auto" aria-label="Filter by status"><option value="">Any status</option><option value="PROCESSING">Preparing</option><option value="READY">Ready for pickup</option><option value="OUT_FOR_DELIVERY">Out for delivery</option><option value="COMPLETED">Completed</option></select>
          <button className="btn-dark">Filter</button>
        </form>
      </div>

      {/* desktop table */}
      <div className="card hidden overflow-hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-3 pl-5 font-semibold">Order ID</th><th className="p-3 font-semibold">Customer</th><th className="p-3 font-semibold">Phone</th><th className="p-3 font-semibold">Type</th><th className="p-3 font-semibold">Status</th><th className="p-3 text-right font-semibold">Total</th><th className="p-3 pr-5 font-semibold">Order date</th></tr></thead>
          <tbody>
            {data.items.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-slate-500">No orders found.</td></tr>}
            {data.items.map((o) => (
              <ClickableRow key={o.id} href={`/admin/orders/${o.id}`}>
                <td className="p-3 pl-5 font-mono font-semibold text-brand">{o.order_no}</td><td className="p-3">{o.customer_name}</td><td className="p-3 text-slate-600">{o.phone || "-"}</td>
                <td className="p-3"><StatusBadge value={o.fulfillment} /></td><td className="p-3"><StatusBadge value={o.fulfillment_status} /></td>
                <td className="p-3 text-right font-semibold">{money(o.total_amount, o.currency)}</td><td className="p-3 pr-5 text-slate-600">{dateTime(o.order_date)}</td>
              </ClickableRow>
            ))}
          </tbody>
        </table>
      </div>

      {/* phone cards */}
      <ul className="space-y-3 md:hidden">
        {data.items.length === 0 && <li className="card p-8 text-center text-sm text-slate-500">No orders found.</li>}
        {data.items.map((o) => (
          <li key={o.id}><Link href={`/admin/orders/${o.id}`} className="card card-hover block p-4">
            <div className="flex items-center justify-between"><span className="font-mono text-sm font-semibold text-brand">{o.order_no}</span><span className="font-display font-bold">{money(o.total_amount, o.currency)}</span></div>
            <p className="mt-1 text-sm">{o.customer_name}{o.phone ? ` · ${o.phone}` : ""}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5"><StatusBadge value={o.fulfillment} /><StatusBadge value={o.fulfillment_status} /><span className="ml-auto text-xs text-slate-500">{dateTime(o.order_date)}</span></div>
          </Link></li>
        ))}
      </ul>
      <Pagination page={pageNo} total={data.total} pageSize={SIZE} basePath="/admin/orders" params={keep} />
    </>
  );
}
