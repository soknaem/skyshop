"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCheck, MessageCircle, Search, Send, UserRound } from "lucide-react";
import { useAdminRealtime, type Conv } from "./AdminRealtime";

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Phnom_Penh" });
const dayOf = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Phnom_Penh" });

export default function ChatInbox() {
  const { conversations, messages, typing, activeId, open, send, sendTyping, closeConv, chatLive } = useAdminRealtime();
  const [q, setQ] = useState("");
  const [text, setText] = useState("");
  const [showThread, setShowThread] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const lastTyping = useRef(0);
  const active = conversations.find((c) => c.id === activeId) ?? null;
  const thread = (activeId && messages[activeId]) || [];

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [thread.length, typing[activeId ?? -1], activeId]);

  const list = conversations.filter((c) => c.customer_name.toLowerCase().includes(q.toLowerCase()) || c.last_message.toLowerCase().includes(q.toLowerCase()));

  function pick(c: Conv) { open(c.id); setShowThread(true); }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !text.trim()) return;
    send(active.id, text.trim());
    setText("");
  }

  return (
    <div className="card grid h-[calc(100vh-11rem)] min-h-[480px] overflow-hidden lg:grid-cols-[340px_1fr]">
      {/* list */}
      <div className={`flex min-h-0 flex-col border-r border-line ${showThread ? "hidden lg:flex" : "flex"}`}>
        <div className="border-b border-line p-3">
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" aria-label="Search conversations" className="input !rounded-full !pl-9" /></div>
          <p className={`mt-2 flex items-center gap-1.5 text-xs ${chatLive ? "text-emerald-600" : "text-slate-400"}`}><span className={`h-1.5 w-1.5 rounded-full ${chatLive ? "bg-emerald-500" : "bg-slate-300"}`} />{chatLive ? "Connected. Customers see you online" : "Connecting…"}</p>
        </div>
        <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
          {list.length === 0 && <li className="p-8 text-center text-sm text-slate-500">No conversations yet.<br />They appear here as soon as a customer writes.</li>}
          {list.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => pick(c)} className={`flex w-full items-center gap-3 p-3.5 text-left transition ${activeId === c.id ? "bg-brand-soft" : "hover:bg-mist"}`}>
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-night text-white"><UserRound className="h-5 w-5" /><span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface ${c.online ? "bg-emerald-500" : "bg-slate-300"}`} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2"><span className="truncate font-semibold">{c.customer_name}</span><span className="shrink-0 text-[11px] text-slate-400">{dayOf(c.last_message_at)}</span></span>
                  <span className="flex items-center justify-between gap-2"><span className={`truncate text-sm ${c.unread ? "font-semibold text-ink" : "text-slate-500"}`}>{c.last_message || "No messages yet"}</span>{c.unread > 0 && <span className="animate-pop rounded-full bg-sale px-2 py-0.5 text-[11px] font-bold text-white">{c.unread}</span>}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* thread */}
      <div className={`min-h-0 flex-col ${showThread ? "flex" : "hidden lg:flex"}`}>
        {!active ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-slate-500"><span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand"><MessageCircle className="h-8 w-8" /></span><p>Select a conversation to start replying.</p></div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-line px-4 py-3">
              <button type="button" onClick={() => setShowThread(false)} aria-label="Back to list" className="rounded-full p-2 hover:bg-mist lg:hidden"><ArrowLeft className="h-5 w-5" /></button>
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{active.customer_name}</p><p className="text-xs text-slate-500">{active.is_guest ? "Guest visitor" : "Registered customer"} · {active.online ? <span className="text-emerald-600">online now</span> : "offline"}</p></div>
              {active.status === "OPEN" ? <button type="button" onClick={() => closeConv(active.id)} className="btn-outline !py-2"><CheckCheck className="h-4 w-4" />Resolve</button> : <span className="chip">Resolved</span>}
            </header>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-mist p-4">
              {thread.map((m) => m.sender === "SYSTEM" ? (
                <p key={m.id} className="mx-auto max-w-md rounded-2xl bg-surface px-3 py-1.5 text-center text-xs text-slate-500">{m.text}</p>
              ) : (
                <div key={m.id} className={`flex animate-fade-up ${m.sender === "ADMIN" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-card ${m.sender === "ADMIN" ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-surface"}`}>
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <p className={`mt-1 text-right text-[10px] ${m.sender === "ADMIN" ? "text-white/70" : "text-slate-400"}`}>{m.sender === "ADMIN" ? `${m.sender_name} · ` : ""}{timeOf(m.created_at)}</p>
                  </div>
                </div>
              ))}
              {typing[active.id] && <p className="animate-fade-in text-xs italic text-slate-500">{active.customer_name} is typing…</p>}
              <div ref={end} />
            </div>
            <form onSubmit={submit} className="flex items-center gap-2 border-t border-line p-3">
              <input value={text} maxLength={1000} onChange={(e) => { setText(e.target.value); const n = Date.now(); if (n - lastTyping.current > 1500) { lastTyping.current = n; sendTyping(active.id); } }} placeholder="Write a reply…" aria-label="Reply" className="input !rounded-full" />
              <button aria-label="Send reply" disabled={!text.trim() || !chatLive} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark active:scale-95 disabled:opacity-40"><Send className="h-4 w-4" /></button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
