export default function Loading() {
  return (
    <div className="container-page py-8">
      <div className="skeleton mb-6 h-8 w-56" />
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden"><div className="skeleton aspect-square !rounded-none" /><div className="space-y-2 p-4"><div className="skeleton h-3 w-16" /><div className="skeleton h-4 w-full" /><div className="skeleton h-5 w-24" /><div className="skeleton h-9 w-full" /></div></div>
        ))}
      </div>
    </div>
  );
}
