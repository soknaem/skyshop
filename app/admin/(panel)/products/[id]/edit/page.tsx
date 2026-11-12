import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError, adminApi } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit product", robots: { index: false } };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product: Product;
  try {
    product = await adminApi<Product>(`/api/ops/admin/products/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 422)) notFound();
    throw e;
  }
  const cats = await adminApi<Category[]>("/api/ops/admin/categories");
  return <><h1 className="mb-6 text-3xl font-bold">Edit product <span className="text-slate-400">#{product.id}</span></h1><ProductForm key={product.id} product={product} categories={cats} /></>;
}
