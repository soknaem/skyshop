/** Device preferences (theme, text size, desktop notifications). Stored in localStorage; applied before first paint. */
export type Theme = "light" | "dark" | "system";
export type TextSize = "small" | "default" | "large";

export const KEYS = { theme: "pref:theme", size: "pref:textsize", desktop: "pref:desktop-notify" } as const;
export const SIZE_PX: Record<TextSize, number> = { small: 14, default: 16, large: 18 };

/** Runs inline in <head> BEFORE the page paints, so there is no white flash and no text-size jump. */
export const PRE_PAINT_SCRIPT = `(function(){try{var d=document.documentElement,t=localStorage.getItem("${KEYS.theme}")||"system",dark=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);d.classList.toggle("dark",dark);d.style.colorScheme=dark?"dark":"light";var s=localStorage.getItem("${KEYS.size}")||"default";d.style.fontSize=({small:"14px",default:"16px",large:"18px"})[s]||"16px"}catch(e){}})();`;

export function resolveDark(theme: Theme): boolean {
  return theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

export function applyTheme(theme: Theme): boolean {
  const dark = resolveDark(theme);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  return dark;
}

export function applyTextSize(size: TextSize): void {
  document.documentElement.style.fontSize = `${SIZE_PX[size]}px`;
}

export function readTheme(): Theme {
  const v = localStorage.getItem(KEYS.theme);
  return v === "light" || v === "dark" ? v : "system";
}
export function readTextSize(): TextSize {
  const v = localStorage.getItem(KEYS.size);
  return v === "small" || v === "large" ? v : "default";
}
export function desktopNotifyEnabled(): boolean {
  return typeof Notification !== "undefined" && Notification.permission === "granted" && localStorage.getItem(KEYS.desktop) === "1";
}
