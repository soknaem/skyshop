"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { setAvatar, updateProfile } from "@/lib/actions/auth";
import { imageSrc, initials } from "@/lib/format";
import type { Profile } from "@/lib/types";
import { useToast } from "@/components/ui/Toaster";

export default function ProfileSection({ me }: { me: Profile }) {
  const toast = useToast();
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [state, action, saving] = useActionState(updateProfile, undefined);
  const [busy, setBusy] = useState(false);
  const [, start] = useTransition();
  useEffect(() => { if (!state?.ts) return; state.error ? toast.error(state.error) : toast.success("Profile saved"); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  async function pick(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please choose an image (JPG, PNG, WEBP or GIF)"); return; }
    if (f.size > 2 * 1024 * 1024) { toast.error("The picture is larger than 2 MB"); return; }
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", f);
      const r = await fetch("/api/avatar", { method: "POST", body });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { toast.error(data.error ?? "Upload failed"); return; }
      const res = await setAvatar(data.url);
      res.ok ? toast.success(res.message) : toast.error(res.message);
      router.refresh();
    } finally { setBusy(false); if (file.current) file.current.value = ""; }
  }

  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-6">
        <h2 className="text-lg font-bold">Profile picture</h2>
        <div className="mt-4 flex flex-wrap items-center gap-5">
          {me.avatar_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={imageSrc(me.avatar_url)} alt="Your profile picture" referrerPolicy="no-referrer" className="h-24 w-24 rounded-full object-cover ring-4 ring-brand-soft" />
            : <span className="flex h-24 w-24 items-center justify-center rounded-full bg-brand text-3xl font-bold text-white ring-4 ring-brand-soft">{initials(me.name)}</span>}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => file.current?.click()} disabled={busy} className="btn-outline">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}{me.avatar_url ? "Change photo" : "Upload photo"}</button>
              {me.avatar_url && <button type="button" disabled={busy} className="btn-danger" onClick={() => start(async () => { const r = await setAvatar(""); r.ok ? toast.success(r.message) : toast.error(r.message); router.refresh(); })}><Trash2 className="h-4 w-4" />Remove</button>}
            </div>
            <p className="text-xs text-slate-500">JPG, PNG, WEBP or GIF, up to 2 MB. It is cropped to a square.</p>
          </div>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-bold">Personal details</h2>
        <form action={action} className="space-y-4">
          <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" required minLength={2} defaultValue={me.name} className="input" autoComplete="name" /></div>
          <div><label className="label" htmlFor="phone">Phone <span className="font-normal text-slate-500">(used to prefill delivery)</span></label><input id="phone" name="phone" type="tel" defaultValue={me.phone} className="input" autoComplete="tel" /></div>
          <div><label className="label" htmlFor="email">Email</label><input id="email" value={me.email || "Not provided by your sign-in method"} disabled className="input opacity-70" /></div>
          <p className="text-xs text-slate-500">Signed in with <b className="capitalize">{me.provider === "local" ? "email and password" : me.provider}</b></p>
          <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        </form>
      </section>
    </div>
  );
}
