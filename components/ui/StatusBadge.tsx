const MAP: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  PROCESSING: { label: "Processing", cls: "bg-brand-soft text-brand ring-brand/20" },
  READY: { label: "Ready for pickup", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", cls: "bg-violet-50 text-violet-700 ring-violet-200" },
  COMPLETED: { label: "Completed", cls: "bg-slate-100 text-slate-700 ring-slate-200" },
  PAID: { label: "Paid", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  EXPIRED: { label: "Expired", cls: "bg-slate-100 text-slate-600 ring-slate-200" },
  ACTIVE: { label: "Active", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  INACTIVE: { label: "Hidden", cls: "bg-slate-100 text-slate-600 ring-slate-200" },
  PICKUP: { label: "Pickup", cls: "bg-volt-soft text-ink ring-volt-dark/40" },
  DELIVERY: { label: "Delivery", cls: "bg-sky-50 text-sky-700 ring-sky-200" },
};

export default function StatusBadge({ value }: { value: string }) {
  const s = MAP[value] ?? { label: value, cls: "bg-slate-100 text-slate-600 ring-slate-200" };
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${s.cls}`}>{s.label}</span>;
}
