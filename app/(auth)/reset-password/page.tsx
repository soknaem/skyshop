import type { Metadata } from "next";
import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { api } from "@/lib/api";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const valid = token.length >= 20 && (await api<{ valid: boolean }>(`/api/auth/reset-password/check?token=${encodeURIComponent(token)}`).catch(() => ({ valid: false }))).valid;
  if (!valid) {
    return (
      <div className="card p-6 text-center sm:p-8">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sale-soft text-sale"><LinkIcon className="h-8 w-8" /></span>
        <h1 className="text-2xl font-bold">This link no longer works</h1>
        <p className="mt-2 text-sm text-slate-500">Reset links work once and expire after 30 minutes. Request a new one and use the newest email.</p>
        <Link href="/forgot-password" className="btn-primary mt-5 w-full">Request a new link</Link>
      </div>
    );
  }
  return <ResetPasswordForm token={token} />;
}
