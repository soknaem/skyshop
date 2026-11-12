"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { saveProduct } from "@/lib/actions/admin";
import type { Category, Product } from "@/lib/types";
import { useToast } from "@/components/ui/Toaster";
import ImageUploader from "./ImageUploader";
import SpecsEditor, { type SpecRow } from "./SpecsEditor";

export default function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const toast = useToast();
  const [state, action, pending] = useActionState(saveProduct, undefined);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [rows, setRows] = useState<SpecRow[]>(Object.entries(product?.specs ?? {}).map(([k, v]) => ({ k, v })));
  useEffect(() => { if (state?.error) toast.error(state.error); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const specs = Object.fromEntries(rows.filter((r) => r.k.trim() && r.v.trim()).map((r) => [r.k.trim(), r.v.trim()]));
  const sec = "card space-y-4 p-5 sm:p-6";

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_380px]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="specs" value={JSON.stringify(specs)} />

      <div className="space-y-6">
        <section className={sec}>
          <h2 className="text-lg font-bold">Basic information</h2>
          <div><label className="label" htmlFor="name">Product name</label><input id="name" name="name" required defaultValue={product?.name} className="input" placeholder="e.g. Nova X1 Pro 5G Smartphone" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="brand">Brand</label><input id="brand" name="brand" defaultValue={product?.brand} className="input" placeholder="e.g. Nova" /></div>
            <div><label className="label" htmlFor="category_id">Category</label>
              <select id="category_id" name="category_id" defaultValue={product?.category_id ?? ""} className="input"><option value="">No category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          </div>
          <div><label className="label" htmlFor="description">Description</label><textarea id="description" name="description" rows={5} defaultValue={product?.description} className="input" placeholder="What makes this product great?" /></div>
        </section>

        <section className={sec}>
          <h2 className="text-lg font-bold">Pictures</h2>
          <ImageUploader images={images} onChange={setImages} />
        </section>

        <section className={sec}>
          <div><h2 className="text-lg font-bold">Specifications</h2><p className="text-sm text-slate-500">Shown as a table on the product page.</p></div>
          <SpecsEditor rows={rows} onChange={setRows} />
        </section>
      </div>

      <div className="space-y-6">
        <section className={sec}>
          <h2 className="text-lg font-bold">Price and stock</h2>
          <div><label className="label" htmlFor="price">Price</label><input id="price" name="price" type="number" step="0.01" min="0.01" required defaultValue={product?.price} className="input" /></div>
          <div><label className="label" htmlFor="compare_price">Old price <span className="font-normal text-slate-400">(optional, shows a discount)</span></label><input id="compare_price" name="compare_price" type="number" step="0.01" min="0" defaultValue={product?.compare_price ?? ""} className="input" /></div>
          <div><label className="label" htmlFor="stock_qty">Stock quantity</label><input id="stock_qty" name="stock_qty" type="number" step="1" min="0" required defaultValue={product?.stock_qty ?? 0} className="input" /></div>
          <div><label className="label" htmlFor="warranty">Warranty</label><input id="warranty" name="warranty" defaultValue={product?.warranty} className="input" placeholder="e.g. 12 months" /></div>
        </section>
        <section className={sec}>
          <h2 className="text-lg font-bold">Visibility</h2>
          <div><label className="label" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={product?.status ?? "ACTIVE"} className="input"><option value="ACTIVE">Active (visible in the shop)</option><option value="INACTIVE">Hidden</option></select></div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-mist p-3 text-sm"><input type="checkbox" name="featured" defaultChecked={product?.featured} className="mt-0.5 h-4 w-4 accent-brand" /><span><b>Mark as popular</b><br /><span className="text-slate-500">Shown first and with a Popular badge.</span></span></label>
        </section>
        <div className="flex gap-3">
          <button className="btn-primary flex-1 !py-3" disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}{pending ? "Saving…" : product ? "Save changes" : "Add product"}</button>
          <Link href="/admin/products" className="btn-outline !py-3">Cancel</Link>
        </div>
      </div>
    </form>
  );
}
