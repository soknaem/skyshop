import { ListSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="container-page py-8">
      <div className="mb-8 flex items-center gap-4"><div className="skeleton h-16 w-16 !rounded-full" /><div className="space-y-2"><div className="skeleton h-7 w-48" /><div className="skeleton h-4 w-32" /></div></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]"><ListSkeleton rows={4} /><div className="skeleton h-72" /></div>
    </div>
  );
}
