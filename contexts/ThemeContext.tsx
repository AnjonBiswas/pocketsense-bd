"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
};

const STORAGE_KEY = "pocketsense-theme";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveTheme(theme: ThemeMode) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const nextTheme =
      savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
        ? savedTheme
        : "system";

    setThemeState(nextTheme);
    setResolvedTheme(resolveTheme(nextTheme));
  }, []);

  useEffect(() => {
    const appliedTheme = resolveTheme(theme);
    setResolvedTheme(appliedTheme);
    document.documentElement.classList.toggle("dark", appliedTheme === "dark");
    window.localStorage.setItem(STORAGE_KEY, theme);

    if (theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      const nextResolvedTheme = media.matches ? "dark" : "light";
      setResolvedTheme(nextResolvedTheme);
      document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark");
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: setThemeState
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
