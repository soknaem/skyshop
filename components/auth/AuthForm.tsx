"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login, register } from "@/lib/actions/auth";
import { useToast } from "@/components/ui/Toaster";
import SocialButtons from "./SocialButtons";

export default function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const toast = useToast();
  const [state, action, pending] = useActionState(mode === "login" ? login : register, undefined);
  const [show, setShow] = useState(false);
  const v = state?.values ?? {};
  useEffect(() => { if (state?.error) toast.error(state.error); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  const pw = (name: string, label: string, auto: string) => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <div className="relative">
        <input id={name} name={name} type={show ? "text" : "password"} required minLength={mode === "register" ? 8 : 1} autoComplete={auto} className="input pr-11" />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-ink">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
      </div>
    </div>
  );

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-3xl font-bold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-1 text-sm text-slate-500">{mode === "login" ? "Log in to buy, save favourites and track orders." : "It takes less than a minute."}</p>

      <div className="mt-6"><SocialButtons next={next} /></div>
      <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400"><span className="h-px flex-1 bg-line" />or with email<span className="h-px flex-1 bg-line" /></div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        {mode === "register" ? (
          <>
            <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" required minLength={2} defaultValue={v.name} className="input" autoComplete="name" /></div>
            <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required defaultValue={v.email} className="input" autoComplete="email" /></div>
            <div><label className="label" htmlFor="phone">Phone <span className="font-normal text-slate-400">(optional)</span></label><input id="phone" name="phone" type="tel" defaultValue={v.phone} className="input" autoComplete="tel" /></div>
            {pw("password", "Password (at least 8 characters)", "new-password")}
            {pw("confirm", "Confirm password", "new-password")}
          </>
        ) : (
          <>
            <div><label className="label" htmlFor="username">Email</label><input id="username" name="username" required defaultValue={v.username} className="input" autoComplete="username" /></div>
            {pw("password", "Password", "current-password")}
            <div className="-mt-2 text-right"><Link href="/forgot-password" className="text-sm font-semibold text-brand hover:underline">Forgot password?</Link></div>
          </>
        )}
        <button className="btn-primary w-full !py-3" disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "login" ? "Log in" : "Create account"}</button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {mode === "login" ? <>New here? <Link href={`/register${q}`} className="font-semibold text-brand hover:underline">Create an account</Link></> : <>Already have an account? <Link href={`/login${q}`} className="font-semibold text-brand hover:underline">Log in</Link></>}
      </p>
      <p className="mt-3 text-center text-xs text-slate-400"><Link href="/" className="hover:text-brand">← Keep browsing without an account</Link></p>
    </div>
  );
}
