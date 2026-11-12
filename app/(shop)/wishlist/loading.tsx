import { CardGridSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return <div className="container-page py-8"><div className="skeleton mb-6 h-9 w-56" /><CardGridSkeleton count={4} /></div>;
}
