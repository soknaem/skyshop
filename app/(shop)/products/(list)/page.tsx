import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, X } from "lucide-react";
import { api, getWishlistIds } from "@/lib/api";
import { getSession } from "@/lib/session";
import { money } from "@/lib/format";
import type { Category, Facets, Page, Product, ShopConfig } from "@/lib/types";
import EmptyState from "@/components/ui/EmptyState";
import FilterPanel, { MobileFilters } from "@/components/shop/FilterPanel";
import Pagination from "@/components/shop/Pagination";
import ProductCard from "@/components/shop/ProductCard";
import SortSelect from "@/components/shop/SortSelect";

const SIZE = 12;

// Public catalog data can be cached safely for a short period.
// Keep the TTL short because stock and product details can change.
const CATALOG_CACHE = { cache: "force-cache" as const, next: { revalidate: 10 } };
const FACETS_CACHE = { cache: "force-cache" as const, next: { revalidate: 30 } };
const SHOP_CACHE = { cache: "force-cache" as const, next: { revalidate: 60 } };

type SP = Record<string, string | undefined>;

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  return { title: sp.q ? `Search: ${sp.q}` : sp.category ? `${sp.category.replace(/-/g, " ")}` : "All products" };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const pageNo = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const qs = new URLSearchParams();
  for (const k of ["q", "category", "brand", "min_price", "max_price", "sort"]) if (sp[k]) qs.set(k, sp[k]!);
  for (const k of ["in_stock", "on_sale", "featured"]) if (sp[k] === "1") qs.set(k, "true");
  qs.set("page", String(pageNo));
  qs.set("page_size", String(SIZE));

  const [session, wishIds, config, categories, facets, data] = await Promise.all([
    getSession(),
    getWishlistIds(),
    api<ShopConfig>("/api/ops/config", SHOP_CACHE),
    api<Category[]>("/api/ops/categories", SHOP_CACHE),
    api<Facets>(`/api/ops/products/facets?${new URLSearchParams({ q: sp.q ?? "", category: sp.category ?? "" })}`, FACETS_CACHE),
    api<Page<Product>>(`/api/ops/products?${qs}`, CATALOG_CACHE),
  ]);
  const wished = new Set(wishIds);
  const cat = categories.find((c) => c.slug === sp.category);

  // active filter chips (each chip is a plain link that removes that filter)
  const without = (...keys: string[]) => {
    const next = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && !keys.includes(k) && k !== "page") as [string, string][]);
    return `/products${next.toString() ? `?${next}` : ""}`;
  };
  const chips: { label: string; href: string }[] = [];
  if (sp.q) chips.push({ label: `“${sp.q}”`, href: without("q") });
  if (cat) chips.push({ label: cat.name, href: without("category", "brand") });
  (sp.brand ?? "").split(",").filter(Boolean).forEach((b) => chips.push({ label: b, href: without("brand") }));
  if (sp.min_price || sp.max_price) chips.push({ label: `${sp.min_price ? money(Number(sp.min_price), config.currency) : "Any"} – ${sp.max_price ? money(Number(sp.max_price), config.currency) : "Any"}`, href: without("min_price", "max_price") });
  if (sp.in_stock === "1") chips.push({ label: "In stock", href: without("in_stock") });
  if (sp.on_sale === "1") chips.push({ label: "On sale", href: without("on_sale") });
  const activeCount = ["category", "brand", "min_price", "max_price", "in_stock", "on_sale"].filter((k) => sp[k]).length;
  const keep = Object.fromEntries(Object.entries(sp).filter(([k, v]) => v && k !== "page")) as Record<string, string>;

  return (
    <div className="container-page py-8">
      <nav className="mb-3 text-sm text-slate-500" aria-label="Breadcrumb"><Link href="/" className="hover:text-brand">Home</Link> / <span className="text-ink">{cat?.name ?? "All products"}</span></nav>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{sp.q ? `Results for “${sp.q}”` : cat?.name ?? "All products"}</h1>
          <p className="mt-1 text-sm text-slate-500">{data.total} product{data.total === 1 ? "" : "s"}</p>
        </div>
        <div className="flex items-center gap-2"><MobileFilters categories={categories} facets={facets} currency={config.currency} activeCount={activeCount} /><SortSelect /></div>
      </div>

      {chips.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {chips.map((c, i) => <Link key={c.label + i} href={c.href} className="chip transition hover:bg-brand hover:text-white">{c.label}<X className="h-3 w-3" /></Link>)}
          <Link href="/products" className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-brand">Clear all</Link>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block"><FilterPanel categories={categories} facets={facets} currency={config.currency} activeCount={activeCount} /></div>
        <div>
          {data.items.length === 0 ? (
            <EmptyState icon={<PackageSearch className="h-8 w-8" />} title="No products found" text="Try removing a filter or searching for something else." href="/products" cta="Clear filters" />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {data.items.map((p, i) => <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${(i % 8) * 40}ms` }}><ProductCard p={p} currency={config.currency} wished={wished.has(p.id)} loggedIn={!!session} priority={i < 4} /></div>)}
            </div>
          )}
          <Pagination page={pageNo} total={data.total} pageSize={SIZE} basePath="/products" params={keep} />
        </div>
      </div>
    </div>
  );
}
