"use client";

import { useEffect, useState, useTransition } from "react";
import { BellRing, Send } from "lucide-react";
import { setTelegramPref } from "@/lib/actions/auth";
import { KEYS } from "@/lib/prefs";
import { useToast } from "@/components/ui/Toaster";

function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${checked ? "bg-brand" : "bg-slate-300"}`}>
      <span className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

export default function NotificationSection({ telegramAvailable, telegramEnabled }: { telegramAvailable: boolean; telegramEnabled: boolean }) {
  const toast = useToast();
  const [supported, setSupported] = useState(true);
  const [perm, setPerm] = useState<NotificationPermission>("default");
  const [on, setOn] = useState(false);
  const [tg, setTg] = useState(telegramEnabled);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (typeof Notification === "undefined") { setSupported(false); return; }
    setPerm(Notification.permission);
    setOn(Notification.permission === "granted" && localStorage.getItem(KEYS.desktop) === "1");
  }, []);

  async function toggleDesktop(next: boolean) {
    if (!next) { localStorage.removeItem(KEYS.desktop); setOn(false); toast.info("Desktop notifications turned off"); return; }
    let p = Notification.permission;
    if (p === "default") p = await Notification.requestPermission();   // the browser asks now
    setPerm(p);
    if (p === "granted") { localStorage.setItem(KEYS.desktop, "1"); setOn(true); toast.success("Desktop notifications turned on"); }
    else { setOn(false); toast.error("Your browser blocked notifications for this site. Allow them in the address bar, then try again."); }
  }

  function test() {
    try {
      const n = new Notification("This is a test notification", { body: "Clicking a real one opens the right page.", icon: "/products/placeholder.svg" });
      n.onclick = () => { window.focus(); n.close(); };
    } catch { toast.error("Could not show a notification"); }
  }

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"><BellRing className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">Desktop notifications</h2>
            <p className="mt-0.5 text-sm text-slate-500">When this site is open in a background tab, a new notification appears as a system notification. Clicking it opens the right page.</p>
            {!supported && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">This browser does not support desktop notifications.</p>}
            {supported && perm === "denied" && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Notifications are blocked for this site. Click the lock icon in the address bar, allow notifications, then switch this on.</p>}
            {supported && on && <button type="button" onClick={test} className="btn-outline mt-3 !py-2">Send a test notification</button>}
          </div>
          <Switch checked={on} onChange={toggleDesktop} label="Desktop notifications" disabled={!supported} />
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#229ed9]/10 text-[#229ed9]"><Send className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">Telegram messages</h2>
            {telegramAvailable
              ? <p className="mt-0.5 text-sm text-slate-500">Get order updates (payment received, ready for pickup, on the way) as a message from our Telegram bot.</p>
              : <p className="mt-0.5 text-sm text-slate-500">Available when you sign in with Telegram. Log out and choose “Continue with Telegram” to receive order updates in Telegram.</p>}
          </div>
          <Switch checked={tg && telegramAvailable} disabled={!telegramAvailable || pending} label="Telegram messages"
            onChange={(v) => { setTg(v); start(async () => { const r = await setTelegramPref(v); if (!r.ok) { setTg(!v); toast.error(r.message); } else toast.success(r.message); }); }} />
        </div>
      </section>
      <p className="text-xs text-slate-500">In-app notifications (the bell in the header) are always on.</p>
    </div>
  );
}
