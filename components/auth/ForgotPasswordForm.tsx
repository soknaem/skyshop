"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { forgotPassword } from "@/lib/actions/auth";
import { useToast } from "@/components/ui/Toaster";

export default function ForgotPasswordForm() {
  const toast = useToast();
  const [state, action, pending] = useActionState(forgotPassword, undefined);
  useEffect(() => { if (state?.error) toast.error(state.error); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state?.ok) {
    return (
      <div className="card animate-scale-in p-6 text-center sm:p-8">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600"><MailCheck className="h-8 w-8" /></span>
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="mt-2 text-sm text-slate-500">If an account with that email exists, we sent a link to reset the password. It works for 30 minutes. Check your spam folder too.</p>
        {state.devLink && <a href={state.devLink} className="btn-primary mt-5 w-full">Open the reset link (development mode)</a>}
        {!state.emailConfigured && !state.devLink && <p className="mt-4 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700">Development mode: no email server is set, so the link is printed in the <b>auth service</b> window of <code>start_all.py</code>.</p>}
        <Link href="/login" className="btn-outline mt-5 w-full"><ArrowLeft className="h-4 w-4" />Back to log in</Link>
      </div>
    );
  }
  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-3xl font-bold">Forgot your password?</h1>
      <p className="mt-1 text-sm text-slate-500">Enter your email and we will send you a link to choose a new one. This works for accounts created with email and password.</p>
      <form action={action} className="mt-6 space-y-4">
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" autoFocus className="input" /></div>
        <button className="btn-primary w-full !py-3" disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Send reset link</button>
      </form>
      <p className="mt-6 text-center text-sm"><Link href="/login" className="font-semibold text-brand hover:underline">← Back to log in</Link></p>
    </div>
  );
}
