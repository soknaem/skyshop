import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeader({ title, subtitle, href, cta = "View all", dark = false }: { title: string; subtitle?: string; href?: string; cta?: string; dark?: boolean }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className={`text-2xl font-bold sm:text-3xl ${dark ? "text-white" : ""}`}>{title}</h2>
        {subtitle && <p className={`mt-1 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>{subtitle}</p>}
      </div>
      {href && <Link href={href} className={`group hidden shrink-0 items-center gap-1 text-sm font-semibold sm:flex ${dark ? "text-volt" : "text-brand"}`}>{cta}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>}
    </div>
  );
}
