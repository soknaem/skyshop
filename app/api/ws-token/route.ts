import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL, SITE_URL } from "@/lib/config";

const secure = SITE_URL.startsWith("https://");

/**
 * Browsers cannot send headers on a WebSocket (and fetch from the browser needs the token explicitly), so a logged-in
 * visitor gets their token here. If the short-lived access token has expired but the refresh token is still valid,
 * it is renewed here, so live features keep working on a page that stays open for hours.
 */
export async function GET() {
  const jar = await cookies();
  const access = jar.get("access_token")?.value;
  if (access) return NextResponse.json({ token: access });
  const refresh = jar.get("refresh_token")?.value;
  if (!refresh) return NextResponse.json({ token: null });
  try {
    const r = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: refresh }), cache: "no-store",
    });
    if (!r.ok) return NextResponse.json({ token: null });
    const t = await r.json();
    const res = NextResponse.json({ token: t.access_token });
    const base = { httpOnly: true, sameSite: "lax" as const, secure, path: "/" };
    res.cookies.set("access_token", t.access_token, { ...base, maxAge: t.expires_in });
    res.cookies.set("refresh_token", t.refresh_token, { ...base, maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch {
    return NextResponse.json({ token: null });
  }
}
