"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  KEYS,
  applyTextSize,
  applyTheme,
  readTextSize,
  readTheme,
  type TextSize,
  type Theme,
} from "@/lib/prefs";

type Ctx = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function useTheme(): Ctx {
  const context = useContext(ThemeCtx);
  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return context;
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [isDark, setIsDark] = useState(false);
  const [textSize, setTextSizeState] = useState<TextSize>("default");

  useEffect(() => {
    const savedTheme = readTheme();
    setThemeState(savedTheme);
    setIsDark(applyTheme(savedTheme));

    const savedTextSize = readTextSize();
    setTextSizeState(savedTextSize);
    applyTextSize(savedTextSize);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleColorSchemeChange = () => {
      if (readTheme() === "system") {
        setIsDark(applyTheme("system"));
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === KEYS.theme) {
        const savedTheme = readTheme();
        setThemeState(savedTheme);
        setIsDark(applyTheme(savedTheme));
      }

      if (event.key === KEYS.size) {
        const savedTextSize = readTextSize();
        setTextSizeState(savedTextSize);
        applyTextSize(savedTextSize);
      }
    };

    mediaQuery.addEventListener("change", handleColorSchemeChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      mediaQuery.removeEventListener("change", handleColorSchemeChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    localStorage.setItem(KEYS.theme, nextTheme);
    setThemeState(nextTheme);
    setIsDark(applyTheme(nextTheme));
  }, []);

  const setTextSize = useCallback((nextTextSize: TextSize) => {
    localStorage.setItem(KEYS.size, nextTextSize);
    setTextSizeState(nextTextSize);
    applyTextSize(nextTextSize);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, isDark, textSize, setTextSize }),
    [theme, setTheme, isDark, textSize, setTextSize],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}