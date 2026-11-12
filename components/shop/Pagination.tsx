import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page, total, pageSize, basePath, params = {},
}: { page: number; total: number; pageSize: number; basePath: string; params?: Record<string, string> }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const href = (p: number) => `${basePath}?${new URLSearchParams({ ...params, page: String(p) })}`;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  const cell = "flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition";
  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      {page > 1 ? <Link href={href(page - 1)} aria-label="Previous page" className={`${cell} border border-line bg-surface hover:border-brand hover:text-brand`}><ChevronLeft className="h-4 w-4" /></Link> : null}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
          <Link href={href(n)} aria-current={n === page ? "page" : undefined} className={`${cell} ${n === page ? "bg-brand text-white shadow-glow" : "border border-line bg-surface hover:border-brand hover:text-brand"}`}>{n}</Link>
        </span>
      ))}
      {page < pages ? <Link href={href(page + 1)} aria-label="Next page" className={`${cell} border border-line bg-surface hover:border-brand hover:text-brand`}><ChevronRight className="h-4 w-4" /></Link> : null}
    </nav>
  );
}
