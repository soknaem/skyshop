import { ListSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return <div className="space-y-5"><div className="skeleton h-9 w-52" /><ListSkeleton rows={6} /></div>;
}
