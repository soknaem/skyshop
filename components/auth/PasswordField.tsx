"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function strength(pw: string): { score: number; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length < 8) return { score: pw ? 1 : 0, label: pw ? "Too short" : "", color: "bg-sale" };
  return s <= 1 ? { score: 2, label: "Okay", color: "bg-amber-500" } : s === 2 ? { score: 3, label: "Good", color: "bg-emerald-500" } : { score: 4, label: "Strong", color: "bg-emerald-600" };
}

/** Password input with show/hide and an optional strength bar (for NEW passwords). */
export default function PasswordField({
  id, name, label, autoComplete, meter = false, hint, required = true, onValue,
}: { id?: string; name: string; label: string; autoComplete: string; meter?: boolean; hint?: string; required?: boolean; onValue?: (v: string) => void }) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState("");
  const st = strength(value);
  const fid = id ?? name;
  return (
    <div>
      <label className="label" htmlFor={fid}>{label}</label>
      <div className="relative">
        <input id={fid} name={name} type={show ? "text" : "password"} required={required} minLength={meter ? 8 : undefined} autoComplete={autoComplete}
          value={value} onChange={(e) => { setValue(e.target.value); onValue?.(e.target.value); }} className="input pr-11" aria-describedby={meter ? `${fid}-hint` : undefined} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:text-ink">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
      </div>
      {meter && (
        <div id={`${fid}-hint`} className="mt-2" aria-live="polite">
          <div className="flex gap-1" aria-hidden>{[1, 2, 3, 4].map((n) => <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${n <= st.score ? st.color : "bg-slate-200"}`} />)}</div>
          <p className="mt-1 text-xs text-slate-500">{value ? st.label : hint ?? "At least 8 characters"}{value && st.score < 4 && value.length >= 8 ? ". Add upper case, numbers or symbols to make it stronger." : ""}</p>
        </div>
      )}
    </div>
  );
}
