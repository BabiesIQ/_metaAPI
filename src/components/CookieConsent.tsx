import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "babiesiq-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Show only if user hasn't accepted/rejected yet
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Slight delay so the page loads first
      const timer = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cookie-banner"
          initial={{ opacity: 0, y: 80, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-5 md:bottom-5 md:w-[360px] z-[9999]"
          aria-label="Cookie consent"
          data-ocid="cookie_consent.dialog"
        >
          {/* Glow blob behind card */}
          <div
            aria-hidden
            className="absolute -inset-px rounded-2xl opacity-40 blur-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(168,85,247,0.5) 0%, rgba(236,72,153,0.4) 50%, rgba(59,130,246,0.4) 100%)",
            }}
          />

          {/* Card */}
          <div className="relative rounded-2xl border border-white/10 bg-card/90 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-4 flex flex-col gap-3">
            {/* Top row */}
            <div className="flex items-start gap-3">
              {/* Cookie emoji icon */}
              <div
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.24 254 / 0.2), oklch(0.65 0.22 310 / 0.2))",
                }}
                aria-hidden
              >
                🍪
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-snug">
                  {t("cookies.title", "We use cookies")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {t(
                    "cookies.description",
                    "We use cookies to improve your experience, analyze traffic, and personalize content. You can accept or decline.",
                  )}
                </p>
              </div>
            </div>

            {/* Privacy link */}
            <p className="text-[11px] text-muted-foreground">
              {t("cookies.read_more", "Learn more in our")}{" "}
              <a
                href="/privacy"
                className="underline underline-offset-2 hover:text-foreground transition-colors duration-150"
                data-ocid="cookie_consent.privacy_link"
              >
                {t("cookies.privacy_policy", "Privacy Policy")}
              </a>
              .
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={decline}
                className="flex-1 h-8 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-all duration-200"
                data-ocid="cookie_consent.decline_button"
              >
                {t("cookies.decline", "Decline")}
              </button>
              <button
                type="button"
                onClick={accept}
                className="flex-1 h-8 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                  boxShadow: "0 4px 14px rgba(168,85,247,0.35)",
                }}
                data-ocid="cookie_consent.accept_button"
              >
                {t("cookies.accept", "Accept all")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
