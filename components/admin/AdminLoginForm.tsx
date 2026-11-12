"use client";

import { useActionState, useEffect } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { adminLogin } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/Toaster";

export default function AdminLoginForm() {
  const toast = useToast();
  const [state, action, pending] = useActionState(adminLogin, undefined);
  useEffect(() => { if (state?.error) toast.error(state.error); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <form action={action} className="card w-full max-w-sm animate-scale-in space-y-4 p-7">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-night text-volt"><ShieldCheck className="h-6 w-6" /></span>
      <div><h1 className="text-2xl font-bold">Admin sign in</h1><p className="text-sm text-slate-500">Manage products, orders and live chat.</p></div>
      <div><label className="label" htmlFor="username">Username</label><input id="username" name="username" required defaultValue={state?.values?.username} className="input" autoComplete="username" /></div>
      <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required className="input" autoComplete="current-password" /></div>
      <button className="btn-primary w-full !py-3" disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Sign in</button>
    </form>
  );
}
