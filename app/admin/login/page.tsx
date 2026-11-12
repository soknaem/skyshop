import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default async function AdminLogin() {
  const s = await getSession();
  if (s?.role === "ADMIN") redirect("/admin/dashboard");
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-night p-4">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-brand/30 blur-[110px]" />
      <div className="relative"><Suspense fallback={null}><AdminLoginForm /></Suspense></div>
    </main>
  );
}
