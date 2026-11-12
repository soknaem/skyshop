"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy, KeyRound, ShieldAlert, ShieldCheck, Trash2, UserCheck, UserX } from "lucide-react";
import { deleteUser, resetUserPassword, updateUser } from "@/lib/actions/admin";
import type { ManagedUser } from "@/lib/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toaster";

type Ask = null | "disable" | "enable" | "promote" | "demote" | "reset" | "delete";

export default function UserEditor({ user, isSelf }: { user: ManagedUser; isSelf: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [ask, setAsk] = useState<Ask>(null);
  const [temp, setTemp] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [pending, start] = useTransition();
  const local = user.provider === "local";

  const run = (fn: () => Promise<{ ok: boolean; message: string }>, after?: () => void) =>
    start(async () => { const r = await fn(); r.ok ? toast.success(r.message) : toast.error(r.message); setAsk(null); if (r.ok) { after?.(); router.refresh(); } });

  const confirmText: Record<Exclude<Ask, null>, { title: string; text: string; label: string; danger?: boolean }> = {
    disable: { title: `Disable ${user.name}?`, text: "They are signed out and cannot log in until you enable the account again.", label: "Disable account", danger: true },
    enable: { title: `Enable ${user.name}?`, text: "They can log in again.", label: "Enable account" },
    promote: { title: `Make ${user.name} an admin?`, text: "Admins can manage products, orders, users and chat. Only do this for people you trust.", label: "Make admin", danger: true },
    demote: { title: `Remove admin access from ${user.name}?`, text: "They become a normal customer and are signed out.", label: "Remove admin access", danger: true },
    reset: { title: `Reset the password of ${user.name}?`, text: custom ? "The new password you typed is set and they are signed out everywhere." : "A temporary password is created and they are signed out everywhere.", label: "Reset password", danger: true },
    delete: { title: `Delete ${user.name}?`, text: "This permanently removes the account. Their past orders stay in the shop records.", label: "Delete user", danger: true },
  };

  function confirm() {
    if (ask === "disable" || ask === "enable") return run(() => updateUser(user.id, { is_active: ask === "enable" }));
    if (ask === "promote" || ask === "demote") return run(() => updateUser(user.id, { role: ask === "promote" ? "ADMIN" : "CUSTOMER" }));
    if (ask === "delete") return run(() => deleteUser(user.id), () => router.push("/admin/users"));
    if (ask === "reset") {
      start(async () => {
        const r = await resetUserPassword(user.id, custom);
        setAsk(null);
        if (!r.ok) { toast.error(r.message); return; }
        toast.success(r.message); setCustom("");
        if (r.temporary) setTemp(r.temporary);
      });
    }
  }

  const section = "card space-y-4 p-5 sm:p-6";
  return (
    <div className="space-y-6">
      <section className={section}>
        <h2 className="text-lg font-bold">Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="u-name">Full name</label><input id="u-name" value={name} onChange={(e) => setName(e.target.value)} className="input" /></div>
          <div><label className="label" htmlFor="u-phone">Phone</label><input id="u-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" /></div>
        </div>
        <button type="button" className="btn-primary" disabled={pending || (name === user.name && phone === user.phone)} onClick={() => run(() => updateUser(user.id, { name, phone }))}>Save details</button>
      </section>

      <section className={section}>
        <h2 className="text-lg font-bold">Access</h2>
        {isSelf && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">This is your own account. For safety you cannot disable, demote or delete yourself.</p>}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-line p-4">
            {user.role === "ADMIN" ? <ShieldCheck className="h-6 w-6 text-brand" /> : <ShieldAlert className="h-6 w-6 text-slate-500" />}
            <div className="flex-1"><p className="font-semibold">{user.role === "ADMIN" ? "Admin" : "Customer"}</p><p className="text-xs text-slate-500">{user.role === "ADMIN" ? "Full access to this panel" : "Can shop and chat"}</p></div>
            <button type="button" className="btn-outline !py-2" disabled={isSelf || pending} onClick={() => setAsk(user.role === "ADMIN" ? "demote" : "promote")}>{user.role === "ADMIN" ? "Make customer" : "Make admin"}</button>
          </div>
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-line p-4">
            {user.is_active ? <UserCheck className="h-6 w-6 text-emerald-600" /> : <UserX className="h-6 w-6 text-sale" />}
            <div className="flex-1"><p className="font-semibold">{user.is_active ? "Active" : "Disabled"}</p><p className="text-xs text-slate-500">{user.is_active ? "Can log in" : "Cannot log in"}</p></div>
            <button type="button" className={user.is_active ? "btn-danger !py-2" : "btn-primary !py-2"} disabled={isSelf || pending} onClick={() => setAsk(user.is_active ? "disable" : "enable")}>{user.is_active ? "Disable" : "Enable"}</button>
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className="flex items-center gap-2 text-lg font-bold"><KeyRound className="h-5 w-5 text-brand" />Password</h2>
        {local ? (
          <>
            <p className="text-sm text-slate-500">Set a new password for this user. Leave the box empty to generate a temporary one. The user is signed out on every device.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="New password (optional, min 8 characters)" aria-label="New password" className="input flex-1" autoComplete="off" />
              <button type="button" className="btn-outline" disabled={pending || (custom.length > 0 && custom.length < 8)} onClick={() => setAsk("reset")}>Reset password</button>
            </div>
          </>
        ) : <p className="text-sm text-slate-500">This user signs in with <b className="capitalize">{user.provider}</b>, so there is no password to manage here.</p>}
      </section>

      {!isSelf && (
        <section className="rounded-2xl border border-sale/30 bg-sale-soft/40 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-sale">Danger zone</h2>
          <p className="mt-1 text-sm text-slate-500">Deleting removes the account for good. If you only want to stop someone logging in, disable the account instead.</p>
          <button type="button" className="btn-danger mt-4" onClick={() => setAsk("delete")}><Trash2 className="h-4 w-4" />Delete this user</button>
        </section>
      )}

      {ask && <ConfirmDialog open danger={confirmText[ask].danger} busy={pending} title={confirmText[ask].title} description={confirmText[ask].text} confirmLabel={confirmText[ask].label} onCancel={() => setAsk(null)} onConfirm={confirm} />}

      {temp && (
        <div className="fixed inset-0 z-[90] flex animate-fade-in items-end justify-center bg-night/50 p-4 backdrop-blur-sm sm:items-center" onClick={() => setTemp(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="temp-title" onClick={(e) => e.stopPropagation()} className="w-full max-w-sm animate-scale-in rounded-2xl bg-surface p-6 shadow-lift">
            <h2 id="temp-title" className="text-lg font-bold">Temporary password</h2>
            <p className="mt-1 text-sm text-slate-500">Copy it now and send it safely. It is shown only once.</p>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-mist p-3"><code className="flex-1 select-all break-all text-lg font-semibold tracking-wide">{temp}</code>
              <button type="button" aria-label="Copy password" className="btn-outline !px-3 !py-2" onClick={async () => { try { await navigator.clipboard.writeText(temp); toast.success("Copied"); } catch { toast.error("Could not copy"); } }}><Copy className="h-4 w-4" /></button></div>
            <button type="button" className="btn-primary mt-5 w-full" onClick={() => setTemp(null)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
