"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toaster";
import { deleteProduct } from "@/lib/actions/admin";

export default function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const toast = useToast();
  const router = useRouter();
  const [ask, setAsk] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <button type="button" aria-label={`Delete ${name}`} onClick={() => setAsk(true)} className="rounded-lg p-2 text-slate-500 transition hover:bg-sale-soft hover:text-sale"><Trash2 className="h-4 w-4" /></button>
      <ConfirmDialog open={ask} danger busy={pending} title={`Delete “${name}”?`} description="It will disappear from the shop. Past orders keep their own copy of the item." confirmLabel="Delete product"
        onCancel={() => setAsk(false)}
        onConfirm={() => start(async () => { const r = await deleteProduct(id); setAsk(false); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.message); })} />
    </>
  );
}
