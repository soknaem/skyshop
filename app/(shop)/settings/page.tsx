import type { Metadata } from "next";
import { Bell, Palette, ShieldCheck, User } from "lucide-react";
import { authed } from "@/lib/api";
import type { Profile } from "@/lib/types";
import AppearanceSection from "@/components/settings/AppearanceSection";
import NotificationSection from "@/components/settings/NotificationSection";
import ProfileSection from "@/components/settings/ProfileSection";
import SecuritySection from "@/components/settings/SecuritySection";
import SettingsTabs from "@/components/settings/SettingsTabs";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

const TABS = [
  { id: "profile", label: "Profile", icon: <User /> },
  { id: "security", label: "Security", icon: <ShieldCheck /> },
  { id: "appearance", label: "Appearance", icon: <Palette /> },
  { id: "notifications", label: "Notifications", icon: <Bell /> },
];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: t } = await searchParams;
  const tab = TABS.some((x) => x.id === t) ? (t as string) : "profile";
  const me = await authed<Profile>("/api/auth/me");
  const prefs = tab === "notifications"
    ? await authed<{ telegram_enabled: boolean; telegram_available: boolean }>("/api/notify/preferences").catch(() => ({ telegram_enabled: true, telegram_available: false }))
    : { telegram_enabled: true, telegram_available: false };

  return (
    <div className="container-page py-8">
      <h1 className="mb-1 text-3xl font-bold">Settings</h1>
      <p className="mb-6 text-sm text-slate-500">Manage your profile, password, how the site looks and which notifications you get.</p>
      <SettingsTabs base="/settings" tabs={TABS} active={tab}>
        {tab === "profile" && <ProfileSection me={me} />}
        {tab === "security" && <SecuritySection me={me} />}
        {tab === "appearance" && <AppearanceSection />}
        {tab === "notifications" && <NotificationSection telegramAvailable={prefs.telegram_available} telegramEnabled={prefs.telegram_enabled} />}
      </SettingsTabs>
    </div>
  );
}
