"use client";

import { useEffect } from "react";

const typing = (el: Element | null) =>
  !!el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || (el as HTMLElement).isContentEditable);

const visible = (el: HTMLElement) => el.offsetParent !== null && el.getClientRects().length > 0;

/** "/" jumps to the search box on any page; Esc leaves it. */
export default function KeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !typing(document.activeElement)) {
        const input = Array.from(document.querySelectorAll<HTMLElement>("[data-search-input]")).find(visible);
        if (input) { e.preventDefault(); input.focus(); (input as HTMLInputElement).select?.(); return; }
        const toggle = document.querySelector<HTMLElement>("[data-search-toggle]");   // phones: open the search bar first
        if (toggle && visible(toggle)) {
          e.preventDefault();
          toggle.click();
          setTimeout(() => document.querySelector<HTMLElement>("[data-search-input]")?.focus(), 60);
        }
      } else if (e.key === "Escape") {
        const el = document.activeElement as HTMLElement | null;
        if (el?.hasAttribute("data-search-input")) { el.blur(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
