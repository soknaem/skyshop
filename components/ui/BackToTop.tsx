"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Appears after you scroll down a long page. */
export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 700);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      className={`fixed bottom-20 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/95 text-ink shadow-lift backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-brand hover:text-brand md:bottom-6 md:left-6 ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
      tabIndex={show ? 0 : -1}>
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
