import { PUBLIC_API, SITE_URL } from "./config";

export function money(amount: number, currency: string | null | undefined): string {
  const cur = currency ?? "KHR";
  if (cur === "KHR") return `${Math.round(amount).toLocaleString("en-US")}៛`;
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function dateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Phnom_Penh" });
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Phnom_Penh" });
}

/** Uploaded images live on the gateway (/media/...); demo pictures live in this site (/products/...). */
export function imageSrc(url: string | null | undefined): string {
  if (!url || !url.trim()) return "/products/placeholder.svg";
  if (url.startsWith("/media/")) return `${PUBLIC_API}${url}`;
  return url;
}

export function absoluteImage(url: string | null | undefined): string {
  const src = imageSrc(url);
  return src.startsWith("http") ? src : `${SITE_URL}${src}`;
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}
