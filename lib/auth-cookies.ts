import { cookies } from "next/headers";
import { SITE_URL } from "./config";

// Secure cookies only when the site itself is served over https (so http://localhost works too)
export const SECURE = SITE_URL.startsWith("https://");

export type Tokens = { access_token: string; refresh_token: string; expires_in: number };

export async function setSessionCookies(t: Tokens): Promise<void> {
  const jar = await cookies();
  const base = { httpOnly: true, sameSite: "lax" as const, secure: SECURE, path: "/" };
  jar.set("access_token", t.access_token, { ...base, maxAge: t.expires_in });
  jar.set("refresh_token", t.refresh_token, { ...base, maxAge: 60 * 60 * 24 * 7 });
}

export async function clearSessionCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete("access_token");
  jar.delete("refresh_token");
}

/** Only allow redirects inside this website. */
export function safeNext(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
