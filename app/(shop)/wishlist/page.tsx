import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { api, authed } from "@/lib/api";
import type { Product, ShopConfig } from "@/lib/types";
import EmptyState from "@/components/ui/EmptyState";
import ProductCard from "@/components/shop/ProductCard";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const [items, config] = await Promise.all([authed<Product[]>("/api/ops/wishlist"), api<ShopConfig>("/api/ops/config")]);
  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-3xl font-bold">Your wishlist <span className="text-lg font-medium text-slate-400">({items.length})</span></h1>
      {items.length === 0 ? (
        <EmptyState icon={<Heart className="h-8 w-8" />} title="Nothing saved yet" text="Tap the heart on any product to keep it here for later." href="/products" cta="Discover products" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p, i) => <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${(i % 8) * 50}ms` }}><ProductCard p={p} currency={config.currency} wished loggedIn /></div>)}
        </div>
      )}
    </div>
  );
}
