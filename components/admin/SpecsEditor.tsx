"use client";

import { Plus, X } from "lucide-react";

export type SpecRow = { k: string; v: string };

const SUGGEST = ["Display", "Processor", "RAM", "Storage", "Battery", "Camera", "Connectivity", "Weight", "Warranty"];

export default function SpecsEditor({ rows, onChange }: { rows: SpecRow[]; onChange: (r: SpecRow[]) => void }) {
  const set = (i: number, patch: Partial<SpecRow>) => onChange(rows.map((r, n) => (n === i ? { ...r, ...patch } : r)));
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex animate-fade-in gap-2">
          <input value={r.k} onChange={(e) => set(i, { k: e.target.value })} list="spec-names" placeholder="e.g. RAM" aria-label="Specification name" className="input !w-2/5" />
          <input value={r.v} onChange={(e) => set(i, { v: e.target.value })} placeholder="e.g. 8 GB" aria-label="Specification value" className="input" />
          <button type="button" aria-label="Remove row" onClick={() => onChange(rows.filter((_, n) => n !== i))} className="rounded-xl px-2.5 text-slate-400 transition hover:bg-sale-soft hover:text-sale"><X className="h-4 w-4" /></button>
        </div>
      ))}
      <datalist id="spec-names">{SUGGEST.map((s) => <option key={s} value={s} />)}</datalist>
      <button type="button" onClick={() => onChange([...rows, { k: "", v: "" }])} className="btn-outline !py-2"><Plus className="h-4 w-4" />Add specification</button>
    </div>
  );
}
