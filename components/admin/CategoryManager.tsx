"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import CategoryIcon, { ICONS } from "@/components/ui/CategoryIcon";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toaster";
import { deleteCategory, saveCategory } from "@/lib/actions/admin";
import type { Category } from "@/lib/types";

type Draft = { id?: number; name: string; icon: string; sort_order: number };
const EMPTY: Draft = { name: "", icon: "package", sort_order: 0 };

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const toast = useToast();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [del, setDel] = useState<Category | null>(null);
  const [pending, start] = useTransition();

  function save() {
    if (!draft) return;
    start(async () => {
      const r = await saveCategory(draft);
      if (r.ok) { toast.success(r.message); setDraft(null); router.refresh(); } else toast.error(r.message);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="card overflow-hidden">
        <ul className="divide-y divide-line">
          {categories.length === 0 && <li className="p-8 text-center text-sm text-slate-500">No categories yet.</li>}
          {categories.map((c) => (
            <li key={c.id} className="flex animate-fade-in items-center gap-4 p-4 transition hover:bg-mist/60">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand"><CategoryIcon name={c.icon} className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1"><p className="font-semibold">{c.name}</p><p className="text-xs text-slate-500">/{c.slug} · {c.product_count} product{c.product_count === 1 ? "" : "s"} · order {c.sort_order}</p></div>
              <button type="button" aria-label={`Edit ${c.name}`} onClick={() => setDraft({ id: c.id, name: c.name, icon: c.icon, sort_order: c.sort_order })} className="rounded-lg p-2 text-slate-500 transition hover:bg-brand-soft hover:text-brand"><Pencil className="h-4 w-4" /></button>
              <button type="button" aria-label={`Delete ${c.name}`} onClick={() => setDel(c)} className="rounded-lg p-2 text-slate-500 transition hover:bg-sale-soft hover:text-sale"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-fit lg:sticky lg:top-8">
        {draft ? (
          <div className="card animate-scale-in space-y-4 p-5">
            <h2 className="text-lg font-bold">{draft.id ? "Edit category" : "New category"}</h2>
            <div><label className="label" htmlFor="cat-name">Name</label><input id="cat-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="input" autoFocus placeholder="e.g. Smart Home" /></div>
            <div>
              <span className="label">Icon</span>
              <div className="grid grid-cols-6 gap-1.5">
                {Object.keys(ICONS).map((k) => (
                  <button key={k} type="button" title={k} aria-label={k} aria-pressed={draft.icon === k} onClick={() => setDraft({ ...draft, icon: k })}
                    className={`flex aspect-square items-center justify-center rounded-xl border transition ${draft.icon === k ? "border-brand bg-brand text-white shadow-glow" : "border-line hover:border-brand hover:text-brand"}`}><CategoryIcon name={k} className="h-5 w-5" /></button>
                ))}
              </div>
            </div>
            <div><label className="label" htmlFor="cat-order">Display order</label><input id="cat-order" type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })} className="input" /></div>
            <div className="flex gap-2"><button type="button" onClick={save} disabled={pending} className="btn-primary flex-1">{pending ? "Saving…" : "Save"}</button><button type="button" onClick={() => setDraft(null)} className="btn-outline">Cancel</button></div>
          </div>
        ) : (
          <button type="button" onClick={() => setDraft(EMPTY)} className="btn-primary w-full !py-3"><Plus className="h-4 w-4" />Add category</button>
        )}
      </div>

      <ConfirmDialog open={!!del} danger busy={pending} title={`Delete “${del?.name}”?`} description="Its products stay in the shop but become uncategorised." confirmLabel="Delete category" onCancel={() => setDel(null)}
        onConfirm={() => del && start(async () => { const r = await deleteCategory(del.id); setDel(null); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.message); })} />
    </div>
  );
}
