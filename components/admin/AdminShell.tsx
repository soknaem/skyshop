"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, LayoutDashboard, LogOut, Menu, MessageCircle, Package, Settings, ShoppingBag, Tags, Users, X, Zap } from "lucide-react";
import { adminLogout } from "@/lib/actions/admin";
import { initials } from "@/lib/format";
import NotificationBell from "@/components/notifications/NotificationBell";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAdminRealtime } from "./AdminRealtime";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/chat", label: "Live chat", icon: MessageCircle },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ shopName, adminName, children }: { shopName: string; adminName: string; children: React.ReactNode }) {
  const path = usePathname();
  const { unreadTotal, ordersLive } = useAdminRealtime();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const current = NAV.find((n) => path.startsWith(n.href));

  const sidebar = (
    <div className="flex h-full flex-col bg-night text-slate-300">
      <div className="flex items-center gap-2.5 px-5 py-5 font-display text-lg font-bold text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-volt text-night"><Zap className="h-5 w-5 fill-current" /></span>
        <span>{shopName}<span className="block text-[11px] font-medium uppercase tracking-widest text-slate-500">Admin</span></span>
      </div>
      <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${active ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white"}`}>
              {active && <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-volt" />}
              <Icon className={`h-[18px] w-[18px] transition ${active ? "text-volt" : "group-hover:text-volt"}`} />{label}
              {href === "/admin/chat" && unreadTotal > 0 && <span className="ml-auto animate-pop rounded-full bg-sale px-2 py-0.5 text-[11px] font-bold text-white">{unreadTotal}</span>}
            </Link>
          );
        })}
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"><ExternalLink className="h-[18px] w-[18px]" />View shop</Link>
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{initials(adminName)}</span>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{adminName}</p><p className="flex items-center gap-1.5 text-xs text-slate-400"><span className={`h-1.5 w-1.5 rounded-full ${ordersLive ? "bg-emerald-400" : "bg-slate-500"}`} />{ordersLive ? "Live" : "Offline"}</p></div>
          <form action={adminLogout}><button aria-label="Sign out" title="Sign out" className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" /></button></form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-surface/90 px-4 py-2.5 backdrop-blur sm:px-6 lg:px-8">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-xl p-2 hover:bg-mist lg:hidden"><Menu className="h-5 w-5" /></button>
          <span className="font-display font-bold lg:hidden">{shopName}</span>
          <span className="hidden font-display text-lg font-bold lg:block">{current?.label ?? "Admin"}</span>
          <div className="ml-auto flex items-center gap-1">
            {unreadTotal > 0 && <Link href="/admin/chat" className="mr-1 rounded-full bg-sale px-2.5 py-1 text-xs font-bold text-white lg:hidden">{unreadTotal} new</Link>}
            <ThemeToggle />
            <NotificationBell settingsHref="/admin/settings?tab=notifications" />
          </div>
        </header>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 animate-fade-in bg-night/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 animate-slide-in-left"><button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 z-10 rounded-full p-2 text-white hover:bg-white/10"><X className="h-5 w-5" /></button>{sidebar}</div>
          </div>
        )}
        <main id="main" tabIndex={-1} className="p-4 outline-none sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
