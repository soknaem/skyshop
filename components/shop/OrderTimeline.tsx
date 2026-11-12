import { Check } from "lucide-react";
import type { Fulfillment, FulfillmentStatus } from "@/lib/types";

export default function OrderTimeline({ fulfillment, status }: { fulfillment: Fulfillment; status: FulfillmentStatus }) {
  const steps = fulfillment === "PICKUP"
    ? ["Payment received", "Preparing your order", "Ready for pickup", "Collected"]
    : ["Payment received", "Preparing your order", "Out for delivery", "Delivered"];
  const current = { PENDING: -1, PROCESSING: 1, READY: 2, OUT_FOR_DELIVERY: 2, COMPLETED: 3 }[status] ?? 0;
  return (
    <ol className="relative grid grid-cols-4 gap-2" aria-label="Order progress">
      {steps.map((label, i) => {
        const done = i < current || status === "COMPLETED";
        const now = i === current && status !== "COMPLETED";
        return (
          <li key={label} className="relative flex flex-col items-center text-center">
            {i > 0 && <span className={`absolute right-1/2 top-4 -z-0 h-0.5 w-full transition-all duration-700 ${i <= current ? "bg-brand" : "bg-slate-200"}`} />}
            <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${done ? "bg-brand text-white" : now ? "bg-brand text-white ring-4 ring-brand/20" : "bg-slate-200 text-slate-500"}`}>
              {done ? <Check className="h-4 w-4" /> : i + 1}
              {now && <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" />}
            </span>
            <span className={`mt-2 text-xs font-semibold leading-tight sm:text-sm ${done || now ? "text-ink" : "text-slate-400"}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
