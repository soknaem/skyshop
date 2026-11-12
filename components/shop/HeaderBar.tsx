"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, Settings, ShoppingCart, X, Zap } from "lucide-react";
import type { Category } from "@/lib/types";
import NotificationBell from "@/components/notifications/NotificationBell";
import CategoryIcon from "@/components/ui/CategoryIcon";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AccountMenu from "./AccountMenu";
import SearchBox from "./SearchBox";

type Session = { name: string; email: string; role: string; picture: string } | null;

export default function HeaderBar({ shopName, session, cartCount, categories, currency }: {
  shopName: string; session: Session; cartCount: number; categories: Category[]; currency: string;
}) {
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  const cartLink = (
    <Link href="/cart" aria-label={`Cart, ${cartCount} items`} className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-mist">
      <ShoppingCart className="h-[22px] w-[22px]" />
      {cartCount > 0 && (
        <span key={cartCount} className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-sale px-1 text-[11px] font-bold text-white">{cartCount}</span>
      )}
    </Link>
  );

  return (
    <header className={`sticky top-0 z-40 border-b transition-all duration-300 ${scrolled ? "border-line bg-surface/85 shadow-card backdrop-blur-xl" : "border-transparent bg-surface"}`}>
      <div className="container-page flex h-16 items-center gap-3 sm:gap-6">
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-mist lg:hidden" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu className="h-6 w-6" /></button>
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-night text-volt shadow-sm"><Zap className="h-5 w-5 fill-current" /></span>
          <span className="hidden sm:inline">{shopName}</span>
        </Link>
        <div className="hidden flex-1 md:block md:max-w-xl lg:mx-auto"><SearchBox currency={currency} /></div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button type="button" data-search-toggle className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-mist md:hidden" aria-label="Search" aria-expanded={searchOpen} onClick={() => setSearchOpen((s) => !s)}><Search className="h-[22px] w-[22px]" /></button>
          <ThemeToggle />
          <Link href="/wishlist" aria-label="Wishlist" className="hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-mist sm:flex"><Heart className="h-[22px] w-[22px]" /></Link>
          {session && <NotificationBell />}
          {cartLink}
          {session ? (
            <div className="hidden sm:block"><AccountMenu {...session} /></div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="btn-ghost">Log in</Link>
              <Link href="/register" className="btn-dark">Sign up</Link>
            </div>
          )}
        </div>
      </div>

      {searchOpen && <div className="container-page animate-fade-in pb-3 md:hidden"><SearchBox currency={currency} autoFocus onNavigate={() => setSearchOpen(false)} onEscape={() => setSearchOpen(false)} /></div>}

      {/* category bar (desktop) */}
      <nav className="hidden border-t border-line/70 lg:block" aria-label="Categories">
        <div className="container-page no-scrollbar flex h-11 items-center gap-1 overflow-x-auto">
          <Link href="/products" className="flex shrink-0 items-center rounded-lg px-3 py-1.5 text-sm font-semibold transition hover:bg-mist">All products</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:bg-brand-soft hover:text-brand">
              <CategoryIcon name={c.icon} className="h-4 w-4" />{c.name}
            </Link>
          ))}
          <Link href="/products?on_sale=1" className="ml-auto flex shrink-0 items-center rounded-lg bg-sale-soft px-3 py-1.5 text-sm font-semibold text-sale transition hover:bg-sale hover:text-white">Deals</Link>
        </div>
      </nav>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-night/50 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[84%] max-w-xs animate-slide-in-left flex-col bg-surface shadow-lift">
            <div className="flex items-center justify-between border-b border-line p-4">
              <span className="font-display text-lg font-bold">{shopName}</span>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="rounded-full p-2 hover:bg-mist"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {session ? (
                <div className="mb-3 rounded-2xl bg-mist p-3"><p className="truncate font-semibold">{session.name}</p><p className="truncate text-xs text-slate-500">{session.email}</p></div>
              ) : (
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setDrawer(false)} className="btn-outline">Log in</Link>
                  <Link href="/register" onClick={() => setDrawer(false)} className="btn-dark">Sign up</Link>
                </div>
              )}
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Shop</p>
              {[{ href: "/products", label: "All products", icon: "package" }, ...categories.map((c) => ({ href: `/products?category=${c.slug}`, label: c.name, icon: c.icon }))].map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setDrawer(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-mist"><CategoryIcon name={l.icon} className="h-5 w-5 text-brand" />{l.label}</Link>
              ))}
              <Link href="/products?on_sale=1" onClick={() => setDrawer(false)} className="mt-1 flex items-center gap-3 rounded-xl bg-sale-soft px-3 py-2.5 text-sm font-semibold text-sale">Deals and discounts</Link>
              {session && (
                <>
                  <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Account</p>
                  <Link href="/account" onClick={() => setDrawer(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-mist">My orders</Link>
                  <Link href="/wishlist" onClick={() => setDrawer(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-mist">Wishlist</Link>
                  <Link href="/settings" onClick={() => setDrawer(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-mist"><Settings className="h-5 w-5 text-brand" />Settings</Link>
                  {session.role === "ADMIN" && <Link href="/admin/dashboard" onClick={() => setDrawer(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-mist">Admin panel</Link>}
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
