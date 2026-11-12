"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, Send, X } from "lucide-react";
import { telegramPoll, telegramStart } from "@/lib/actions/auth";
import { useToast } from "@/components/ui/Toaster";

const btn = "flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold transition hover:border-brand hover:bg-brand-soft/40 active:scale-[.98]";

export default function SocialButtons({ next }: { next: string }) {
  const router = useRouter();
  const toast = useToast();
  const [tg, setTg] = useState<{ url: string; token: string } | null>(null);
  const [starting, setStarting] = useState(false);
  const alive = useRef(true);

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  // poll until the customer pressed START in Telegram
  useEffect(() => {
    if (!tg) return;
    let stop = false;
    const tick = async () => {
      while (!stop && alive.current) {
        await new Promise((r) => setTimeout(r, 2000));
        if (stop) return;
        const r = await telegramPoll(tg.token);
        if (r.status === "confirmed") { router.push(next); router.refresh(); return; }
        if (r.status === "expired") { toast.error("The Telegram link expired. Please try again."); setTg(null); return; }
      }
    };
    tick();
    return () => { stop = true; };
  }, [tg]); // eslint-disable-line react-hooks/exhaustive-deps

  async function startTelegram() {
    setStarting(true);
    const r = await telegramStart();
    setStarting(false);
    if (!r.ok || !r.url || !r.token) { toast.error(r.message ?? "Telegram login is not available"); return; }
    setTg({ url: r.url, token: r.token });
    window.open(r.url, "_blank", "noopener");
  }

  const q = `?next=${encodeURIComponent(next)}`;
  return (
    <>
      <div className="space-y-2.5">
        <a href={`/auth/start/google${q}`} className={btn}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z" /><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 23.5z" /><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4z" /><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.8l3.8 3c.9-2.7 3.4-4.4 6.4-4.4z" /></svg>
          Continue with Google
        </a>
        <a href={`/auth/start/facebook${q}`} className={btn}>
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#1877f2]" aria-hidden><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" /></svg>
          Continue with Facebook
        </a>
        <button type="button" onClick={startTelegram} disabled={starting} className={btn}>
          {starting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 text-[#229ed9]" />}
          Continue with Telegram
        </button>
      </div>

      {tg && (
        <div className="fixed inset-0 z-[90] flex animate-fade-in items-end justify-center bg-night/50 p-4 backdrop-blur-sm sm:items-center" onClick={() => setTg(null)}>
          <div className="w-full max-w-sm animate-scale-in rounded-2xl bg-surface p-6 text-center shadow-lift" onClick={(e) => e.stopPropagation()}>
            <button type="button" aria-label="Close" onClick={() => setTg(null)} className="float-right rounded-full p-1.5 hover:bg-mist"><X className="h-4 w-4" /></button>
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#229ed9]/10 text-[#229ed9]"><Send className="h-7 w-7" /></span>
            <h2 className="text-lg font-bold">Confirm in Telegram</h2>
            <p className="mt-1 text-sm text-slate-500">Telegram should have opened. Press <b>START</b> in the chat with our bot and you will be signed in here automatically.</p>
            <a href={tg.url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 w-full"><ExternalLink className="h-4 w-4" />Open Telegram again</a>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Waiting for you…</p>
          </div>
        </div>
      )}
    </>
  );
}
