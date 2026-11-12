import Link from "next/link";
import { Zap } from "lucide-react";
import { SHOP_NAME } from "@/lib/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-night p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
        <div className="pointer-events-none absolute -left-20 top-1/3 h-80 w-80 rounded-full bg-brand/40 blur-[110px]" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-volt/25 blur-[110px]" />
        <Link href="/" className="relative flex items-center gap-2 font-display text-xl font-bold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-volt text-night"><Zap className="h-5 w-5 fill-current" /></span>{SHOP_NAME}</Link>
        <div className="relative">
          <h2 className="text-5xl font-bold leading-tight">Great tech,<br /><span className="text-volt">one tap</span> away.</h2>
          <p className="mt-4 max-w-md text-slate-300">Save favourites, follow your orders and check out with KHQR in seconds.</p>
        </div>
        <p className="relative text-sm text-slate-400">Browsing never needs an account. You only sign in to buy.</p>
      </aside>
      <main className="flex items-center justify-center bg-mist p-4 sm:p-8"><div className="w-full max-w-md animate-fade-up">{children}</div></main>
    </div>
  );
}
