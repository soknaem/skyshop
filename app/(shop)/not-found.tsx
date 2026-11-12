import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page py-20 text-center">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-soft text-brand"><SearchX className="h-9 w-9" /></div>
      <h1 className="text-3xl font-bold">We could not find that page</h1>
      <p className="mt-2 text-slate-500">The product or page may have been removed.</p>
      <Link href="/products" className="btn-primary mt-6">Browse all products</Link>
    </div>
  );
}
