"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Clock, MapPin, QrCode, RefreshCw, Store, Truck, Wifi, WifiOff } from "lucide-react";
import { mockPay, regeneratePayment } from "@/lib/actions/shop";
import { WS_URL } from "@/lib/config";
import { imageSrc, money } from "@/lib/format";
import type { Order } from "@/lib/types";
import { useToast } from "@/components/ui/Toaster";

type Status = "PENDING" | "SCANNED" | "PAID" | "EXPIRED" | "SUPERSEDED";

function useCountdown(expiresAt: string, active: boolean) {
  const calc = () => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }); // eslint-disable-line react-hooks/exhaustive-deps
  return left;
}

export default function PaymentPanel({ order }: { order: Order }) {
  const router = useRouter();
  const toast = useToast();
  const pay = order.payment!;
  const [status, setStatus] = useState<Status>(pay.status as Status);
  const [live, setLive] = useState(false);
  const [pending, start] = useTransition();
  const closed = useRef(false);
  const waiting = status === "PENDING" || status === "SCANNED";
  const left = useCountdown(pay.expires_at, waiting);
  const total = Math.max(1, (new Date(pay.expires_at).getTime() - new Date(order.created_at).getTime()) / 1000);

  useEffect(() => { setStatus(pay.status as Status); }, [pay.public_id, pay.status]);

  // Realtime: WebSocket through the gateway. Reconnects until the payment is finished.
  useEffect(() => {
    if (pay.status !== "PENDING") return;
    closed.current = false;
    let ws: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout>;
    const connect = () => {
      ws = new WebSocket(`${WS_URL}/ws/payments/${pay.public_id}`);
      ws.onopen = () => setLive(true);
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === "ping") return;
        setStatus(msg.status);
        if (msg.status === "SCANNED") toast.info("QR scanned. Confirm the payment in your banking app.");
        if (msg.status === "PAID") { closed.current = true; toast.success("Payment received. Thank you!"); router.push(`/order/${order.order_no}`); }
        if (msg.status === "EXPIRED") { closed.current = true; toast.error("This QR code has expired"); }
        if (msg.status === "SUPERSEDED") closed.current = true;
      };
      ws.onclose = () => { setLive(false); if (!closed.current) timer = setTimeout(connect, 2000); };
    };
    connect();
    return () => { closed.current = true; clearTimeout(timer); ws?.close(); };
  }, [pay.public_id, pay.status, order.order_no, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const expired = status === "EXPIRED";

  function regenerate() {
    start(async () => {
      const r = await regeneratePayment(pay.public_id);
      if (!r.ok) toast.error(r.message ?? "Could not create a new QR code");
      else { toast.success("New QR code ready"); router.refresh(); }
    });
  }
  function simulate() {
    start(async () => {
      const r = await mockPay(pay.public_id);
      if (!r.ok) toast.error(r.message ?? "Could not simulate the payment");
    });
  }

  const Fulfil = order.fulfillment === "PICKUP" ? Store : Truck;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="card animate-scale-in p-6 text-center sm:p-8">
        <span className="chip mx-auto"><QrCode className="h-3.5 w-3.5" />KHQR payment</span>
        <h2 className="mt-3 text-2xl font-bold">Scan to pay</h2>
        <p className="mt-1 text-sm text-slate-500">Open Bakong or any banking app that supports KHQR.</p>

        <div className="relative mx-auto mt-6 w-full max-w-[320px]">
          <div className={`rounded-3xl border border-line bg-surface p-3 shadow-lift transition ${expired ? "opacity-20 blur-[2px]" : ""}`}>
            {pay.qr_image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={pay.qr_image} alt="KHQR payment code" className="w-full rounded-2xl" />
              : <div className="flex aspect-square items-center justify-center rounded-2xl bg-mist text-sm text-slate-500">QR code not available</div>}
          </div>
          {waiting && <span className="pointer-events-none absolute inset-0 animate-pulse rounded-3xl ring-4 ring-brand/15" />}
          {expired && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <p className="font-bold text-sale">This QR code has expired</p>
              <button onClick={regenerate} disabled={pending} className="btn-primary"><RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />{pending ? "Creating…" : "Create a new QR code"}</button>
            </div>
          )}
        </div>

        <p className="mt-5 font-display text-4xl font-bold text-brand">{money(pay.amount, pay.currency)}</p>

        {waiting && (
          <div className="mx-auto mt-4 max-w-[320px]" aria-live="polite">
            <div className="h-1.5 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full bg-brand transition-all duration-1000" style={{ width: `${Math.min(100, (left / total) * 100)}%` }} /></div>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-slate-600">
              {status === "SCANNED" ? <span className="font-semibold text-amber-600">Scanned. Confirm in your app</span> : <><Clock className="h-4 w-4" />Waiting for payment · <span className="font-mono font-semibold" suppressHydrationWarning>{mm}:{ss}</span></>}
            </p>
          </div>
        )}
        <p className={`mt-3 flex items-center justify-center gap-1.5 text-xs ${live ? "text-emerald-600" : "text-slate-400"}`}>{live ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}{live ? "Live: updates the moment you pay" : "Connecting…"}</p>

        {pay.mock && !expired && (
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-dashed border-amber-400 bg-amber-50 p-4 text-sm">
            <p className="mb-3 text-amber-800">Demo mode is on: no real money moves.</p>
            <button onClick={simulate} disabled={pending} className="btn-outline">Simulate payment</button>
          </div>
        )}
      </section>

      <aside className="h-fit animate-fade-up [animation-delay:100ms] lg:sticky lg:top-32">
        <div className="card p-6 text-sm">
          <h2 className="text-lg font-bold">Order <span className="font-mono text-base">{order.order_no}</span></h2>
          <ul className="mt-4 space-y-3">
            {order.items.map((i) => (
              <li key={i.product_id + i.product_name} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc(i.image_url)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <span className="min-w-0 flex-1"><span className="line-clamp-1 font-medium">{i.product_name}</span><span className="text-slate-500">× {i.qty}</span></span>
                <span className="font-semibold">{money(i.subtotal, order.currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4">
            <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{money(order.subtotal, order.currency)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">{order.fulfillment === "PICKUP" ? "Pickup" : "Delivery"}</dt><dd className="font-semibold">{order.delivery_fee > 0 ? money(order.delivery_fee, order.currency) : "Free"}</dd></div>
            <div className="flex items-baseline justify-between border-t border-line pt-3"><dt className="font-semibold">Total</dt><dd className="font-display text-xl font-bold text-brand">{money(order.total_amount, order.currency)}</dd></div>
          </dl>
          <div className="mt-4 rounded-2xl bg-mist p-4">
            <p className="mb-2 flex items-center gap-2 font-semibold"><Fulfil className="h-4 w-4 text-brand" />{order.fulfillment === "PICKUP" ? "Pickup in store" : "Delivery"}</p>
            {order.fulfillment === "PICKUP"
              ? <p className="flex gap-2 text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{order.shop.address}</p>
              : <p className="text-slate-600">{order.shipping_address}<br />{order.phone}</p>}
          </div>
        </div>
      </aside>
    </div>
  );
}
