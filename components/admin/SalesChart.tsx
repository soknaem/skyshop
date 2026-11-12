import { money } from "@/lib/format";
import type { DayPoint } from "@/lib/types";

export default function SalesChart({ data, currency }: { data: DayPoint[]; currency: string }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div>
      <div className="flex h-48 items-end gap-1.5 sm:gap-2" role="img" aria-label="Revenue per day for the last 14 days">
        {data.map((d, i) => (
          <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.date}: ${money(d.revenue, currency)} (${d.orders} orders)`}>
            <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-night px-2 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">{money(d.revenue, currency)}</div>
            <div className="w-full origin-bottom animate-grow rounded-t-lg bg-gradient-to-t from-brand to-brand/60 transition group-hover:from-brand-dark group-hover:to-brand"
              style={{ height: `${Math.max((d.revenue / max) * 100, d.revenue > 0 ? 5 : 1.5)}%`, animationDelay: `${i * 45}ms` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 text-[10px] font-medium text-slate-400 sm:gap-2">{data.map((d) => <span key={d.date} className="flex-1 text-center">{d.date.slice(8)}</span>)}</div>
    </div>
  );
}
