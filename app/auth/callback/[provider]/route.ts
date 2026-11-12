import { NextRequest, NextResponse } from "next/server";
import { API_URL, SITE_URL } from "@/lib/config";

const secure = SITE_URL.startsWith("https://");

/** Step 2: the provider sends the browser back here with ?code=...&state=... */
export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const sp = req.nextUrl.searchParams;
  const fail = (error: string) => {
    const res = NextResponse.redirect(new URL(`/login?error=${error}&provider=${provider}`, SITE_URL));
    res.cookies.delete("oauth_state");
    res.cookies.delete("oauth_next");
    return res;
  };
  const code = sp.get("code");
  const state = sp.get("state");
  if (sp.get("error") || !code) return fail("cancelled");
  if (!state || state !== req.cookies.get("oauth_state")?.value) return fail("bad_state");  // CSRF protection

  try {
    const r = await fetch(`${API_URL}/api/auth/oauth/${provider}/callback`, {
      method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
      body: JSON.stringify({ code, redirect_uri: `${SITE_URL}/auth/callback/${provider}` }),
    });
    if (!r.ok) return fail("failed");
    const t = await r.json();
    const next = req.cookies.get("oauth_next")?.value ?? "/";
    const res = NextResponse.redirect(new URL(next, SITE_URL));
    const base = { httpOnly: true, sameSite: "lax" as const, secure, path: "/" };
    res.cookies.set("access_token", t.access_token, { ...base, maxAge: t.expires_in });
    res.cookies.set("refresh_token", t.refresh_token, { ...base, maxAge: 60 * 60 * 24 * 7 });
    res.cookies.set("flash", encodeURIComponent(JSON.stringify({ type: "success", message: `Welcome, ${String(t.user.name).split(" ")[0]}!` })), { path: "/", maxAge: 30 });
    res.cookies.delete("oauth_state");
    res.cookies.delete("oauth_next");
    return res;
  } catch {
    return fail("failed");
  }
}
