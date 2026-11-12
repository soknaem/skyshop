import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CreditCard, ShieldCheck, Store, Truck } from "lucide-react";
import { api, ApiError, getWishlistIds } from "@/lib/api";
import { SITE_URL } from "@/lib/config";
import { absoluteImage, money } from "@/lib/format";
import { getSession } from "@/lib/session";
import type { Product, ShopConfig } from "@/lib/types";
import Reveal from "@/components/ui/Reveal";
import ProductCard from "@/components/shop/ProductCard";
import ProductGallery from "@/components/shop/ProductGallery";
import PurchasePanel from "@/components/shop/PurchasePanel";
import SectionHeader from "@/components/shop/SectionHeader";
import ShareButtons from "@/components/shop/ShareButtons";

async function load(id: string) {
  try {
    const [product, config] = await Promise.all([api<Product>(`/api/ops/products/${id}`), api<ShopConfig>("/api/ops/config")]);
    return { product, config };
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 422)) return null;
    throw e;
  }
}

/** SEO + Open Graph so Facebook/Telegram show a nice preview when the link is shared. */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const data = await load((await params).id);
  if (!data) return { title: "Product not found" };
  const { product: p, config } = data;
  const description = `${money(p.price, config.currency)} · ${p.description}`.slice(0, 200);
  const image = absoluteImage(p.image_url);
  return {
    title: p.name, description, alternates: { canonical: `/products/${p.id}` },
    openGraph: { title: p.name, description, url: `/products/${p.id}`, siteName: config.shop_name, images: [image], type: "website" },
    twitter: { card: "summary_large_image", title: p.name, description, images: [image] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await load(id);
  if (!data) notFound();
  const { product: p, config } = data;
  const [session, wishIds, related] = await Promise.all([
    getSession(), getWishlistIds(), api<Product[]>(`/api/ops/products/${p.id}/related`).catch(() => [] as Product[]),
  ]);
  const wished = new Set(wishIds);
  const cur = config.currency;
  const specs = Object.entries(p.specs);
  const stock = p.stock_qty <= 0
    ? { text: "Out of stock", cls: "bg-sale-soft text-sale" }
    : p.stock_qty <= 5 ? { text: `Only ${p.stock_qty} left. Order soon`, cls: "bg-amber-50 text-amber-700" } : { text: "In stock", cls: "bg-emerald-50 text-emerald-700" };

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description,
    image: p.images.map(absoluteImage), brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    offers: { "@type": "Offer", price: p.price, priceCurrency: cur, availability: p.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: `${SITE_URL}/products/${p.id}` },
  };

  return (
    <div className="container-page py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-5 flex flex-wrap gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand">Home</Link>/
        {p.category ? <Link href={`/products?category=${p.category.slug}`} className="hover:text-brand">{p.category.name}</Link> : <Link href="/products" className="hover:text-brand">Products</Link>}/
        <span className="line-clamp-1 text-ink">{p.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="animate-fade-up"><div className="lg:sticky lg:top-32"><ProductGallery images={p.images} name={p.name} /></div></div>

        <div className="animate-fade-up [animation-delay:100ms]">
          <div className="flex flex-wrap items-center gap-2">
            {p.brand && <span className="chip">{p.brand}</span>}
            {p.featured && <span className="rounded-full bg-volt px-3 py-1 text-xs font-bold">Popular</span>}
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stock.cls}`}>{stock.text}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{p.name}</h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-brand">{money(p.price, cur)}</span>
            {p.compare_price && <><span className="text-lg text-slate-400 line-through">{money(p.compare_price, cur)}</span><span className="rounded-full bg-sale px-2.5 py-1 text-xs font-bold text-white">Save {p.discount_percent}%</span></>}
          </div>
          <p className="mt-5 whitespace-pre-line leading-relaxed text-slate-600">{p.description}</p>

          <div className="mt-6 card p-5"><PurchasePanel productId={p.id} stock={p.stock_qty} price={p.price} currency={cur} loggedIn={!!session} wished={wished.has(p.id)} /></div>

          <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <li className="flex gap-3"><Store className="h-5 w-5 shrink-0 text-brand" /><span><b>Free pickup</b><br /><span className="text-slate-500">{config.shop_address}</span></span></li>
            <li className="flex gap-3"><Truck className="h-5 w-5 shrink-0 text-brand" /><span><b>Delivery</b><br /><span className="text-slate-500">{config.delivery_fee > 0 ? `${money(config.delivery_fee, cur)} flat fee` : "Free delivery"}</span></span></li>
            <li className="flex gap-3"><CreditCard className="h-5 w-5 shrink-0 text-brand" /><span><b>Pay with KHQR</b><br /><span className="text-slate-500">Any Bakong banking app</span></span></li>
            {p.warranty && <li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-brand" /><span><b>{p.warranty} warranty</b><br /><span className="text-slate-500">Official shop warranty</span></span></li>}
          </ul>

          <div className="mt-6 border-t border-line pt-5">
            <ShareButtons url={`${SITE_URL}/products/${p.id}`} title={p.name} />
            <p className="mt-2 text-xs text-slate-400">Share previews on Facebook and Telegram need a public website address (not localhost).</p>
          </div>
        </div>
      </div>

      {specs.length > 0 && (
        <Reveal>
          <section className="mt-14">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold"><BadgeCheck className="h-6 w-6 text-brand" />Specifications</h2>
            <div className="card overflow-hidden">
              <dl className="divide-y divide-line">
                {specs.map(([k, v], i) => (
                  <div key={k} className={`grid grid-cols-[130px_1fr] gap-4 px-5 py-3.5 text-sm sm:grid-cols-[220px_1fr] ${i % 2 ? "bg-mist/50" : ""}`}><dt className="font-medium text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>
                ))}
              </dl>
            </div>
          </section>
        </Reveal>
      )}

      {related.length > 0 && (
        <section className="mt-14">
          <Reveal><SectionHeader title="You may also like" href={p.category ? `/products?category=${p.category.slug}` : "/products"} /></Reveal>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((r, i) => <Reveal key={r.id} delay={i * 70}><ProductCard p={r} currency={cur} wished={wished.has(r.id)} loggedIn={!!session} /></Reveal>)}
          </div>
        </section>
      )}
    </div>
  );
}
