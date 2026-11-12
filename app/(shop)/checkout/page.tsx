import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { api, ApiError, authed, getCart } from "@/lib/api";
import type { Order, Profile, ShopConfig } from "@/lib/types";
import CheckoutForm from "@/components/shop/CheckoutForm";
import PaymentPanel from "@/components/shop/PaymentPanel";

export const metadata: Metadata = { title: "Checkout" };

const Steps = ({ step }: { step: 1 | 2 }) => (
  <ol className="mb-8 flex items-center gap-2 text-sm font-semibold" aria-label="Checkout steps">
    {["Delivery option", "Pay with KHQR", "Done"].map((label, i) => {
      const n = i + 1;
      const state = n < step ? "done" : n === step ? "now" : "todo";
      return (
        <li key={label} className="flex items-center gap-2">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition ${state === "todo" ? "bg-slate-200 text-slate-500" : "bg-brand text-white"} ${state === "now" ? "shadow-glow" : ""}`}>{state === "done" ? "✓" : n}</span>
          <span className={`hidden sm:inline ${state === "todo" ? "text-slate-400" : ""}`}>{label}</span>
          {n < 3 && <span className={`h-px w-6 sm:w-12 ${n < step ? "bg-brand" : "bg-slate-300"}`} />}
        </li>
      );
    })}
  </ol>
);

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderNo } = await searchParams;

  if (orderNo) {
    let order: Order;
    try {
      order = await authed<Order>(`/api/ops/orders/${encodeURIComponent(orderNo)}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) notFound();
      throw e;
    }
    if (order.status === "PAID") redirect(`/order/${order.order_no}`);
    return (
      <div className="container-page py-8">
        <Steps step={2} />
        <PaymentPanel key={order.payment?.public_id} order={order} />
      </div>
    );
  }

  const cart = await getCart();
  if (cart.items.length === 0) redirect("/cart");
  const [config, me] = await Promise.all([api<ShopConfig>("/api/ops/config"), authed<Profile>("/api/auth/me")]);
  return (
    <div className="container-page py-8">
      <Steps step={1} />
      <CheckoutForm cart={cart} config={config} defaults={{ name: me.name, email: me.email, phone: me.phone }} />
    </div>
  );
}
