"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { resetPassword } from "@/lib/actions/auth";
import PasswordField from "./PasswordField";
import { useToast } from "@/components/ui/Toaster";

export default function ResetPasswordForm({ token }: { token: string }) {
  const toast = useToast();
  const [state, action, pending] = useActionState(resetPassword, undefined);
  useEffect(() => { if (state?.error) toast.error(state.error); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-3xl font-bold">Choose a new password</h1>
      <p className="mt-1 text-sm text-slate-500">You will be signed out everywhere and can log in with the new password.</p>
      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />
        <PasswordField name="password" label="New password" autoComplete="new-password" meter />
        <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" />
        <button className="btn-primary w-full !py-3" disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Save new password</button>
      </form>
    </div>
  );
}
