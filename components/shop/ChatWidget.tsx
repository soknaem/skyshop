"use client";

import { useEffect, useRef, useState } from "react";
import { Headset, MessageCircle, Send, X } from "lucide-react";
import { WS_URL } from "@/lib/config";
import { desktopNotify } from "@/lib/desktop-notify";
import { useToast } from "@/components/ui/Toaster";

type Msg = { id: number; sender: "CUSTOMER" | "ADMIN" | "SYSTEM"; sender_name: string; text: string; created_at: string };

const QUICK = ["Is this item in stock?", "How long is delivery?", "What does the warranty cover?"];

function guestId(): string {
  let id = localStorage.getItem("chat_guest");
  if (!id) {
    id = Array.from(crypto.getRandomValues(new Uint8Array(12))).map((b) => b.toString(16).padStart(2, "0")).join("");
    localStorage.setItem("chat_guest", id);
  }
  return id;
}

/** Live chat with the shop team. The connection opens the first time the widget is opened. */
export default function ChatWidget() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [online, setOnline] = useState(false);
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [text, setText] = useState("");
  const ws = useRef<WebSocket | null>(null);
  const openRef = useRef(false);
  const end = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastTyping = useRef(0);

  useEffect(() => { openRef.current = open; if (open) setUnread(0); }, [open]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, typing, open]);

  useEffect(() => {
    if (!started) return;
    let stopped = false;
    let retry: ReturnType<typeof setTimeout>;
    let attempts = 0;

    async function connect() {
      let token = "";
      try { token = (await (await fetch("/api/ws-token", { cache: "no-store" })).json()).token ?? ""; } catch {}
      if (stopped) return;
      const sock = new WebSocket(`${WS_URL}/ws/chat?guest=${guestId()}&token=${encodeURIComponent(token)}`);
      ws.current = sock;
      sock.onopen = () => { attempts = 0; setConnected(true); };
      sock.onmessage = (e) => {
        const m = JSON.parse(e.data);
        if (m.type === "init") { setMsgs(m.messages); setOnline(m.support_online); }
        else if (m.type === "support_status") setOnline(m.online);
        else if (m.type === "message") {
          setMsgs((cur) => (cur.some((x) => x.id === m.message.id) ? cur : [...cur, m.message]));
          if (m.message.sender === "ADMIN") {
            setTyping(false);
            if (!openRef.current) { setUnread((n) => n + 1); if (!desktopNotify("Support replied", String(m.message.text).slice(0, 120), window.location.pathname, "chat")) toast.info("New reply from support", { label: "Open chat", onClick: () => setOpen(true) }); }
          }
        } else if (m.type === "typing") {
          setTyping(true);
          clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setTyping(false), 2500);
        } else if (m.type === "error") toast.error(m.message);
      };
      sock.onclose = () => {
        setConnected(false);
        if (!stopped) retry = setTimeout(connect, Math.min(15000, 1000 * 2 ** attempts++));
      };
    }
    connect();
    return () => { stopped = true; clearTimeout(retry); ws.current?.close(); };
  }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  function send(value: string) {
    const t = value.trim();
    if (!t) return;
    if (ws.current?.readyState !== WebSocket.OPEN) { toast.error("Not connected yet. Please wait a moment."); return; }
    ws.current.send(JSON.stringify({ type: "message", text: t }));
    setText("");
  }
  function onType(v: string) {
    setText(v);
    const now = Date.now();
    if (ws.current?.readyState === WebSocket.OPEN && now - lastTyping.current > 1500) { lastTyping.current = now; ws.current.send(JSON.stringify({ type: "typing" })); }
  }
  const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Phnom_Penh" });

  return (
    <>
      <button type="button" onClick={() => { setOpen((o) => !o); setStarted(true); }} aria-label={open ? "Close chat" : "Chat with support"}
        className={`fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-glow transition duration-300 hover:scale-110 active:scale-95 md:bottom-6 md:right-6 ${open ? "max-sm:hidden" : ""}`}>
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-sale px-1 text-[11px] font-bold">{unread}</span>}
        {!open && unread === 0 && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand/30 [animation-iteration-count:3]" />}
      </button>

      {open && (
        <section role="dialog" aria-label="Live chat with support"
          className="fixed inset-0 z-50 flex animate-slide-up flex-col bg-surface sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[560px] sm:w-[380px] sm:animate-scale-in sm:overflow-hidden sm:rounded-3xl sm:border sm:border-line sm:shadow-lift md:bottom-24">
          <header className="flex items-center gap-3 bg-night px-4 py-3.5 text-white">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-volt text-night"><Headset className="h-5 w-5" /><span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-night ${online ? "bg-emerald-400" : "bg-slate-400"}`} /></span>
            <div className="flex-1"><p className="font-semibold leading-tight">Support chat</p><p className="text-xs text-slate-300">{!connected ? "Connecting…" : online ? "We are online. Ask us anything" : "Offline. Leave a message"}</p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-2 hover:bg-white/10"><X className="h-5 w-5" /></button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-mist p-4">
            {msgs.map((m) => m.sender === "SYSTEM" ? (
              <p key={m.id} className="mx-auto max-w-[88%] rounded-2xl bg-surface px-3 py-2 text-center text-xs text-slate-500 shadow-card">{m.text}</p>
            ) : (
              <div key={m.id} className={`flex animate-fade-up ${m.sender === "CUSTOMER" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm shadow-card ${m.sender === "CUSTOMER" ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-surface"}`}>
                  {m.sender === "ADMIN" && <p className="mb-0.5 text-xs font-semibold text-brand">{m.sender_name || "Support"}</p>}
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`mt-1 text-right text-[10px] ${m.sender === "CUSTOMER" ? "text-white/70" : "text-slate-400"}`}>{time(m.created_at)}</p>
                </div>
              </div>
            ))}
            {typing && <div className="flex"><div className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-3 shadow-card">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 120}ms` }} />)}</div></div>}
            {msgs.filter((m) => m.sender === "CUSTOMER").length === 0 && connected && (
              <div className="flex flex-wrap gap-2 pt-1">{QUICK.map((q) => <button key={q} type="button" onClick={() => send(q)} className="rounded-full border border-brand/30 bg-surface px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand hover:text-white">{q}</button>)}</div>
            )}
            <div ref={end} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="safe-bottom flex items-center gap-2 border-t border-line bg-surface p-3">
            <input value={text} onChange={(e) => onType(e.target.value)} maxLength={1000} placeholder="Type your message…" aria-label="Message" className="input !rounded-full !py-2.5" />
            <button aria-label="Send message" disabled={!text.trim() || !connected} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark active:scale-95 disabled:opacity-40"><Send className="h-4 w-4" /></button>
          </form>
        </section>
      )}
    </>
  );
}
