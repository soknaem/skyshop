"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeProvider";
import type { TextSize, Theme } from "@/lib/prefs";

const THEMES: { value: Theme; label: string; hint: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", hint: "Always light", icon: Sun },
  { value: "dark", label: "Dark", hint: "Always dark", icon: Moon },
  { value: "system", label: "System", hint: "Follows your device, including automatic night mode", icon: Monitor },
];
const SIZES: { value: TextSize; label: string; px: string }[] = [
  { value: "small", label: "Small", px: "text-sm" },
  { value: "default", label: "Default", px: "text-base" },
  { value: "large", label: "Large", px: "text-xl" },
];

function Preview({ kind }: { kind: Theme }) {
  const light = (
    <div className="flex h-full w-full flex-col gap-1.5 bg-[#f3f5f9] p-2"><div className="h-2 w-1/2 rounded bg-[#e3e8f0]" /><div className="flex-1 rounded-md bg-white p-1.5"><div className="h-1.5 w-3/4 rounded bg-[#2457ff]" /><div className="mt-1 h-1.5 w-1/2 rounded bg-[#e3e8f0]" /></div></div>
  );
  const dark = (
    <div className="flex h-full w-full flex-col gap-1.5 bg-[#090e19] p-2"><div className="h-2 w-1/2 rounded bg-[#26314a]" /><div className="flex-1 rounded-md bg-[#111827] p-1.5"><div className="h-1.5 w-3/4 rounded bg-[#8fb0ff]" /><div className="mt-1 h-1.5 w-1/2 rounded bg-[#26314a]" /></div></div>
  );
  if (kind === "light") return light;
  if (kind === "dark") return dark;
  return <div className="relative h-full w-full"><div className="absolute inset-0">{light}</div><div className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]">{dark}</div></div>;
}

export default function AppearanceSection() {
  const { theme, setTheme, textSize, setTextSize } = useTheme();
  return (
    <div className="space-y-8">
      <section aria-labelledby="theme-h">
        <h2 id="theme-h" className="text-lg font-bold">Theme</h2>
        <p className="mb-4 text-sm text-slate-500">Choose how the site looks. The sun/moon button in the header switches between Light and Dark quickly.</p>
        <div role="radiogroup" aria-labelledby="theme-h" className="grid gap-3 sm:grid-cols-3">
          {THEMES.map((t) => {
            const on = theme === t.value;
            return (
              <button key={t.value} type="button" role="radio" aria-checked={on} onClick={() => setTheme(t.value)}
                className={`group relative rounded-2xl border-2 p-3 text-left transition ${on ? "border-brand bg-brand-soft/60 shadow-glow/20" : "border-line hover:border-brand/50"}`}>
                <div className="mb-3 h-20 overflow-hidden rounded-xl border border-line"><Preview kind={t.value} /></div>
                <p className="flex items-center gap-2 font-semibold"><t.icon className="h-4 w-4" />{t.label}{on && <Check className="ml-auto h-4 w-4 text-brand" />}</p>
                <p className="mt-0.5 text-xs text-slate-500">{t.hint}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="size-h">
        <h2 id="size-h" className="text-lg font-bold">Text size</h2>
        <p className="mb-4 text-sm text-slate-500">Scales the whole interface.</p>
        <div role="radiogroup" aria-labelledby="size-h" className="inline-flex rounded-2xl border border-line bg-mist p-1">
          {SIZES.map((s) => (
            <button key={s.value} type="button" role="radio" aria-checked={textSize === s.value} onClick={() => setTextSize(s.value)}
              className={`rounded-xl px-5 py-2.5 font-semibold transition ${s.px} ${textSize === s.value ? "bg-surface text-brand shadow-card" : "text-slate-500 hover:text-ink"}`}>
              <span aria-hidden>Aa</span><span className="sr-only">{s.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-500">Current: <b className="text-ink">{SIZES.find((s) => s.value === textSize)?.label}</b></p>
        <div className="card mt-4 p-4"><p className="font-bold">Preview</p><p className="mt-1 text-sm text-slate-500">This is how product names, prices and descriptions will look. Nova X1 Pro 5G Smartphone, <span className="font-bold text-brand">2,796,000៛</span>.</p></div>
      </section>
      <p className="text-xs text-slate-500">These settings apply instantly and are saved on this device.</p>
    </div>
  );
}
