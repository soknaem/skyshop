import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Search } from "lucide-react";
import { adminApi } from "@/lib/api";
import { imageSrc, money } from "@/lib/format";
import type { Category, Page, Product, ShopConfig } from "@/lib/types";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import Pagination from "@/components/shop/Pagination";
import StatusBadge from "@/components/ui/StatusBadge";

export const metadata: Metadata = { title: "Products", robots: { index: false } };
const SIZE = 10;

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; page?: string }> }) {
  const { q = "", category = "", page = "1" } = await searchParams;
  const pageNo = Math.max(1, parseInt(page, 10) || 1);
  const [data, cfg, cats] = await Promise.all([
    adminApi<Page<Product>>(`/api/ops/admin/products?${new URLSearchParams({ q, category, page: String(pageNo), page_size: String(SIZE) })}`),
    adminApi<ShopConfig>("/api/ops/config"),
    adminApi<Category[]>("/api/ops/admin/categories"),
  ]);
  const keep: Record<string, string> = {};
  if (q) keep.q = q;
  if (category) keep.category = category;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-bold">Products</h1><p className="text-sm text-slate-500">{data.total} in total</p></div>
        <Link href="/admin/products/new" className="btn-primary"><Plus className="h-4 w-4" />Add new product</Link>
      </div>
      <form action="/admin/products" className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input data-search-input name="q" defaultValue={q} placeholder="Search by name, brand…  (press /)" className="input !pl-9" aria-label="Search products" /></div>
        <select name="category" defaultValue={category} className="input !w-auto" aria-label="Filter by category"><option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select>
        <button className="btn-dark">Search</button>
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-mist text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-3 pl-5 font-semibold">ID</th><th className="p-3 font-semibold">Product</th><th className="p-3 font-semibold">Category</th><th className="p-3 text-right font-semibold">Price</th><th className="p-3 text-right font-semibold">Stock</th><th className="p-3 font-semibold">Status</th><th className="p-3 pr-5 text-right font-semibold">Actions</th></tr></thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-slate-500">No products found.</td></tr>}
              {data.items.map((p) => (
                <tr key={p.id} className="border-t border-line transition hover:bg-mist/50">
                  <td className="p-3 pl-5 text-slate-400">#{p.id}</td>
                  <td className="p-3"><div className="flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={imageSrc(p.image_url)} alt="" className="h-11 w-11 rounded-lg object-cover" /><div className="min-w-0"><p className="line-clamp-1 font-semibold">{p.name}</p><p className="text-xs text-slate-500">{p.brand}{p.featured ? " · Popular" : ""}</p></div></div></td>
                  <td className="p-3 text-slate-600">{p.category?.name ?? "-"}</td>
                  <td className="p-3 text-right"><span className="font-semibold">{money(p.price, cfg.currency)}</span>{p.compare_price && <span className="block text-xs text-slate-400 line-through">{money(p.compare_price, cfg.currency)}</span>}</td>
                  <td className={`p-3 text-right font-semibold ${p.stock_qty === 0 ? "text-sale" : p.stock_qty <= 5 ? "text-amber-600" : ""}`}>{p.stock_qty}</td>
                  <td className="p-3"><StatusBadge value={p.status} /></td>
                  <td className="p-3 pr-5"><div className="flex justify-end gap-1"><Link href={`/admin/products/${p.id}/edit`} aria-label={`Edit ${p.name}`} className="rounded-lg p-2 text-slate-500 transition hover:bg-brand-soft hover:text-brand"><Pencil className="h-4 w-4" /></Link><DeleteProductButton id={p.id} name={p.name} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={pageNo} total={data.total} pageSize={SIZE} basePath="/admin/products" params={keep} />
    </>
  );
}
