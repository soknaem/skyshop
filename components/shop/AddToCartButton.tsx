"use client";

import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/lib/actions/shop";
import { useToast } from "@/components/ui/Toaster";

export default function AddToCartButton({
  productId, stock, loggedIn, qty = 1, variant = "card", label = "Add to cart", onDone, className = "",
}: { productId: number; stock: number; loggedIn: boolean; qty?: number; variant?: "card" | "solid" | "dark"; label?: string; onDone?: () => void; className?: string }) {
  const toast = useToast();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const soldOut = stock <= 0;
  const style = variant === "card" ? "btn-primary w-full !py-2" : variant === "dark" ? "btn-dark w-full !py-3" : "btn-primary w-full !py-3";

  function click() {
    if (!loggedIn) {
      toast.info("Please log in to buy. You can browse without an account.", { label: "Log in", href: `/login?next=${encodeURIComponent(pathname)}` });
      return;
    }
    start(async () => {
      const r = await addToCart(productId, qty);
      if (r.ok) { toast.success(r.message ?? "Added", { label: "View cart", href: "/cart" }); onDone?.(); }
      else if (r.needsLogin) toast.info("Your session ended. Please log in again.", { label: "Log in", href: `/login?next=${encodeURIComponent(pathname)}` });
      else toast.error(r.message ?? "Could not add to cart");
    });
  }

  return (
    <button type="button" onClick={click} disabled={pending || soldOut} className={`${style} ${className}`}>
      {pending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : !soldOut && <ShoppingCart className="h-4 w-4" />}
      {soldOut ? "Out of stock" : pending ? "Adding…" : label}
    </button>
  );
}
