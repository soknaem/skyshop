import { cookies } from "next/headers";
import { cache } from "react";

export type Session = { id: number; name: string; email: string; role: string; picture: string };

/** UI only: reads the claims of the JWT cookie. The API always re-verifies the token itself. */
export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export const getSession = cache(async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return null;
  const c = decodeJwt(token);
  if (!c || typeof c.exp !== "number" || c.exp * 1000 < Date.now()) return null;
  return {
    id: Number(c.sub), name: String(c.name ?? c.username ?? "Account"), email: String(c.email ?? ""),
    role: String(c.role ?? "CUSTOMER"), picture: String(c.picture ?? ""),
  };
});
