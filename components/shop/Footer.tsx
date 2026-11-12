import Link from "next/link";
import { Clock, MapPin, ShieldCheck, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { SHOP_NAME } from "@/lib/config";
import type { ShopConfig } from "@/lib/types";

export default async function Footer() {
  const cfg = await api<ShopConfig>("/api/ops/config", { cache: "force-cache", next: { revalidate: 60 } }).catch(() => null);
  return (
    <footer className="mt-16 bg-night text-slate-300">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 font-display text-xl font-bold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-volt text-night"><Zap className="h-5 w-5 fill-current" /></span>{cfg?.shop_name ?? SHOP_NAME}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">Genuine electronics, fair prices and fast KHQR payment. Pick up in our shop or get it delivered.</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Shop</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-white">All products</Link></li>
            <li><Link href="/products?on_sale=1" className="hover:text-white">Deals</Link></li>
            <li><Link href="/products?sort=newest" className="hover:text-white">New arrivals</Link></li>
            <li><Link href="/products?sort=popular" className="hover:text-white">Best sellers</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Account</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/account" className="hover:text-white">My orders</Link></li>
            <li><Link href="/wishlist" className="hover:text-white">Wishlist</Link></li>
            <li><Link href="/login" className="hover:text-white">Log in</Link></li>
          </ul>
        </div>
        <div className="space-y-3 text-sm">
          <p className="mb-3 text-sm font-semibold text-white">Visit us</p>
          <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-volt" />{cfg?.shop_address ?? "Phnom Penh"}</p>
          <p className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-volt" />{cfg?.shop_hours ?? ""}</p>
          <p className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-volt" />Official warranty on every product</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} {cfg?.shop_name ?? SHOP_NAME}. Pay with any Bakong-supported banking app via KHQR.</div>
    </footer>
  );
}
