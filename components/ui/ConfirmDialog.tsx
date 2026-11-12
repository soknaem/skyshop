"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  open, title, description, confirmLabel = "Confirm", danger = false, busy = false, onConfirm, onCancel,
}: { open: boolean; title: string; description?: string; confirmLabel?: string; danger?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex animate-fade-in items-end justify-center bg-night/50 p-4 backdrop-blur-sm sm:items-center" onClick={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-scale-in rounded-2xl bg-surface p-6 shadow-lift">
        <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${danger ? "bg-sale-soft text-sale" : "bg-brand-soft text-brand"}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 id="confirm-title" className="text-lg font-bold">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-outline" disabled={busy}>Cancel</button>
          <button type="button" onClick={onConfirm} disabled={busy} className={danger ? "btn bg-sale text-white hover:bg-red-600" : "btn-primary"}>{busy ? "Please wait…" : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
