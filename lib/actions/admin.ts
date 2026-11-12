"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApi, api, errorMessage } from "../api";
import { setSessionCookies, type Tokens } from "../auth-cookies";
import { setFlash } from "../flash";
import type { Profile } from "../types";
import type { AuthState } from "./auth";

export type FormState = { error?: string; ts?: number } | undefined;

export async function adminLogin(_prev: AuthState, form: FormData): Promise<AuthState> {
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  try {
    const t = await api<Tokens & { user: Profile }>("/api/auth/login", { method: "POST", body: { username, password } });
    if (t.user.role !== "ADMIN") return { error: "This account does not have admin access", ts: Date.now(), values: { username } };
    await setSessionCookies(t);
    await setFlash("success", "Signed in to the admin panel");
  } catch (e) {
    return { error: errorMessage(e), ts: Date.now(), values: { username } };
  }
  redirect("/admin/dashboard");
}

export async function adminLogout(): Promise<void> {
  const { cookies } = await import("next/headers");
  const refresh = (await cookies()).get("refresh_token")?.value;
  if (refresh) {
    try {
      await api("/api/auth/logout", { method: "POST", body: { refresh_token: refresh } });
    } catch {}
  }
  const { clearSessionCookies } = await import("../auth-cookies");
  await clearSessionCookies();
  await setFlash("info", "You have been signed out");
  redirect("/admin/login");
}

export async function saveProduct(_prev: FormState, form: FormData): Promise<FormState> {
  const id = String(form.get("id") ?? "");
  let specs: Record<string, string> = {};
  let images: string[] = [];
  try {
    specs = JSON.parse(String(form.get("specs") ?? "{}"));
    images = JSON.parse(String(form.get("images") ?? "[]"));
  } catch {
    return { error: "Specifications or images are not valid", ts: Date.now() };
  }
  const price = Number(form.get("price"));
  const compare = String(form.get("compare_price") ?? "").trim();
  const stock = Number(form.get("stock_qty"));
  const category = String(form.get("category_id") ?? "");
  const name = String(form.get("name") ?? "").trim();
  if (!name) return { error: "Product name is required", ts: Date.now() };
  if (!(price > 0)) return { error: "Price must be greater than 0", ts: Date.now() };
  if (!Number.isInteger(stock) || stock < 0) return { error: "Stock must be a whole number, 0 or more", ts: Date.now() };
  try {
    await adminApi(id ? `/api/ops/admin/products/${id}` : "/api/ops/admin/products", {
      method: id ? "PUT" : "POST",
      body: {
        name, description: String(form.get("description") ?? "").trim(), price,
        compare_price: compare ? Number(compare) : null, stock_qty: stock,
        brand: String(form.get("brand") ?? "").trim(), category_id: category ? Number(category) : null,
        warranty: String(form.get("warranty") ?? "").trim(), featured: form.get("featured") === "on",
        status: String(form.get("status") ?? "ACTIVE"), specs, images,
      },
    });
  } catch (e) {
    return { error: errorMessage(e), ts: Date.now() };
  }
  revalidatePath("/", "layout");
  await setFlash("success", id ? "Product updated" : "Product added");
  redirect("/admin/products");
}

export async function deleteProduct(id: number): Promise<{ ok: boolean; message: string }> {
  try {
    await adminApi(`/api/ops/admin/products/${id}`, { method: "DELETE" });
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Product deleted" };
}

export async function saveCategory(input: { id?: number; name: string; icon: string; sort_order: number }): Promise<{ ok: boolean; message: string }> {
  if (!input.name.trim()) return { ok: false, message: "Category name is required" };
  try {
    await adminApi(input.id ? `/api/ops/admin/categories/${input.id}` : "/api/ops/admin/categories", {
      method: input.id ? "PUT" : "POST", body: { name: input.name, icon: input.icon, sort_order: input.sort_order },
    });
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: input.id ? "Category updated" : "Category added" };
}

export async function deleteCategory(id: number): Promise<{ ok: boolean; message: string }> {
  try {
    await adminApi(`/api/ops/admin/categories/${id}`, { method: "DELETE" });
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Category deleted. Its products are now uncategorised." };
}

export async function updateOrderStatus(orderNo: string, status: string): Promise<{ ok: boolean; message: string }> {
  try {
    await adminApi(`/api/ops/admin/orders/${encodeURIComponent(orderNo)}/status`, { method: "PATCH", body: { status } });
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
  revalidatePath("/admin/orders", "layout");
  return { ok: true, message: "Order status updated" };
}

export async function sendTelegramTest(): Promise<{ ok: boolean; message: string }> {
  try {
    const r = await adminApi<{ sent: number }>("/api/notify/admin/telegram-test", { method: "POST" });
    return { ok: true, message: `Test message sent to ${r.sent} chat${r.sent === 1 ? "" : "s"}` };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

// ------------------------------------------------------------- user management
export async function createUser(_prev: FormState, form: FormData): Promise<FormState> {
  let id: number;
  try {
    const u = await adminApi<{ id: number }>("/api/auth/admin/users", {
      method: "POST",
      body: {
        name: String(form.get("name") ?? "").trim(), email: String(form.get("email") ?? "").trim(),
        password: String(form.get("password") ?? ""), phone: String(form.get("phone") ?? "").trim(),
        role: String(form.get("role") ?? "CUSTOMER"),
      },
    });
    id = u.id;
  } catch (e) {
    return { error: errorMessage(e), ts: Date.now() };
  }
  revalidatePath("/admin/users");
  await setFlash("success", "User created");
  redirect(`/admin/users/${id}`);
}

export async function updateUser(id: number, patch: { name?: string; phone?: string; role?: string; is_active?: boolean }): Promise<{ ok: boolean; message: string }> {
  try {
    await adminApi(`/api/auth/admin/users/${id}`, { method: "PATCH", body: patch });
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
  revalidatePath("/admin/users", "layout");
  return { ok: true, message: "User updated" };
}

export async function resetUserPassword(id: number, password: string): Promise<{ ok: boolean; message: string; temporary?: string }> {
  try {
    const r = await adminApi<{ temporary_password: string | null }>(`/api/auth/admin/users/${id}/reset-password`, {
      method: "POST", body: password ? { password } : {},
    });
    return { ok: true, message: "Password reset. The user is signed out everywhere.", temporary: r.temporary_password ?? undefined };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

export async function deleteUser(id: number): Promise<{ ok: boolean; message: string }> {
  try {
    await adminApi(`/api/auth/admin/users/${id}`, { method: "DELETE" });
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
  revalidatePath("/admin/users", "layout");
  return { ok: true, message: "User deleted" };
}
