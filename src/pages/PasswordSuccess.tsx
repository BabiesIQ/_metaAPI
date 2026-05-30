import { Link, useRouter } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";

export function PasswordSuccessPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // Auto-redirect to login after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.navigate({ to: "/login" });
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center text-center gap-5"
        data-ocid="password_success.page"
      >
        {/* Animated checkmark circle */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 16,
            delay: 0.1,
          }}
          className="relative"
        >
          {/* Outer ring pulse */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center">
            {/* SVG check */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-10 h-10 text-emerald-500"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Success"
              role="img"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth={2.5}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              />
            </svg>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
        >
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">
            {t("auth.pwd_success_title")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("auth.pwd_success_desc")}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Redirecting in a few seconds…
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.35 }}
          className="w-full space-y-3"
        >
          <Link to="/panel/dashboard" className="block">
            <Button
              type="button"
              className="w-full h-11 gradient-primary font-semibold text-sm text-white hover:opacity-90 transition-smooth border-0"
              data-ocid="password_success.dashboard.button"
            >
              {t("auth.pwd_success_dashboard")}
            </Button>
          </Link>
          <Link
            to="/login"
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="password_success.login.link"
          >
            {t("auth.pwd_success_login")}
          </Link>
        </motion.div>
      </motion.div>
    </AuthShell>
  );
}
