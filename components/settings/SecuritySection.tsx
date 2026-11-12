"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { changePassword } from "@/lib/actions/auth";
import PasswordField from "@/components/auth/PasswordField";
import { useToast } from "@/components/ui/Toaster";
import type { Profile } from "@/lib/types";

export default function SecuritySection({ me }: { me: Profile }) {
  const toast = useToast();
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(changePassword, undefined);
  useEffect(() => {
    if (!state?.ts) return;
    if (state.error) toast.error(state.error);
    else { toast.success("Password changed. Other devices were signed out."); form.current?.reset(); }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  if (me.provider !== "local") {
    return (
      <section className="card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"><ShieldCheck className="h-5 w-5" /></span>
          <div>
            <h2 className="text-lg font-bold">Your account is secured by {me.provider[0].toUpperCase() + me.provider.slice(1)}</h2>
            <p className="mt-1 text-sm text-slate-500">You sign in with {me.provider[0].toUpperCase() + me.provider.slice(1)}, so there is no password here. Manage your password and two-step verification in that account.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"><KeyRound className="h-5 w-5" /></span>
        <div><h2 className="text-lg font-bold">Change password</h2><p className="text-sm text-slate-500">After you change it, every other device is signed out.</p></div>
      </div>
      <form ref={form} action={action} className="max-w-md space-y-4">
        <PasswordField name="current_password" label="Current password" autoComplete="current-password" />
        <PasswordField name="new_password" label="New password" autoComplete="new-password" meter />
        <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" />
        <div className="flex flex-wrap items-center gap-4">
          <button className="btn-primary" disabled={pending}>{pending ? "Changing…" : "Change password"}</button>
          <Link href="/forgot-password" className="text-sm font-semibold text-brand hover:underline">Forgot your current password?</Link>
        </div>
      </form>
    </section>
  );
}
