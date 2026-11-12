"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, LayoutDashboard, LogOut, Package, Settings, User } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { initials } from "@/lib/format";

export default function AccountMenu({ name, email, role, picture }: { name: string; email: string; role: string; picture: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const item = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-mist";
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-2.5 transition hover:border-brand">
        {picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={picture} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{initials(name)}</span>
        )}
        <ChevronDown className={`h-4 w-4 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 animate-scale-in rounded-2xl border border-line bg-surface p-2 shadow-lift">
          <div className="border-b border-line px-3 pb-3 pt-2">
            <p className="truncate font-semibold">{name}</p>
            {email && <p className="truncate text-xs text-slate-500">{email}</p>}
          </div>
          <div className="py-1.5">
            <Link href="/account" onClick={() => setOpen(false)} className={item}><Package className="h-4 w-4 text-slate-500" />My orders</Link>
            <Link href="/wishlist" onClick={() => setOpen(false)} className={item}><Heart className="h-4 w-4 text-slate-500" />Wishlist</Link>
            <Link href="/settings?tab=profile" onClick={() => setOpen(false)} className={item}><User className="h-4 w-4 text-slate-500" />Profile</Link>
            <Link href="/settings" onClick={() => setOpen(false)} className={item}><Settings className="h-4 w-4 text-slate-500" />Settings</Link>
            {role === "ADMIN" && <Link href="/admin/dashboard" onClick={() => setOpen(false)} className={item}><LayoutDashboard className="h-4 w-4 text-slate-500" />Admin panel</Link>}
          </div>
          <form action={logout} className="border-t border-line pt-1.5">
            <button className={`${item} text-sale hover:bg-sale-soft`}><LogOut className="h-4 w-4" />Sign out</button>
          </form>
        </div>
      )}
    </div>
  );
}
