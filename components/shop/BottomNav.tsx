"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2x2, Home, ShoppingCart, User } from "lucide-react";

/** Thumb-friendly tab bar, phones only. */
export default function BottomNav({ cartCount, loggedIn }: { cartCount: number; loggedIn: boolean }) {
  const path = usePathname();
  const items = [
    { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
    { href: "/products", label: "Shop", icon: Grid2x2, match: (p: string) => p.startsWith("/products") },
    { href: "/cart", label: "Cart", icon: ShoppingCart, match: (p: string) => p.startsWith("/cart") || p.startsWith("/checkout") },
    { href: loggedIn ? "/account" : "/login", label: loggedIn ? "Account" : "Log in", icon: User, match: (p: string) => p.startsWith("/account") || p.startsWith("/login") },
  ];
  return (
    <nav aria-label="Main" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(path);
          return (
            <li key={href}>
              <Link href={href} className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition ${active ? "text-brand" : "text-slate-500"}`}>
                <span className="relative">
                  <Icon className={`h-[22px] w-[22px] transition ${active ? "scale-110" : ""}`} />
                  {label === "Cart" && cartCount > 0 && <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold text-white">{cartCount}</span>}
                </span>
                {label}
                {active && <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-brand" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
