"use client";

import { useRouter } from "next/navigation";

/** Table row that opens its detail page when clicked anywhere (and with Enter for keyboard users). */
export default function ClickableRow({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const router = useRouter();
  return (
    <tr tabIndex={0} role="link" onClick={() => router.push(href)} onKeyDown={(e) => e.key === "Enter" && router.push(href)}
      className={`cursor-pointer border-t border-line transition hover:bg-brand-soft/40 focus:bg-brand-soft/40 focus:outline-none ${className}`}>
      {children}
    </tr>
  );
}
