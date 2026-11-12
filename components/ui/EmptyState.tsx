import Link from "next/link";

export default function EmptyState({ icon, title, text, href, cta }: { icon: React.ReactNode; title: string; text?: string; href?: string; cta?: string }) {
  return (
    <div className="card animate-fade-up px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">{icon}</div>
      <h2 className="text-xl font-bold">{title}</h2>
      {text && <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">{text}</p>}
      {href && cta && <Link href={href} className="btn-primary mt-6">{cta}</Link>}
    </div>
  );
}
