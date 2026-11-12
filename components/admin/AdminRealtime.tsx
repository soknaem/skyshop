"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { WS_URL } from "@/lib/config";
import { desktopNotify } from "@/lib/desktop-notify";
import { useToast } from "@/components/ui/Toaster";

export type Conv = { id: number; customer_name: string; is_guest: boolean; status: "OPEN" | "CLOSED"; unread: number; last_message: string; last_message_at: string; online: boolean };
export type ChatMsg = { id: number; conversation_id: number; sender: "CUSTOMER" | "ADMIN" | "SYSTEM"; sender_name: string; text: string; created_at: string };

type Ctx = {
  ordersLive: boolean; chatLive: boolean; conversations: Conv[]; unreadTotal: number;
  messages: Record<number, ChatMsg[]>; typing: Record<number, boolean>;
  activeId: number | null; open: (id: number) => void; send: (id: number, text: string) => void;
  sendTyping: (id: number) => void; closeConv: (id: number) => void;
};
const RealtimeCtx = createContext<Ctx | null>(null);
export const useAdminRealtime = () => {
  const v = useContext(RealtimeCtx);
  if (!v) throw new Error("useAdminRealtime needs <AdminRealtime>");
  return v;
};

async function fetchToken(): Promise<string> {
  try { return (await (await fetch("/api/ws-token", { cache: "no-store" })).json()).token ?? ""; } catch { return ""; }
}

/** One place for the admin's live connections: new/updated orders, and the support chat inbox. */
export default function AdminRealtime({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const toast = useToast();
  const [ordersLive, setOrdersLive] = useState(false);
  const [chatLive, setChatLive] = useState(false);
  const [conversations, setConversations] = useState<Conv[]>([]);
  const [messages, setMessages] = useState<Record<number, ChatMsg[]>>({});
  const [typing, setTyping] = useState<Record<number, boolean>>({});
  const [activeId, setActiveId] = useState<number | null>(null);
  const chatWs = useRef<WebSocket | null>(null);
  const activeRef = useRef<number | null>(null);
  const router2 = useRef(router);
  router2.current = router;

  const sendRaw = useCallback((data: object) => { if (chatWs.current?.readyState === WebSocket.OPEN) chatWs.current.send(JSON.stringify(data)); }, []);
  const upsert = useCallback((c: Conv) => setConversations((list) => {
    const rest = list.filter((x) => x.id !== c.id);
    return [c, ...rest].sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
  }), []);

  // ---- orders feed
  useEffect(() => {
    let stopped = false, ws: WebSocket | null = null, retry: ReturnType<typeof setTimeout>, n = 0;
    (async function connect() {
      const token = await fetchToken();
      if (stopped || !token) return;
      ws = new WebSocket(`${WS_URL}/ws/admin/orders?token=${encodeURIComponent(token)}`);
      ws.onopen = () => { n = 0; setOrdersLive(true); };
      ws.onmessage = (e) => {
        const m = JSON.parse(e.data);
        if (m.type === "order_paid") router2.current.refresh();   // the toast / system notification comes from the notification centre
        if (m.type === "order_updated") router2.current.refresh();
      };
      ws.onclose = () => { setOrdersLive(false); if (!stopped) retry = setTimeout(connect, Math.min(15000, 1000 * 2 ** n++)); };
    })();
    return () => { stopped = true; clearTimeout(retry); ws?.close(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- chat inbox
  useEffect(() => {
    let stopped = false, retry: ReturnType<typeof setTimeout>, n = 0;
    (async function connect() {
      const token = await fetchToken();
      if (stopped || !token) return;
      const ws = new WebSocket(`${WS_URL}/ws/admin/chat?token=${encodeURIComponent(token)}`);
      chatWs.current = ws;
      ws.onopen = () => { n = 0; setChatLive(true); };
      ws.onmessage = (e) => {
        const m = JSON.parse(e.data);
        if (m.type === "conversations") setConversations(m.items);
        else if (m.type === "conversation_updated") upsert(m.conversation);
        else if (m.type === "presence") setConversations((l) => l.map((c) => (c.id === m.conversation_id ? { ...c, online: m.online } : c)));
        else if (m.type === "history") setMessages((s) => ({ ...s, [m.conversation_id]: m.messages }));
        else if (m.type === "typing") {
          setTyping((t) => ({ ...t, [m.conversation_id]: true }));
          setTimeout(() => setTyping((t) => ({ ...t, [m.conversation_id]: false })), 2500);
        } else if (m.type === "message") {
          const msg: ChatMsg = m.message;
          setMessages((s) => (s[msg.conversation_id] ? { ...s, [msg.conversation_id]: [...s[msg.conversation_id], msg] } : s));
          upsert(m.conversation);
          if (msg.sender === "CUSTOMER") {
            if (activeRef.current === msg.conversation_id) sendRaw({ type: "read", conversation_id: msg.conversation_id });
            else if (!desktopNotify(`Chat: ${m.conversation.customer_name}`, msg.text.slice(0, 120), "/admin/chat", `chat-${msg.conversation_id}`)) toast.info(`${m.conversation.customer_name}: ${msg.text.slice(0, 80)}`, { label: "Open chat", href: "/admin/chat" });
          }
        }
      };
      ws.onclose = () => { setChatLive(false); if (!stopped) retry = setTimeout(connect, Math.min(15000, 1000 * 2 ** n++)); };
    })();
    return () => { stopped = true; clearTimeout(retry); chatWs.current?.close(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const open = useCallback((id: number) => {
    setActiveId(id); activeRef.current = id;
    sendRaw({ type: "history", conversation_id: id });
    sendRaw({ type: "read", conversation_id: id });
  }, [sendRaw]);

  const value = useMemo<Ctx>(() => ({
    ordersLive, chatLive, conversations, messages, typing, activeId, open,
    unreadTotal: conversations.reduce((n, c) => n + c.unread, 0),
    send: (id, text) => sendRaw({ type: "send", conversation_id: id, text }),
    sendTyping: (id) => sendRaw({ type: "typing", conversation_id: id }),
    closeConv: (id) => sendRaw({ type: "close", conversation_id: id }),
  }), [ordersLive, chatLive, conversations, messages, typing, activeId, open, sendRaw]);

  return <RealtimeCtx.Provider value={value}>{children}</RealtimeCtx.Provider>;
}
