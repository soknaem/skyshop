import { cookies } from "next/headers";

/** One-time message shown as a toast after a redirect (read by components/ui/FlashToast.tsx). */
export async function setFlash(type: "success" | "error" | "info", message: string): Promise<void> {
  (await cookies()).set("flash", encodeURIComponent(JSON.stringify({ type, message })), {
    path: "/", maxAge: 30, httpOnly: false, sameSite: "lax",
  });
}
