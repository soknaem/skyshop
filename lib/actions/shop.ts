"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, errorMessage, getToken } from "../api";
import type { Order } from "../types";

export type Result = { ok: boolean; message?: string; needsLogin?: boolean };

async function withToken<T>(fn: (token: string) => Promise<T>): Promise<Result & { data?: T }> {
  const token = await getToken();
  if (!token) return { ok: false, needsLogin: true, message: "Please log in to continue" };
  try {
    return { ok: true, data: await fn(token) };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

export async function addToCart(productId: number, qty: number): Promise<Result> {
  const r = await withToken((token) => api("/api/ops/cart/items", { method: "POST", token, body: { product_id: productId, qty } }));
  if (r.ok) revalidatePath("/", "layout");
  return { ok: r.ok, message: r.ok ? "Added to your cart" : r.message, needsLogin: r.needsLogin };
}

export async function updateCartQty(productId: number, qty: number): Promise<Result> {
  const r = await withToken((token) => api(`/api/ops/cart/items/${productId}`, { method: "PATCH", token, body: { qty } }));
  if (r.ok) revalidatePath("/", "layout");
  return { ok: r.ok, message: r.message };
}

export async function removeFromCart(productId: number): Promise<Result> {
  const r = await withToken((token) => api(`/api/ops/cart/items/${productId}`, { method: "DELETE", token }));
  if (r.ok) revalidatePath("/", "layout");
  return { ok: r.ok, message: r.ok ? "Item removed" : r.message };
}

export async function toggleWishlist(productId: number, wish: boolean): Promise<Result & { wished?: boolean }> {
  const r = await withToken((token) => api(`/api/ops/wishlist/${productId}`, { method: wish ? "POST" : "DELETE", token }));
  if (r.ok) revalidatePath("/wishlist");
  return { ok: r.ok, wished: wish, needsLogin: r.needsLogin, message: r.ok ? (wish ? "Saved to your wishlist" : "Removed from your wishlist") : r.message };
}

export type CheckoutState = { error?: string; ts?: number; values?: Record<string, string> } | undefined;

export async function placeOrder(_prev: CheckoutState, form: FormData): Promise<CheckoutState> {
  const values = {
    fulfillment: String(form.get("fulfillment") ?? "PICKUP"),
    full_name: String(form.get("full_name") ?? ""),
    email: String(form.get("email") ?? ""),
    phone: String(form.get("phone") ?? ""),
    shipping_address: String(form.get("shipping_address") ?? ""),
  };
  const r = await withToken((token) => api<Order>("/api/ops/checkout", { method: "POST", token, body: values }));
  if (!r.ok || !r.data) return { error: r.message ?? "Could not place your order", ts: Date.now(), values };
  revalidatePath("/", "layout");
  redirect(`/checkout?order=${r.data.order_no}`);
}

export async function regeneratePayment(publicId: string): Promise<Result> {
  const r = await withToken((token) => api(`/api/ops/payments/${publicId}/regenerate`, { method: "POST", token }));
  return { ok: r.ok, message: r.ok ? "New QR code ready" : r.message };
}

export async function mockPay(publicId: string): Promise<Result> {
  const r = await withToken((token) => api(`/api/ops/payments/${publicId}/mock-pay`, { method: "POST", token }));
  return { ok: r.ok, message: r.message };
}
