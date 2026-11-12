"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Check, Package, Settings, ShieldAlert, ShoppingBag, Trash2, UserPlus, Wrench } from "lucide-react";
import { NotificationSkeleton } from "@/components/ui/Skeletons";
import { useNotifications } from "./NotificationProvider";

function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

function Icon({ type, level }: { type: string; level: string }) {
  const cls = "h-[18px] w-[18px]";
  if (type.startsWith("order")) return <ShoppingBag className={cls} />;
  if (type.startsWith("security")) return <ShieldAlert className={cls} />;
  if (type.startsWith("user")) return <UserPlus className={cls} />;
  if (type.startsWith("stock")) return <Package className={cls} />;
  if (type.startsWith("admin")) return <Wrench className={cls} />;
  return level === "success" ? <Check className={cls} /> : <Bell className={cls} />;
}

export default function NotificationBell({ settingsHref = "/settings?tab=notifications" }: { settingsHref?: string }) {
  const { items, unread, loading, live, open, markAll, clearRead } = useNotifications();
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setShow(false); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setShow(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={show} aria-haspopup="dialog"
        className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-mist">
        <Bell className={`h-[22px] w-[22px] ${unread ? "origin-top animate-[wiggle_.6s_ease]" : ""}`} />
        {unread > 0 && <span key={unread} className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-sale px-1 text-[11px] font-bold text-white">{unread > 99 ? "99+" : unread}</span>}
      </button>
      {show && (
        <div role="dialog" aria-label="Notifications" className="fixed inset-x-3 top-[4.25rem] z-50 flex max-h-[75vh] animate-scale-in flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-lift sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[400px]">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <h2 className="flex-1 text-base font-bold">Notifications {live && <span className="ml-1 inline-block h-2 w-2 animate-pulse-ring rounded-full bg-emerald-500" title="Live" />}</h2>
            {unread > 0 && <button type="button" onClick={markAll} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand hover:bg-brand-soft"><Check className="h-3.5 w-3.5" />Mark all read</button>}
            {items.some((n) => n.read) && <button type="button" onClick={clearRead} aria-label="Clear read notifications" title="Clear read" className="rounded-lg p-1.5 text-slate-500 hover:bg-mist hover:text-sale"><Trash2 className="h-4 w-4" /></button>}
            <Link href={settingsHref} onClick={() => setShow(false)} aria-label="Notification settings" className="rounded-lg p-1.5 text-slate-500 hover:bg-mist hover:text-brand"><Settings className="h-4 w-4" /></Link>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? <NotificationSkeleton /> : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-slate-500"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand"><BellOff className="h-7 w-7" /></span><p className="font-semibold text-ink">You are all caught up</p><p className="text-sm">Order updates and important messages appear here.</p></div>
            ) : (
              <ul className="divide-y divide-line">
                {items.map((n) => (
                  <li key={n.id}>
                    <button type="button" onClick={() => { open(n); setShow(false); }} className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-mist ${n.read ? "" : "bg-brand-soft/50"}`}>
                      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.level === "warning" ? "bg-amber-50 text-amber-700" : n.level === "success" ? "bg-emerald-50 text-emerald-700" : "bg-brand-soft text-brand"}`}><Icon type={n.type} level={n.level} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2"><span className={`text-sm ${n.read ? "font-medium" : "font-bold"}`}>{n.title}</span>{!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}</span>
                        {n.body && <span className="mt-0.5 line-clamp-2 block text-sm text-slate-500">{n.body}</span>}
                        <span className="mt-1 block text-xs text-slate-400">{timeAgo(n.created_at)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
