import { api, getCart } from "@/lib/api";
import { SHOP_NAME } from "@/lib/config";
import { getSession } from "@/lib/session";
import type { Category, ShopConfig } from "@/lib/types";
import HeaderBar from "./HeaderBar";

const cached = { cache: "force-cache" as const, next: { revalidate: 60 } };

export default async function Header() {
  const [session, cart, categories, config] = await Promise.all([
    getSession(),
    getCart(),
    api<Category[]>("/api/ops/categories", cached).catch(() => [] as Category[]),
    api<ShopConfig>("/api/ops/config", cached).catch(() => null),
  ]);
  return (
    <HeaderBar
      shopName={config?.shop_name ?? SHOP_NAME}
      session={session ? { name: session.name, email: session.email, role: session.role, picture: session.picture } : null}
      cartCount={cart.count} categories={categories} currency={config?.currency ?? "KHR"}
    />
  );
}
