"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

/** Sun/moon button: switches between Light and Dark. (Choose "System" in Settings → Appearance.) */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { isDark, setTheme } = useTheme();
  return (
    <button type="button" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-mist ${className}`}>
      <Sun className={`absolute h-[22px] w-[22px] transition duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`} />
      <Moon className={`absolute h-[22px] w-[22px] transition duration-300 ${isDark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
    </button>
  );
}
