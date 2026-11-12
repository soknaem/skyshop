"use client";

import { useTransition } from "react";
import { Send } from "lucide-react";
import { sendTelegramTest } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/Toaster";

type Status = { bot_configured: boolean; bot_username: string; alerts_enabled: boolean; chat_count: number };

const EVENTS = [
  "New paid order and order status changes", "Low stock and out-of-stock products", "New customer registered",
  "Admin sign-in, admin password changes and reset requests", "User management (create, edit, disable, reset password, delete)",
  "Product and category created or deleted", "A customer writes in the chat while no admin is online",
];

export default function TelegramAlertsSection({ status }: { status: Status | null }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const ready = !!status && status.bot_configured && status.chat_count > 0 && status.alerts_enabled;
  const row = (ok: boolean, text: string) => <li className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${ok ? "bg-emerald-500" : "bg-slate-300"}`} />{text}</li>;
  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#229ed9]/10 text-[#229ed9]"><Send className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">Telegram alerts</h2>
            <p className="mt-0.5 text-sm text-slate-500">Get a Telegram message on your phone for important operations, even when the admin panel is closed.</p>
            <ul className="mt-4 space-y-1.5 text-sm" aria-label="Setup status">
              {row(!!status?.bot_configured, status?.bot_configured ? `Bot connected${status.bot_username ? ` (@${status.bot_username})` : ""}` : "Bot token not set (TELEGRAM_BOT_TOKEN)")}
              {row((status?.chat_count ?? 0) > 0, (status?.chat_count ?? 0) > 0 ? `${status!.chat_count} chat${status!.chat_count === 1 ? "" : "s"} will receive alerts` : "No chat id set (TELEGRAM_ALERT_CHAT_IDS)")}
              {row(!!status?.alerts_enabled, status?.alerts_enabled ? "Alerts are switched on" : "Alerts are switched off (TELEGRAM_ALERTS=false)")}
            </ul>
            <button type="button" className="btn-primary mt-5" disabled={pending || !ready}
              onClick={() => start(async () => { const r = await sendTelegramTest(); r.ok ? toast.success(r.message) : toast.error(r.message); })}>
              <Send className="h-4 w-4" />{pending ? "Sending…" : "Send a test message"}
            </button>
            {!ready && <p className="mt-2 text-xs text-slate-500">Finish the setup below, restart the services, then the test button turns on.</p>}
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-lg font-bold">What you will be told about</h2>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">{EVENTS.map((e) => <li key={e} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />{e}</li>)}</ul>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-lg font-bold">How to set it up (2 minutes)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
          <li>In Telegram open <b>@BotFather</b>, send <code className="rounded bg-mist px-1.5 py-0.5">/newbot</code> and copy the bot token (you may reuse the login bot).</li>
          <li>Put it in the <code className="rounded bg-mist px-1.5 py-0.5">.env</code> file as <code className="rounded bg-mist px-1.5 py-0.5">TELEGRAM_BOT_TOKEN</code>.</li>
          <li>Open your bot in Telegram, press Start, then send <code className="rounded bg-mist px-1.5 py-0.5">/id</code>. The bot replies with your chat id.</li>
          <li>Put that number in <code className="rounded bg-mist px-1.5 py-0.5">TELEGRAM_ALERT_CHAT_IDS</code> (several people: separate with commas).</li>
          <li>Restart <code className="rounded bg-mist px-1.5 py-0.5">python scripts/start_all.py</code> and press the test button above.</li>
        </ol>
      </section>
    </div>
  );
}
