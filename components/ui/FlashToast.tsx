"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "./Toaster";

/** Shows the one-time message (cookie "flash") that a server action left before redirecting. */
export default function FlashToast() {
  const toast = useToast();
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    const m = document.cookie.split("; ").find((c) => c.startsWith("flash="));
    if (m) {
      document.cookie = "flash=; Max-Age=0; path=/";
      try {
        const { type, message } = JSON.parse(decodeURIComponent(m.slice(6)));
        toast[type as "success" | "error" | "info"]?.(message);
      } catch {}
    }
    const err = search.get("error");
    if (err && pathname === "/login") {
      const provider = search.get("provider") ?? "social";
      const msg: Record<string, string> = {
        not_configured: `${provider[0]?.toUpperCase()}${provider.slice(1)} login is not set up yet. Ask the site owner to add the keys.`,
        cancelled: "Sign-in was cancelled",
        bad_state: "Sign-in could not be verified. Please try again.",
        failed: "Sign-in failed. Please try again.",
      };
      toast.error(msg[err] ?? "Sign-in failed");
    }
    if (search.get("denied") && pathname === "/admin/login") toast.error("This account does not have admin access");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  return null;
}
