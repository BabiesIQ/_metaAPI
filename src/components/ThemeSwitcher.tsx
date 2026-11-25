import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "@/hooks/useThemeMode";

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeMode();
  const { t } = useTranslation();
  const dark = theme !== "light";
  const label = t(dark ? "common.light_mode" : "common.dark_mode");
  return (
    <button type="button" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={label} title={label} aria-pressed={dark} data-ocid="theme_switcher.toggle" className="relative flex h-9 w-16 shrink-0 items-center rounded-full border border-border bg-muted p-1 transition-colors hover:border-primary">
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-background text-primary shadow-sm transition-transform duration-200 motion-reduce:transition-none ${dark ? "translate-x-6 rtl:-translate-x-6" : ""}`}>
        {dark ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
      </span>
    </button>
  );
}
