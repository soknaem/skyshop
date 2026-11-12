import Link from "next/link";

export type Tab = { id: string; label: string; icon: React.ReactNode };

/** Tabs are plain links (?tab=...), so every tab can be opened directly and works without JavaScript. */
export default function SettingsTabs({ base, tabs, active, children }: { base: string; tabs: Tab[]; active: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <nav aria-label="Settings sections" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
        {tabs.map((t) => (
          <Link key={t.id} href={`${base}?tab=${t.id}`} aria-current={t.id === active ? "page" : undefined} scroll={false}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${t.id === active ? "bg-brand text-white shadow-glow" : "bg-surface text-ink-soft hover:bg-brand-soft hover:text-brand lg:bg-transparent"}`}>
            <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{t.icon}</span>{t.label}
          </Link>
        ))}
      </nav>
      <div key={active} className="min-w-0 animate-fade-up">{children}</div>
    </div>
  );
}
