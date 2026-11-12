export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-9 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28" />)}</div>
      <div className="skeleton h-72" />
    </div>
  );
}
