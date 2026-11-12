"use client";

import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/lib/actions/shop";
import { useToast } from "@/components/ui/Toaster";

export default function WishlistButton({
  productId, wished: initial, loggedIn, variant = "icon", className = "",
}: { productId: number; wished: boolean; loggedIn: boolean; variant?: "icon" | "button"; className?: string }) {
  const toast = useToast();
  const pathname = usePathname();
  const [wished, setWished] = useState(initial);
  const [, start] = useTransition();
  const [pop, setPop] = useState(0);

  function click(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) {
      toast.info("Log in to save items to your wishlist", { label: "Log in", href: `/login?next=${encodeURIComponent(pathname)}` });
      return;
    }
    const next = !wished;
    setWished(next);
    setPop((n) => n + 1);
    start(async () => {
      const r = await toggleWishlist(productId, next);
      if (!r.ok) { setWished(!next); toast.error(r.message ?? "Could not update your wishlist"); }
      else toast.success(r.message ?? "Updated", next ? { label: "View wishlist", href: "/wishlist" } : undefined);
    });
  }

  const icon = <Heart key={pop} className={`h-[18px] w-[18px] ${pop ? "animate-pop" : ""} ${wished ? "fill-sale text-sale" : ""}`} />;
  if (variant === "button") {
    return (
      <button type="button" onClick={click} aria-pressed={wished} className={`btn-outline ${className}`}>
        {icon}{wished ? "Saved" : "Save"}
      </button>
    );
  }
  return (
    <button type="button" onClick={click} aria-pressed={wished} aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
      className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-slate-600 shadow-card backdrop-blur transition hover:scale-110 hover:text-sale ${className}`}>
      {icon}
    </button>
  );
}
