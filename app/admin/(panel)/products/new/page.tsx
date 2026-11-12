import type { Metadata } from "next";
import { adminApi } from "@/lib/api";
import type { Category } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Add product", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewProduct() {
  const cats = await adminApi<Category[]>("/api/ops/admin/categories");
  return <><h1 className="mb-6 text-3xl font-bold">Add new product</h1><ProductForm categories={cats} /></>;
}
