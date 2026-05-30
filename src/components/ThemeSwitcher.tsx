import { CYCLE_ORDER, useThemeMode } from "@/hooks/useThemeMode";
import type { ThemeMode } from "@/hooks/useThemeMode";

const THEME_BG: Record<ThemeMode, string> = {
  light: "#f8f8fc",
  dark: "#111118",
  midnight: "#0b0b1a",
};

export function ThemeSwitcher() {
  const { theme, setTheme, isAnimatingRef } = useThemeMode();

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const x = e.clientX;
    const y = e.clientY;
    const currentIdx = CYCLE_ORDER.indexOf(theme);
    const nextTheme = CYCLE_ORDER[(currentIdx + 1) % CYCLE_ORDER.length];

    // Apply the new theme immediately — it sits underneath the overlay
    setTheme(nextTheme);

    // Overlay = OLD theme's bg color. It starts covering the full viewport
    // and contracts toward the click point, revealing the new theme beneath.
    const overlay = document.createElement("div");
    overlay.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:9998",
      "pointer-events:none",
      `background:${THEME_BG[theme]}`,
      "will-change:clip-path",
      `clip-path:circle(200vmax at ${x}px ${y}px)`,
    ].join(";");
    document.body.appendChild(overlay);

    // Double rAF ensures the browser has painted the start state before
    // the transition begins — prevents the "no animation" flash.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.transition = "clip-path 500ms cubic-bezier(0.4,0,0.2,1)";
        overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      });
    });

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      overlay.remove();
      isAnimatingRef.current = false;
    };
    // transitionend fires when clip-path finishes
    overlay.addEventListener("transitionend", cleanup, { once: true });
    // Fallback: ensure cleanup even if transitionend misfires
    setTimeout(cleanup, 560);
  }

  const ariaLabels: Record<ThemeMode, string> = {
    dark: "Dark mode \u2014 click for Light",
    light: "Light mode \u2014 click for Midnight",
    midnight: "Midnight mode \u2014 click for Dark",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabels[theme]}
      title={ariaLabels[theme]}
      data-ocid="theme_switcher.toggle"
      disabled={false}
      style={{ pointerEvents: "auto" }}
      className="relative w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground bg-transparent hover:bg-muted border border-transparent hover:border-border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 0 14px oklch(0.72 0.24 254 / 0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
      }}
    >
      {theme === "light" ? (
        <SunIcon />
      ) : theme === "midnight" ? (
        <SparklesIcon />
      ) : (
        <CrescentMoon />
      )}
    </button>
  );
}

function CrescentMoon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M17 10.5A7 7 0 0 1 9.5 3a7 7 0 1 0 7.5 7.5z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="4" fill="currentColor" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 10 + 6 * Math.cos(rad);
        const y1 = 10 + 6 * Math.sin(rad);
        const x2 = 10 + 8 * Math.cos(rad);
        const y2 = 10 + 8 * Math.sin(rad);
        return (
          <line
            key={deg}
            x1={x1.toFixed(2)}
            y1={y1.toFixed(2)}
            x2={x2.toFixed(2)}
            y2={y2.toFixed(2)}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="15" cy="4" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="5" cy="15" r="0.75" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
