import { NextRequest, NextResponse } from "next/server";

const PROTECTED_SHOP = /^\/(checkout|account|wishlist|order|settings)(\/|$)/;

function role(token: string): string {
  try {
    const p = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return String(JSON.parse(atob(p)).role ?? "");
  } catch {
    return "";
  }
}

/**
 * - Passes the current path to server components (x-pathname) so they can build "log in, then come back" links.
 * - Access token cookie gone but refresh token present -> silently refresh (GET navigations only).
 * - /admin needs an ADMIN token; checkout, account, wishlist and orders need any login.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const access = req.cookies.get("access_token")?.value;
  const refresh = req.cookies.get("refresh_token")?.value;
  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (!access) {
    const navigation = req.method === "GET" && !req.headers.get("next-router-prefetch") && req.headers.get("purpose") !== "prefetch";
    if (refresh && navigation) {
      const url = req.nextUrl.clone();
      url.pathname = "/session/refresh";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
    if (isAdminArea) return NextResponse.redirect(new URL("/admin/login", req.url));
    if (PROTECTED_SHOP.test(pathname)) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname + search)}`, req.url));
  } else if (isAdminArea && role(access) !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin/login?denied=1", req.url));
  }

  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname + search);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|session/|auth/|.*\\.[a-zA-Z0-9]+$).*)"],
};
