import Link from "next/link";
import { ArrowRight, BadgePercent, CreditCard, Headset, ShieldCheck, Store, Truck } from "lucide-react";
import { api, getWishlistIds } from "@/lib/api";
import { getSession } from "@/lib/session";
import { imageSrc, money } from "@/lib/format";
import type { Category, Page, Product, ShopConfig } from "@/lib/types";
import CategoryIcon from "@/components/ui/CategoryIcon";
import Reveal from "@/components/ui/Reveal";
import ProductCard from "@/components/shop/ProductCard";
import SectionHeader from "@/components/shop/SectionHeader";

const list = (qs: string) => api<Page<Product>>(`/api/ops/products?${qs}`).then((r) => r.items).catch(() => [] as Product[]);

export default async function Home() {
  const [session, wishIds, config, categories, popular, deals, newest, featured] = await Promise.all([
    getSession(),
    getWishlistIds(),
    api<ShopConfig>("/api/ops/config"),
    api<Category[]>("/api/ops/categories").catch(() => [] as Category[]),
    list("sort=popular&page_size=8"),
    list("on_sale=true&sort=discount&page_size=4"),
    list("sort=newest&page_size=4"),
    list("featured=true&page_size=3"),
  ]);
  const wished = new Set(wishIds);
  const loggedIn = !!session;
  const cur = config.currency;
  const heroItems = featured.length ? featured : popular.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-night text-white">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand/40 blur-[120px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-volt/20 blur-[120px]" />
        <div className="container-page relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-volt backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-volt" />New arrivals every week
            </span>
            <h1 className="mt-5 animate-fade-up text-4xl font-bold leading-[1.05] [animation-delay:80ms] sm:text-6xl">
              Tech that <span className="relative whitespace-nowrap text-volt">keeps up<svg aria-hidden viewBox="0 0 200 12" className="absolute -bottom-1.5 left-0 w-full text-volt/60"><path d="M2 8 Q50 0 100 6 T198 4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg></span> with you.
            </h1>
            <p className="mt-5 max-w-lg animate-fade-up text-base leading-relaxed text-slate-300 [animation-delay:160ms] sm:text-lg">
              Phones, laptops, audio and gaming gear at honest prices. Pay in seconds with KHQR, then pick up in store or get it delivered.
            </p>
            <div className="mt-8 flex animate-fade-up flex-wrap gap-3 [animation-delay:240ms]">
              <Link href="/products" className="btn-volt !px-6 !py-3.5 text-base">Shop now<ArrowRight className="h-4 w-4" /></Link>
              <Link href="/products?on_sale=1" className="btn border border-white/20 !px-6 !py-3.5 text-base text-white hover:bg-white/10">View deals</Link>
            </div>
            <ul className="mt-10 grid max-w-lg animate-fade-up grid-cols-3 gap-4 text-xs text-slate-300 [animation-delay:320ms] sm:text-sm">
              <li className="flex items-center gap-2"><CreditCard className="h-4 w-4 shrink-0 text-volt" />Pay with KHQR</li>
              <li className="flex items-center gap-2"><Store className="h-4 w-4 shrink-0 text-volt" />Free pickup</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-volt" />Real warranty</li>
            </ul>
          </div>

          <div className="relative mx-auto hidden h-[440px] w-full max-w-md lg:block">
            {heroItems.slice(0, 3).map((p, i) => {
              const pos = ["left-0 top-6 w-52 rotate-[-6deg] animate-float", "right-0 top-0 w-60 rotate-[5deg] animate-float-slow", "left-14 bottom-0 w-56 rotate-[-2deg] animate-float [animation-delay:1.2s]"][i];
              return (
                <Link key={p.id} href={`/products/${p.id}`} className={`group absolute ${pos}`}>
                  <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur transition duration-500 group-hover:scale-105">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageSrc(p.image_url)} alt={p.name} className="aspect-square w-full rounded-2xl object-cover" />
                    <div className="px-2 pb-1 pt-2"><p className="truncate text-sm font-semibold">{p.name}</p><p className="text-sm font-bold text-volt">{money(p.price, cur)}</p></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="container-page -mt-8 sm:-mt-10 relative z-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((c, i) => (
              <Reveal key={c.id} delay={i * 40}>
                <Link href={`/products?category=${c.slug}`} className="card card-hover group flex flex-col items-center gap-2 p-4 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand transition duration-300 group-hover:bg-brand group-hover:text-white group-hover:shadow-glow"><CategoryIcon name={c.icon} className="h-6 w-6" /></span>
                  <span className="text-sm font-semibold leading-tight">{c.name}</span>
                  <span className="text-xs text-slate-400">{c.product_count} items</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* POPULAR */}
      <section className="container-page pt-16">
        <Reveal><SectionHeader title="Popular right now" subtitle="What other people are buying" href="/products?sort=popular" /></Reveal>
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {popular.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 70}><ProductCard p={p} currency={cur} wished={wished.has(p.id)} loggedIn={loggedIn} priority={i < 4} /></Reveal>)}
        </div>
      </section>

      {/* DEALS */}
      {deals.length > 0 && (
        <section className="mt-16 bg-night py-14">
          <div className="container-page">
            <Reveal><SectionHeader dark title="Hot deals" subtitle="Limited-time prices on selected items" href="/products?on_sale=1" /></Reveal>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {deals.map((p, i) => <Reveal key={p.id} delay={i * 70}><ProductCard p={p} currency={cur} wished={wished.has(p.id)} loggedIn={loggedIn} /></Reveal>)}
            </div>
          </div>
        </section>
      )}

      {/* NEW */}
      <section className="container-page pt-16">
        <Reveal><SectionHeader title="New arrivals" subtitle="Just landed in store" href="/products?sort=newest" /></Reveal>
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {newest.map((p, i) => <Reveal key={p.id} delay={i * 70}><ProductCard p={p} currency={cur} wished={wished.has(p.id)} loggedIn={loggedIn} /></Reveal>)}
        </div>
      </section>

      {/* WHY US */}
      <section className="container-page pt-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Store, title: "Pick up in store", text: "Order online, collect at our shop. No details to fill in." },
            { icon: Truck, title: "Delivery", text: "Just add your phone and address. We bring it to you." },
            { icon: BadgePercent, title: "Fair prices", text: "Clear prices and regular deals on popular items." },
            { icon: Headset, title: "Live support", text: "Questions? Chat with our team right on the site." },
          ].map((b, i) => (
            <Reveal key={b.title} delay={i * 80}>
              <div className="card h-full p-6"><span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-volt text-night"><b.icon className="h-5 w-5" /></span><h3 className="font-bold">{b.title}</h3><p className="mt-1 text-sm text-slate-500">{b.text}</p></div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
