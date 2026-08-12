import { useCallback, useRef, useState } from "react";

export type ThemeMode = "dark" | "light" | "midnight";
export const CYCLE_ORDER: ThemeMode[] = ["dark", "light", "midnight"];
const STORAGE_KEY = "babiesiq-theme";

export function getSavedTheme(): ThemeMode {
  if (typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "dark" || saved === "light" || saved === "midnight")
        return saved as ThemeMode;
    } catch {}
  }
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyThemeToDOM(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "light", "midnight");
  root.setAttribute("data-theme", mode);
  if (mode === "dark") root.classList.add("dark");
  if (mode === "midnight") root.classList.add("midnight");
  // light = no extra class (default :root styles)
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {}
}

/**
 * Apply the saved theme before React mounts. Auth pages do not render the
 * header, so waiting for ThemeSwitcher would otherwise make them fall back to
 * the light theme after a session redirect.
 */
export function initializeTheme() {
  const saved = getSavedTheme();
  applyThemeToDOM(saved);
  return saved;
}

export function useThemeMode() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = getSavedTheme();
    if (typeof document !== "undefined") applyThemeToDOM(saved);
    return saved;
  });

  // Exposed so ThemeSwitcher can lock the button during animation
  const isAnimatingRef = useRef(false);

  const cycleTheme = useCallback(() => {
    // Guard: if an animation is already in progress, ignore this call
    if (isAnimatingRef.current) return;

    setThemeState((prev) => {
      const currentIdx = CYCLE_ORDER.indexOf(prev);
      const next = CYCLE_ORDER[(currentIdx + 1) % CYCLE_ORDER.length];
      applyThemeToDOM(next);
      return next;
    });
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    applyThemeToDOM(mode);
    setThemeState(mode);
  }, []);

  return {
    theme,
    cycleTheme,
    setTheme,
    toggleTheme: cycleTheme,
    isAnimatingRef,
    mounted: true,
  };
}
