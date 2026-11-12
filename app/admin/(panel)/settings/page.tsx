import type { Metadata } from "next";
import { Bell, Palette, Send, ShieldCheck, User } from "lucide-react";
import { adminApi } from "@/lib/api";
import type { Profile } from "@/lib/types";
import AppearanceSection from "@/components/settings/AppearanceSection";
import NotificationSection from "@/components/settings/NotificationSection";
import ProfileSection from "@/components/settings/ProfileSection";
import SecuritySection from "@/components/settings/SecuritySection";
import SettingsTabs from "@/components/settings/SettingsTabs";
import TelegramAlertsSection from "@/components/settings/TelegramAlertsSection";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

const TABS = [
  { id: "appearance", label: "Appearance", icon: <Palette /> },
  { id: "notifications", label: "Notifications", icon: <Bell /> },
  { id: "telegram", label: "Telegram alerts", icon: <Send /> },
  { id: "security", label: "Security", icon: <ShieldCheck /> },
  { id: "profile", label: "Profile", icon: <User /> },
];

export default async function AdminSettings({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: t } = await searchParams;
  const tab = TABS.some((x) => x.id === t) ? (t as string) : "appearance";
  const me = await adminApi<Profile>("/api/auth/me");
  const status = tab === "telegram"
    ? await adminApi<{ bot_configured: boolean; bot_username: string; alerts_enabled: boolean; chat_count: number }>("/api/notify/admin/telegram-status").catch(() => null)
    : null;
  const prefs = tab === "notifications"
    ? await adminApi<{ telegram_enabled: boolean; telegram_available: boolean }>("/api/notify/preferences").catch(() => ({ telegram_enabled: true, telegram_available: false }))
    : { telegram_enabled: true, telegram_available: false };

  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold">Settings</h1>
      <p className="mb-6 text-sm text-slate-500">Your admin account, how the panel looks, and where alerts are sent.</p>
      <SettingsTabs base="/admin/settings" tabs={TABS} active={tab}>
        {tab === "appearance" && <AppearanceSection />}
        {tab === "notifications" && <NotificationSection telegramAvailable={prefs.telegram_available} telegramEnabled={prefs.telegram_enabled} />}
        {tab === "telegram" && <TelegramAlertsSection status={status} />}
        {tab === "security" && <SecuritySection me={me} />}
        {tab === "profile" && <ProfileSection me={me} />}
      </SettingsTabs>
    </div>
  );
}
