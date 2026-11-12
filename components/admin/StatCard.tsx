export default function StatCard({ label, value, hint, icon, tone = "brand" }: { label: string; value: string; hint?: string; icon: React.ReactNode; tone?: "brand" | "volt" | "ink" | "sale" }) {
  const tones = { brand: "bg-brand-soft text-brand", volt: "bg-volt text-night", ink: "bg-night text-white", sale: "bg-sale-soft text-sale" };
  return (
    <div className="card card-hover animate-fade-up p-5">
      <div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span></div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
