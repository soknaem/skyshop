"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { WS_URL } from "@/lib/config";
import { gatewayToken, gw } from "@/lib/browser-api";
import { desktopNotify } from "@/lib/desktop-notify";
import type { NotificationItem } from "@/lib/types";
import { useToast } from "@/components/ui/Toaster";

type Ctx = {
  items: NotificationItem[]; unread: number; loading: boolean; live: boolean;
  open: (n: NotificationItem) => void; markAll: () => void; clearRead: () => void;
};
const NCtx = createContext<Ctx | null>(null);
export const useNotifications = () => {
  const v = useContext(NCtx);
  if (!v) throw new Error("useNotifications needs <NotificationProvider>");
  return v;
};

/** Notification centre: loads the list, listens for new ones over WebSocket, shows a toast or (opt-in) a system notification. */
export default function NotificationProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(enabled);
  const [live, setLive] = useState(false);
  const router2 = useRef(router);
  router2.current = router;

  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    let stopped = false, ws: WebSocket | null = null, retry: ReturnType<typeof setTimeout>, tries = 0;

    gw<{ items: NotificationItem[]; unread: number }>("/api/notify/notifications?limit=30").then((d) => {
      if (stopped) return;
      if (d) { setItems(d.items); setUnread(d.unread); }
      setLoading(false);
    });

    (async function connect() {
      const token = await gatewayToken();
      if (stopped || !token) return;
      ws = new WebSocket(`${WS_URL}/ws/notifications?token=${encodeURIComponent(token)}`);
      ws.onopen = () => { tries = 0; setLive(true); };
      ws.onmessage = (e) => {
        const m = JSON.parse(e.data);
        if (m.type === "hello") setUnread(m.unread);
        if (m.type !== "notification") return;
        const n: NotificationItem = m.notification;
        setItems((cur) => [n, ...cur.filter((x) => x.id !== n.id)].slice(0, 50));
        setUnread(m.unread);
        if (!desktopNotify(n.title, n.body, n.url, `n-${n.id}`)) {
          const action = n.url ? { label: "View", onClick: () => router2.current.push(n.url) } : undefined;
          (n.level === "warning" ? toast.info : toast.success)(`${n.title}${n.body ? `: ${n.body}` : ""}`, action);
        }
        if (n.type.startsWith("order.")) router2.current.refresh();   // keep the page's data fresh
      };
      ws.onclose = () => { setLive(false); if (!stopped) retry = setTimeout(connect, Math.min(20000, 1000 * 2 ** tries++)); };
    })();
    return () => { stopped = true; clearTimeout(retry); ws?.close(); };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = useCallback((n: NotificationItem) => {
    if (!n.read) {
      setItems((cur) => cur.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      gw(`/api/notify/notifications/${n.id}/read`, { method: "POST" });
    }
    if (n.url) router2.current.push(n.url);
  }, []);
  const markAll = useCallback(() => {
    setItems((cur) => cur.map((x) => ({ ...x, read: true })));
    setUnread(0);
    gw("/api/notify/notifications/read-all", { method: "POST" });
  }, []);
  const clearRead = useCallback(() => {
    setItems((cur) => cur.filter((x) => !x.read));
    gw("/api/notify/notifications", { method: "DELETE" });
  }, []);

  const value = useMemo(() => ({ items, unread, loading, live, open, markAll, clearRead }), [items, unread, loading, live, open, markAll, clearRead]);
  return <NCtx.Provider value={value}>{children}</NCtx.Provider>;
}
