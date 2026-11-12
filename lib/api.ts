import { cookies, headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { API_URL } from "./config";
import type { Cart } from "./types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Opts = Omit<RequestInit, "body"> & { body?: unknown; token?: string; formData?: FormData };

/** Calls the API gateway from server code (SSR pages and server actions). */
export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  const { body, token, headers: extra, formData, ...rest } = opts;
  const h: Record<string, string> = { ...(extra as Record<string, string>) };
  if (body !== undefined) h["Content-Type"] = "application/json";
  if (token) h["Authorization"] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      cache: "no-store", ...rest, headers: h,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError(503, "Cannot reach the server. Is the API gateway running?");
  }
  if (!res.ok) {
    let message = "Something went wrong";
    try {
      message = (await res.json())?.error?.message ?? message;
    } catch {}
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get("access_token")?.value;
}

async function currentPath(): Promise<string> {
  return (await headers()).get("x-pathname") ?? "/";
}

/** API call that needs a logged-in customer: sends the visitor to the login page otherwise. */
export async function authed<T>(path: string, opts: Opts = {}): Promise<T> {
  const token = await getToken();
  if (!token) redirect(`/login?next=${encodeURIComponent(await currentPath())}`);
  try {
    return await api<T>(path, { ...opts, token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect(`/login?next=${encodeURIComponent(await currentPath())}`);
    throw e;
  }
}

/** Admin API call: adds the JWT from the httpOnly cookie. */
export async function adminApi<T>(path: string, opts: Opts = {}): Promise<T> {
  const token = await getToken();
  if (!token) redirect("/admin/login");
  try {
    return await api<T>(path, { ...opts, token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect("/admin/login");
    if (e instanceof ApiError && e.status === 403) redirect("/admin/login?denied=1");
    throw e;
  }
}

export const EMPTY_CART: Cart = { items: [], total: 0, count: 0, currency: "KHR" };

export const getCart = cache(async function getCart(): Promise<Cart> {
  const token = await getToken();
  if (!token) return EMPTY_CART;
  try {
    return await api<Cart>("/api/ops/cart", { token });
  } catch {
    return EMPTY_CART;
  }
});

export const getWishlistIds = cache(async function getWishlistIds(): Promise<number[]> {
  const token = await getToken();
  if (!token) return [];
  try {
    return await api<number[]>("/api/ops/wishlist/ids", { token });
  } catch {
    return [];
  }
});

export function errorMessage(e: unknown): string {
  return e instanceof ApiError ? e.message : "Something went wrong. Please try again.";
}
