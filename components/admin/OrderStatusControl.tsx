"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";
import { updateOrderStatus } from "@/lib/actions/admin";
import type { Fulfillment, FulfillmentStatus } from "@/lib/types";

const FLOW: Record<Fulfillment, { value: FulfillmentStatus; label: string }[]> = {
  PICKUP: [{ value: "PROCESSING", label: "Preparing" }, { value: "READY", label: "Ready for pickup" }, { value: "COMPLETED", label: "Collected" }],
  DELIVERY: [{ value: "PROCESSING", label: "Preparing" }, { value: "OUT_FOR_DELIVERY", label: "Out for delivery" }, { value: "COMPLETED", label: "Delivered" }],
};

export default function OrderStatusControl({ orderNo, fulfillment, status }: { orderNo: string; fulfillment: Fulfillment; status: FulfillmentStatus }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const steps = FLOW[fulfillment];
  const current = steps.findIndex((s) => s.value === status);

  function set(value: FulfillmentStatus) {
    start(async () => {
      const r = await updateOrderStatus(orderNo, value);
      if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.message);
    });
  }

  return (
    <div className={pending ? "pointer-events-none opacity-60" : ""}>
      <ol className="grid grid-cols-3 gap-2">
        {steps.map((s, i) => {
          const done = i < current || status === "COMPLETED";
          const now = i === current && status !== "COMPLETED";
          return (
            <li key={s.value}>
              <button type="button" onClick={() => set(s.value)} disabled={i === current}
                className={`flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center text-xs font-semibold transition sm:text-sm ${now ? "border-brand bg-brand-soft text-brand" : done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-line bg-surface text-slate-500 hover:border-brand hover:text-brand"}`}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${now ? "bg-brand text-white" : done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"}`}>{done ? <Check className="h-4 w-4" /> : i + 1}</span>
                {s.label}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-slate-500">Tap a step to update the order. The customer sees the change right away.</p>
    </div>
  );
}
