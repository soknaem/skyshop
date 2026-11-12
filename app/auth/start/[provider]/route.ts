import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { API_URL, SITE_URL } from "@/lib/config";

const secure = SITE_URL.startsWith("https://");

/** Step 1 of Google / Facebook login: remember a random "state" and send the browser to the provider. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const next = req.nextUrl.searchParams.get("next") ?? "/";
  const back = (error: string) => NextResponse.redirect(new URL(`/login?error=${error}&provider=${provider}`, SITE_URL));
  if (!["google", "facebook"].includes(provider)) return back("unknown_provider");

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${SITE_URL}/auth/callback/${provider}`;
  try {
    const r = await fetch(`${API_URL}/api/auth/oauth/${provider}/url?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`, { cache: "no-store" });
    if (r.status === 501) return back("not_configured");
    if (!r.ok) return back("failed");
    const { url } = await r.json();
    const res = NextResponse.redirect(url);
    const opts = { httpOnly: true, sameSite: "lax" as const, secure, path: "/", maxAge: 600 };
    res.cookies.set("oauth_state", state, opts);
    res.cookies.set("oauth_next", next.startsWith("/") && !next.startsWith("//") ? next : "/", opts);
    return res;
  } catch {
    return back("failed");
  }
}
