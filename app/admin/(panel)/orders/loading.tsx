import { TableSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return <div className="space-y-5"><div className="skeleton h-9 w-52" /><div className="skeleton h-11 w-full max-w-xl" /><TableSkeleton rows={8} cols={6} /></div>;
}
