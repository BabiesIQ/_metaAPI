import { Link } from "@tanstack/react-router";
import { Activity, Globe, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface AuthShellProps {
  children: ReactNode;
}

const features = [
  {
    icon: Zap,
    key: "auth_feature_fast_title" as const,
    descKey: "auth_feature_fast_desc" as const,
  },
  {
    icon: Globe,
    key: "auth_feature_global_title" as const,
    descKey: "auth_feature_global_desc" as const,
  },
  {
    icon: Shield,
    key: "auth_feature_secure_title" as const,
    descKey: "auth_feature_secure_desc" as const,
  },
];

export function AuthShell({ children }: AuthShellProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left brand panel (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, oklch(0.12 0.06 254) 0%, oklch(0.09 0.04 270) 50%, oklch(0.11 0.08 290) 100%)",
        }}
      >
        {/* Animated orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div
            className="absolute top-[-80px] left-[-80px] w-[480px] h-[480px] rounded-full orb-animate-1"
            style={{
              background:
                "radial-gradient(circle, oklch(0.72 0.24 254 / 0.18) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-[-120px] right-[-60px] w-[420px] h-[420px] rounded-full orb-animate-2"
            style={{
              background:
                "radial-gradient(circle, oklch(0.65 0.22 310 / 0.15) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full orb-animate-3"
            style={{
              background:
                "radial-gradient(circle, oklch(0.60 0.20 280 / 0.10) 0%, transparent 70%)",
            }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-12 xl:px-16 py-12">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2.5 mb-14 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Babies<span className="opacity-60">IQ</span>
            </span>
          </Link>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 badge-pulse" />
              <span className="text-xs font-medium text-white/70">
                {t("hero.badge")}
              </span>
            </div>

            <h2 className="font-display font-bold text-3xl xl:text-4xl text-white leading-tight mb-4">
              {t("auth.left_headline")}
            </h2>
            <p className="text-base text-white/50 leading-relaxed mb-10 max-w-sm">
              {t("auth.left_subheadline")}
            </p>

            {/* Feature bullets */}
            <div className="space-y-4 mb-10">
              {features.map((f, i) => (
                <motion.div
                  key={f.key}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + i * 0.1,
                    ease: "easeOut",
                  }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center">
                    <f.icon className="w-[18px] h-[18px] text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">
                      {t(`auth.${f.key}`)}
                    </p>
                    <p className="text-xs text-white/45 mt-0.5">
                      {t(`auth.${f.descKey}`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Floating code preview card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
              className="rounded-xl border border-white/10 overflow-hidden"
              style={{ background: "oklch(0.08 0.025 254 / 0.85)" }}
            >
              {/* Terminal title bar */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/8">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-2 text-[11px] text-white/30 font-mono">
                  api_request.js
                </span>
              </div>
              <div className="px-4 py-3 font-mono text-[11px] leading-relaxed">
                <p>
                  <span className="text-blue-400">const</span>{" "}
                  <span className="text-white/80">response</span>{" "}
                  <span className="text-white/50">=</span>{" "}
                  <span className="text-yellow-400">await</span>{" "}
                  <span className="text-white/80">fetch</span>
                  <span className="text-white/50">(</span>
                </p>
                <p className="pl-4">
                  <span className="text-emerald-400">
                    `https://api.babiesiq.tech/api/stream`
                  </span>
                  <span className="text-white/50">,</span>
                </p>
                <p className="pl-4">
                  <span className="text-white/50">{"{"}</span>{" "}
                  <span className="text-blue-300">headers</span>
                  <span className="text-white/50">:</span>{" "}
                  <span className="text-white/50">{"{"}</span>{" "}
                  <span className="text-emerald-400">"X-API-Key"</span>
                  <span className="text-white/50">:</span>{" "}
                  <span className="text-orange-400">apiKey</span>{" "}
                  <span className="text-white/50">{"}}"}</span>
                </p>
                <p>
                  <span className="text-white/50">);</span>
                </p>
                <p className="mt-1">{/* ✓ 200 OK · 78ms · audio/mpeg */}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom stats bar */}
        <div className="relative z-10 px-12 xl:px-16 py-7 border-t border-white/8">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "10M+", label: t("hero.stats_requests") },
              { value: "99.9%", label: t("hero.stats_uptime") },
              { value: "<80ms", label: t("hero.stats_latency") },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display font-bold text-lg text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Subtle bg orbs for form side */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, oklch(0.72 0.24 254 / 0.6), transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full opacity-[0.07]"
            style={{
              background:
                "radial-gradient(circle, oklch(0.65 0.22 310 / 0.6), transparent 70%)",
            }}
          />
        </div>

        {/* Mobile logo (hidden on desktop) */}
        <div className="lg:hidden flex items-center justify-center pt-8 pb-2 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              <span className="text-primary">Babies</span>
              <span className="text-foreground">IQ</span>
            </span>
          </Link>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 relative z-10">
          <div className="w-full max-w-[420px]">
            <div className="bg-card border border-border rounded-2xl p-7 sm:p-8 shadow-elevated">
              {children}
            </div>

            {/* Footer legal */}
            <p className="mt-5 text-xs text-muted-foreground text-center leading-relaxed">
              {t("auth.by_continuing")}{" "}
              <a
                href="/terms"
                className="text-primary hover:underline transition-colors"
              >
                {t("footer.terms")}
              </a>{" "}
              {t("common.and")}{" "}
              <a
                href="/privacy"
                className="text-primary hover:underline transition-colors"
              >
                {t("footer.privacy")}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
