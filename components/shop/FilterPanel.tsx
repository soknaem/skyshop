
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import CategoryIcon from "@/components/ui/CategoryIcon";
import type { Category, Facets } from "@/lib/types";

function useParamUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());

    Object.entries(changes).forEach(([k, v]) =>
      v === null || v === "" ? next.delete(k) : next.set(k, v)
    );

    next.delete("page");

    start(() => router.push(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false }));
  };

  return { sp, update, pending, pathname };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-5 first:pt-0 last:border-0">
      <h3 className="mb-3 text-sm font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1.5 text-sm">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-brand" : "bg-slate-300"}`}
      >
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </label>
  );
}

function Content({ categories, facets, currency }: { categories: Category[]; facets: Facets; currency: string }) {
  // FIX: Get pathname from useParamUpdater()
  const { sp, update, pending, pathname } = useParamUpdater();

  const category = sp.get("category") ?? "";

  const categoryHref = (slug?: string) => {
    const next = new URLSearchParams(sp.toString());

    if (slug) next.set("category", slug);
    else next.delete("category");

    next.delete("brand");
    next.delete("page");

    return `${pathname}${next.toString() ? `?${next}` : ""}`;
  };

  const brands = (sp.get("brand") ?? "").split(",").filter(Boolean);

  const [min, setMin] = useState(sp.get("min_price") ?? "");
  const [max, setMax] = useState(sp.get("max_price") ?? "");

  useEffect(() => {
    setMin(sp.get("min_price") ?? "");
    setMax(sp.get("max_price") ?? "");
  }, [sp]);

  const unit = currency === "KHR" ? "៛" : "$";
  const total = categories.reduce((n, c) => n + c.product_count, 0);

  const toggleBrand = (b: string) => {
    const next = brands.includes(b) ? brands.filter((x) => x !== b) : [...brands, b];
    update({ brand: next.join(",") || null });
  };

  const applyPrice = () => update({ min_price: min || null, max_price: max || null });

  const anyFilter = ["category", "brand", "min_price", "max_price", "in_stock", "on_sale"].some((k) => sp.get(k));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-base font-bold">
          Filters
          {pending && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        </span>

        {anyFilter && (
          <button
            type="button"
            className="text-sm font-semibold text-brand hover:underline"
            onClick={() => update({
              category: null,
              brand: null,
              min_price: null,
              max_price: null,
              in_stock: null,
              on_sale: null
            })}
          >
            Clear all
          </button>
        )}
      </div>

      <Section title="Category">
        <ul className="space-y-0.5">
          <li>
            <Link
              href={categoryHref()}
              prefetch={true}
              scroll={false}
              aria-current={!category ? "page" : undefined}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${!category ? "bg-brand-soft font-semibold text-brand" : "hover:bg-mist"}`}
            >
              All products
              <span className="text-xs text-slate-400">{total}</span>
            </Link>
          </li>

          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={categoryHref(c.slug)}
                prefetch={true}
                scroll={false}
                aria-current={category === c.slug ? "page" : undefined}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${category === c.slug ? "bg-brand-soft font-semibold text-brand" : "hover:bg-mist"}`}
              >
                <span className="flex items-center gap-2">
                  <CategoryIcon name={c.icon} className="h-4 w-4" />
                  {c.name}
                </span>
                <span className="text-xs text-slate-400">{c.product_count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {facets.brands.length > 0 && (
        <Section title="Brand">
          <ul className="space-y-1">
            {facets.brands.map((b) => (
              <li key={b.name}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 text-sm hover:bg-mist">
                  <input
                    type="checkbox"
                    checked={brands.includes(b.name)}
                    onChange={() => toggleBrand(b.name)}
                    className="h-4 w-4 rounded border-slate-300 accent-brand"
                  />
                  <span className="flex-1">{b.name}</span>
                  <span className="text-xs text-slate-400">{b.count}</span>
                </label>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={`Price (${unit})`}>
        <div className="flex items-center gap-2">
          <input
            inputMode="decimal"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            placeholder={`Min ${Math.floor(facets.price_min)}`}
            className="input !px-3 !py-2"
            aria-label="Minimum price"
          />

          <span className="text-slate-400">–</span>

          <input
            inputMode="decimal"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            placeholder={`Max ${Math.ceil(facets.price_max)}`}
            className="input !px-3 !py-2"
            aria-label="Maximum price"
          />
        </div>
      </Section>

      <Section title="Availability">
        <Toggle
          label="In stock only"
          checked={sp.get("in_stock") === "1"}
          onChange={(v) => update({ in_stock: v ? "1" : null })}
        />

        <Toggle
          label="On sale"
          checked={sp.get("on_sale") === "1"}
          onChange={(v) => update({ on_sale: v ? "1" : null })}
        />
      </Section>
    </div>
  );
}

type PanelProps = {
  categories: Category[];
  facets: Facets;
  currency: string;
  activeCount: number;
};

/** Desktop sidebar */
export default function FilterPanel(props: PanelProps) {
  return (
    <aside className="card sticky top-32 h-fit max-h-[calc(100vh-9rem)] overflow-y-auto p-5">
      <Content {...props} />
    </aside>
  );
}

/** Phones: a button that opens the same filters as a bottom sheet */
export function MobileFilters(props: PanelProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen(true)} className="btn-outline">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {props.activeCount > 0 && (
          <span className="rounded-full bg-brand px-1.5 text-xs text-white">
            {props.activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 animate-fade-in bg-night/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] animate-slide-up flex-col rounded-t-3xl bg-surface shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="text-lg font-bold">Filters</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="rounded-full p-2 hover:bg-mist"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <Content {...props} />
            </div>

            <div className="safe-bottom border-t border-line p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-primary w-full"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
