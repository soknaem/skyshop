import { api, getToken } from "@/lib/api";
import { SHOP_NAME } from "@/lib/config";
import { getSession } from "@/lib/session";
import type { ShopConfig } from "@/lib/types";
import AdminRealtime from "@/components/admin/AdminRealtime";
import AdminShell from "@/components/admin/AdminShell";
import NotificationProvider from "@/components/notifications/NotificationProvider";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const [session, cfg, token] = await Promise.all([getSession(), api<ShopConfig>("/api/ops/config").catch(() => null), getToken()]);
  return (
    <NotificationProvider enabled={!!token}>
      <AdminRealtime>
        <AdminShell shopName={cfg?.shop_name ?? SHOP_NAME} adminName={session?.name ?? "Admin"}>{children}</AdminShell>
      </AdminRealtime>
    </NotificationProvider>
  );
}
