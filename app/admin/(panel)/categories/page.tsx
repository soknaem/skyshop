import type { Metadata } from "next";
import { adminApi } from "@/lib/api";
import type { Category } from "@/lib/types";
import CategoryManager from "@/components/admin/CategoryManager";

export const metadata: Metadata = { title: "Categories", robots: { index: false } };

export default async function AdminCategories() {
  const cats = await adminApi<Category[]>("/api/ops/admin/categories");
  return <><div className="mb-6"><h1 className="text-3xl font-bold">Categories</h1><p className="text-sm text-slate-500">Group products so customers can filter and browse.</p></div><CategoryManager categories={cats} /></>;
}
