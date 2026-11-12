import type { Metadata } from "next";
import Link from "next/link";
import { Bell, ChevronRight, Heart, Package, Palette, ShieldCheck, User } from "lucide-react";
import { authed } from "@/lib/api";
import { imageSrc, initials, money, shortDate } from "@/lib/format";
import type { MyOrder, Profile } from "@/lib/types";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const [me, orders] = await Promise.all([authed<Profile>("/api/auth/me"), authed<MyOrder[]>("/api/ops/my/orders")]);
  return (
    <div className="container-page py-8">
      <div className="mb-8 flex items-center gap-4">
        {me.avatar_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={me.avatar_url} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full object-cover" />
          : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">{initials(me.name)}</span>}
        <div><h1 className="text-3xl font-bold">Hi, {me.name.split(" ")[0]}</h1><p className="text-sm text-slate-500">{me.email || "Welcome back"}</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          <h2 className="mb-4 text-xl font-bold">My orders</h2>
          {orders.length === 0 ? (
            <EmptyState icon={<Package className="h-8 w-8" />} title="No orders yet" text="When you buy something, you can follow it here." href="/products" cta="Start shopping" />
          ) : (
            <ul className="space-y-3">
              {orders.map((o, i) => (
                <li key={o.order_no} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                  <Link href={o.status === "PAID" ? `/order/${o.order_no}` : `/checkout?order=${o.order_no}`} className="card card-hover flex items-center gap-4 p-4">
                    <div className="flex -space-x-3">
                      {o.preview.map((p, n) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={n} src={imageSrc(p.image_url)} alt="" className="h-14 w-14 rounded-xl border-2 border-surface object-cover" />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-semibold">{o.order_no}</p>
                      <p className="text-xs text-slate-500">{shortDate(o.created_at)} · {o.item_count} item{o.item_count === 1 ? "" : "s"}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5"><StatusBadge value={o.fulfillment} />{o.status === "PAID" ? <StatusBadge value={o.fulfillment_status} /> : <StatusBadge value={o.status} />}</div>
                    </div>
                    <p className="font-display text-lg font-bold">{money(o.total_amount, o.currency)}</p>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="h-fit space-y-3">
          <h2 className="mb-1 text-xl font-bold">Your account</h2>
          <div className="card divide-y divide-line overflow-hidden">
            {[
              { href: "/settings?tab=profile", icon: User, title: "Profile", text: "Name, phone and picture" },
              { href: "/settings?tab=security", icon: ShieldCheck, title: "Security", text: me.provider === "local" ? "Change your password" : `Signed in with ${me.provider}` },
              { href: "/settings?tab=appearance", icon: Palette, title: "Appearance", text: "Light, dark and text size" },
              { href: "/settings?tab=notifications", icon: Bell, title: "Notifications", text: "Desktop and Telegram updates" },
              { href: "/wishlist", icon: Heart, title: "Wishlist", text: "Items you saved" },
            ].map(({ href, icon: Icon, title, text }) => (
              <Link key={href} href={href} className="flex items-center gap-3 p-4 transition hover:bg-mist">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block font-semibold">{title}</span><span className="text-sm text-slate-500">{text}</span></span>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
