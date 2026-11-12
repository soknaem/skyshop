import { NextRequest, NextResponse } from "next/server";
import { API_URL, SITE_URL } from "@/lib/config";

const secure = SITE_URL.startsWith("https://");

/** Called by the middleware when the access token cookie has expired but the refresh token is still valid. */
export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const refresh = req.cookies.get("refresh_token")?.value;
  const fail = () => {
    const to = safeNext.startsWith("/admin") ? "/admin/login" : safeNext === "/" || !/^\/(checkout|account|wishlist|order|settings)/.test(safeNext) ? "/" : `/login?next=${encodeURIComponent(safeNext)}`;
    const res = NextResponse.redirect(new URL(to, req.url));
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    return res;
  };
  if (!refresh) return fail();
  try {
    const r = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }), cache: "no-store",
    });
    if (!r.ok) return fail();
    const t = await r.json();
    const res = NextResponse.redirect(new URL(safeNext, req.url));
    const base = { httpOnly: true, sameSite: "lax" as const, secure, path: "/" };
    res.cookies.set("access_token", t.access_token, { ...base, maxAge: t.expires_in });
    res.cookies.set("refresh_token", t.refresh_token, { ...base, maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch {
    return fail();
  }
}
