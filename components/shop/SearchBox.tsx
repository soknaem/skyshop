"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { PUBLIC_API } from "@/lib/config";
import { imageSrc, money } from "@/lib/format";
import type { Page, Product } from "@/lib/types";

export default function SearchBox({ currency, autoFocus = false, onNavigate, onEscape }: { currency: string; autoFocus?: boolean; onNavigate?: () => void; onEscape?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`${PUBLIC_API}/api/ops/products?q=${encodeURIComponent(term)}&page_size=5`, { signal: ctrl.signal });
        if (r.ok) setItems(((await r.json()) as Page<Product>).items);
      } catch {}
      setLoading(false);
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function go(path: string) { setOpen(false); onNavigate?.(); router.push(path); }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (active >= 0 && items[active]) return go(`/products/${items[active].id}`);
    if (q.trim()) go(`/products?q=${encodeURIComponent(q.trim())}`);
  }
  function key(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
    if (e.key === "Escape") { setOpen(false); (e.currentTarget as HTMLInputElement).blur(); onEscape?.(); }
  }

  return (
    <div ref={box} className="relative w-full">
      <form onSubmit={submit} role="search" className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input data-search-input value={q} autoFocus={autoFocus} onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }} onFocus={() => setOpen(true)} onKeyDown={key}
          placeholder="Search phones, laptops, headphones…" aria-label="Search products (press / to focus)" aria-keyshortcuts="/"
          className="w-full rounded-full border border-transparent bg-mist py-2.5 pl-10 pr-10 text-sm transition placeholder:text-slate-400 focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10" />
        {loading && <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />}
        {!loading && !q && <kbd className="kbd pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" aria-hidden>/</kbd>}
      </form>
      {open && q.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-[70vh] animate-scale-in overflow-auto rounded-2xl border border-line bg-surface p-2 shadow-lift">
          {items.length === 0 && !loading && <p className="px-3 py-6 text-center text-sm text-slate-500">No products match “{q.trim()}”</p>}
          {items.map((p, i) => (
            <button key={p.id} type="button" onClick={() => go(`/products/${p.id}`)} onMouseEnter={() => setActive(i)}
              className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${active === i ? "bg-brand-soft" : "hover:bg-mist"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc(p.image_url)} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{p.name}</span>
                <span className="text-xs text-slate-500">{p.brand}</span>
              </span>
              <span className="text-sm font-bold text-brand">{money(p.price, currency)}</span>
            </button>
          ))}
          {items.length > 0 && (
            <button type="button" onClick={() => go(`/products?q=${encodeURIComponent(q.trim())}`)} className="mt-1 w-full rounded-xl p-2.5 text-center text-sm font-semibold text-brand hover:bg-brand-soft">
              See all results
            </button>
          )}
        </div>
      )}
    </div>
  );
}
