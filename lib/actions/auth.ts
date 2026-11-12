"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, errorMessage, getToken } from "../api";
import { clearSessionCookies, safeNext, setSessionCookies, type Tokens } from "../auth-cookies";
import { setFlash } from "../flash";
import type { Profile } from "../types";

export type AuthState = { error?: string; ts?: number; ok?: boolean; values?: Record<string, string> } | undefined;
export type ForgotState = { error?: string; ts?: number; ok?: boolean; emailConfigured?: boolean; devLink?: string } | undefined;
type TokenResponse = Tokens & { user: Profile };

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = safeNext(String(form.get("next") ?? ""));
  try {
    const t = await api<TokenResponse>("/api/auth/login", { method: "POST", body: { username, password } });
    await setSessionCookies(t);
    await setFlash("success", `Welcome back, ${t.user.name.split(" ")[0]}!`);
  } catch (e) {
    return { error: errorMessage(e), ts: Date.now(), values: { username } };
  }
  revalidatePath("/", "layout");
  redirect(next);
}

export async function register(_prev: AuthState, form: FormData): Promise<AuthState> {
  const values = {
    name: String(form.get("name") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    phone: String(form.get("phone") ?? "").trim(),
  };
  const password = String(form.get("password") ?? "");
  const next = safeNext(String(form.get("next") ?? ""));
  if (password !== String(form.get("confirm") ?? "")) return { error: "The two passwords do not match", ts: Date.now(), values };
  try {
    const t = await api<TokenResponse>("/api/auth/register", { method: "POST", body: { ...values, password } });
    await setSessionCookies(t);
    await setFlash("success", `Account created. Welcome, ${t.user.name.split(" ")[0]}!`);
  } catch (e) {
    return { error: errorMessage(e), ts: Date.now(), values };
  }
  revalidatePath("/", "layout");
  redirect(next);
}

export async function logout(): Promise<void> {
  const { cookies } = await import("next/headers");
  const refresh = (await cookies()).get("refresh_token")?.value;
  if (refresh) {
    try {
      await api("/api/auth/logout", { method: "POST", body: { refresh_token: refresh } });
    } catch {}
  }
  await clearSessionCookies();
  await setFlash("info", "You have been signed out");
  revalidatePath("/", "layout");
  redirect("/");
}

export async function telegramStart(): Promise<{ ok: boolean; url?: string; token?: string; message?: string }> {
  try {
    const r = await api<{ token: string; url: string }>("/api/auth/telegram/start", { method: "POST" });
    return { ok: true, ...r };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

export async function telegramPoll(token: string): Promise<{ status: "pending" | "confirmed" | "expired" }> {
  try {
    const r = await api<{ status: "pending" | "confirmed" | "expired"; tokens?: TokenResponse }>(
      `/api/auth/telegram/status/${encodeURIComponent(token)}`);
    if (r.status === "confirmed" && r.tokens) {
      await setSessionCookies(r.tokens);
      await setFlash("success", `Welcome, ${r.tokens.user.name.split(" ")[0]}!`);
      revalidatePath("/", "layout");
    }
    return { status: r.status };
  } catch {
    return { status: "pending" };
  }
}

/** Name and picture are inside the login token, so reissue it after a profile change. */
async function reissueSession(): Promise<void> {
  const { cookies } = await import("next/headers");
  const refresh = (await cookies()).get("refresh_token")?.value;
  if (!refresh) return;
  try {
    const t = await api<TokenResponse>("/api/auth/refresh", { method: "POST", body: { refresh_token: refresh } });
    await setSessionCookies(t);
  } catch {}
}

export async function updateProfile(_prev: AuthState, form: FormData): Promise<AuthState> {
  try {
    await api("/api/auth/me", {
      method: "PATCH", token: await getToken(),
      body: { name: String(form.get("name") ?? "").trim(), phone: String(form.get("phone") ?? "").trim() },
    });
  } catch (e) {
    return { error: errorMessage(e), ts: Date.now() };
  }
  await reissueSession();
  revalidatePath("/", "layout");
  return { ts: Date.now() };
}

export async function changePassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const current = String(form.get("current_password") ?? "");
  const next = String(form.get("new_password") ?? "");
  if (next !== String(form.get("confirm") ?? "")) return { error: "The two new passwords do not match", ts: Date.now() };
  try {
    // the server signs out every other device; this answer carries a fresh session for this one
    const t = await api<TokenResponse>("/api/auth/change-password", {
      method: "POST", token: await getToken(), body: { current_password: current, new_password: next },
    });
    await setSessionCookies(t);
  } catch (e) {
    return { error: errorMessage(e), ts: Date.now() };
  }
  return { ok: true, ts: Date.now() };
}

export async function forgotPassword(_prev: ForgotState, form: FormData): Promise<ForgotState> {
  const email = String(form.get("email") ?? "").trim();
  try {
    const r = await api<{ ok: boolean; email_configured: boolean; dev_link?: string }>("/api/auth/forgot-password", { method: "POST", body: { email } });
    return { ok: true, ts: Date.now(), emailConfigured: r.email_configured, devLink: r.dev_link };
  } catch (e) {
    return { error: errorMessage(e), ts: Date.now() };
  }
}

export async function resetPassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const password = String(form.get("password") ?? "");
  if (password !== String(form.get("confirm") ?? "")) return { error: "The two passwords do not match", ts: Date.now() };
  try {
    await api("/api/auth/reset-password", { method: "POST", body: { token: String(form.get("token") ?? ""), password } });
  } catch (e) {
    return { error: errorMessage(e), ts: Date.now() };
  }
  await setFlash("success", "Password updated. You can log in now.");
  redirect("/login");
}

export async function setAvatar(url: string): Promise<{ ok: boolean; message: string }> {
  try {
    const token = await getToken();
    const me = await api<Profile>("/api/auth/me", { token });
    await api("/api/auth/me", { method: "PATCH", token, body: { name: me.name, phone: me.phone, avatar_url: url } });
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
  await reissueSession();
  revalidatePath("/", "layout");
  return { ok: true, message: url ? "Profile picture updated" : "Profile picture removed" };
}

export async function setTelegramPref(enabled: boolean): Promise<{ ok: boolean; message: string }> {
  try {
    await api("/api/notify/preferences", { method: "PUT", token: await getToken(), body: { telegram_enabled: enabled } });
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
  return { ok: true, message: enabled ? "Telegram updates turned on" : "Telegram updates turned off" };
}
