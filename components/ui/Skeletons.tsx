export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden"><div className="skeleton aspect-square !rounded-none" /><div className="space-y-2 p-4"><div className="skeleton h-3 w-16" /><div className="skeleton h-4 w-full" /><div className="skeleton h-5 w-24" /><div className="skeleton h-9 w-full" /></div></div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card flex items-center gap-4 p-4"><div className="skeleton h-14 w-14 shrink-0" /><div className="flex-1 space-y-2"><div className="skeleton h-4 w-1/3" /><div className="skeleton h-3 w-1/2" /></div><div className="skeleton h-6 w-20" /></div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="card overflow-hidden" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-11 !rounded-none" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-t border-line p-3.5">{Array.from({ length: cols }).map((__, j) => <div key={j} className={`skeleton h-4 ${j === 0 ? "w-24" : "flex-1"}`} />)}</div>
      ))}
    </div>
  );
}

export function NotificationSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-1 p-2" aria-busy="true" aria-label="Loading notifications">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-xl p-3"><div className="skeleton h-9 w-9 shrink-0 !rounded-full" /><div className="flex-1 space-y-2"><div className="skeleton h-3.5 w-2/3" /><div className="skeleton h-3 w-full" /></div></div>
      ))}
    </div>
  );
}
