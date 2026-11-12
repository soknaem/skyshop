"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Dices, Loader2 } from "lucide-react";
import { createUser } from "@/lib/actions/admin";
import PasswordField from "@/components/auth/PasswordField";
import { useToast } from "@/components/ui/Toaster";

export default function UserCreateForm() {
  const toast = useToast();
  const [state, action, pending] = useActionState(createUser, undefined);
  const [gen, setGen] = useState(0);
  useEffect(() => { if (state?.error) toast.error(state.error); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  function generate() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const pw = Array.from(crypto.getRandomValues(new Uint8Array(12))).map((b) => chars[b % chars.length]).join("");
    const el = document.getElementById("password") as HTMLInputElement | null;
    if (el) {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      set?.call(el, pw);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.type = "text";
    }
    setGen((n) => n + 1);
    toast.info("Password generated. Copy it now and share it safely.");
  }

  return (
    <form action={action} className="card max-w-2xl space-y-4 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" required minLength={2} className="input" /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="input" autoComplete="off" /></div>
        <div><label className="label" htmlFor="phone">Phone <span className="font-normal text-slate-500">(optional)</span></label><input id="phone" name="phone" type="tel" className="input" /></div>
        <div><label className="label" htmlFor="role">Role</label>
          <select id="role" name="role" defaultValue="CUSTOMER" className="input"><option value="CUSTOMER">Customer (can shop)</option><option value="ADMIN">Admin (full access to this panel)</option></select></div>
      </div>
      <div key={gen}>
        <PasswordField name="password" id="password" label="Password" autoComplete="new-password" meter />
        <button type="button" onClick={generate} className="btn-ghost mt-2 !py-1.5 text-brand"><Dices className="h-4 w-4" />Generate a strong password</button>
      </div>
      <p className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700">Tell the user their password through a safe channel. They can change it in Settings, or use “Forgot password”. Admin accounts get full access, so create them carefully.</p>
      <div className="flex gap-3">
        <button className="btn-primary" disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Create user</button>
        <Link href="/admin/users" className="btn-outline">Cancel</Link>
      </div>
    </form>
  );
}
