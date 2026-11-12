import { PUBLIC_API } from "./config";

let cached: { token: string; exp: number } | null = null;

function expiryOf(token: string): number {
  try { return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).exp * 1000; } catch { return 0; }
}

/** Token for browser-side calls to the gateway (notifications, WebSocket). Renewed automatically. */
export async function gatewayToken(force = false): Promise<string | null> {
  if (!force && cached && cached.exp - 30_000 > Date.now()) return cached.token;
  try {
    const t = (await (await fetch("/api/ws-token", { cache: "no-store" })).json()).token as string | null;
    cached = t ? { token: t, exp: expiryOf(t) } : null;
    return t;
  } catch {
    return null;
  }
}

export function forgetToken(): void { cached = null; }

export async function gw<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  for (const force of [false, true]) {
    const token = await gatewayToken(force);
    if (!token) return null;
    const r = await fetch(`${PUBLIC_API}${path}`, { ...init, headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}`, ...(init.body ? { "Content-Type": "application/json" } : {}) } });
    if (r.status === 401 && !force) continue;
    if (!r.ok) return null;
    return (await r.json()) as T;
  }
  return null;
}
