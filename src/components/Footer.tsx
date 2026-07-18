import { Link } from "@tanstack/react-router";
import { ArrowUp, Check, Send } from "lucide-react";
import { AnimatePresence, motion, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiGithub, SiX, SiYoutube } from "react-icons/si";
import { toast } from "sonner";

const SOCIAL_LINKS = [
  {
    href: "https://github.com/BabiesIQ/BabyAPI",
    label: "GitHub",
    icon: SiGithub,
    hoverClass: "social-icon-github",
  },
  {
    href: "https://x.com",
    label: "X / Twitter",
    icon: SiX,
    hoverClass: "social-icon-x",
  },
  {
    href: "https://youtube.com",
    label: "YouTube",
    icon: SiYoutube,
    hoverClass: "social-icon-youtube",
  },
];

// ─── Newsletter strip ─────────────────────────────────────────────────────────
function NewsletterStrip() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error(t("footer.newsletter_email_invalid"));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      toast.success(t("footer.subscribed"), {
        description: t("footer.newsletter_toast_desc"),
      });
    }, 800);
  }

  return (
    <motion.section
      className="relative overflow-hidden border-t border-border"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 animated-gradient-bg opacity-80" />
      <div className="absolute inset-0 backdrop-blur-sm" />
      <div className="relative container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {t("footer.newsletter_badge")}
            </div>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              {t("footer.newsletter_title")}
            </h3>
            <p className="text-sm text-muted-foreground font-body mb-6">
              {t("footer.newsletter_desc")}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {subscribed ? (
              <motion.div
                key="success"
                className="flex items-center justify-center gap-2 text-primary font-body font-medium text-sm"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                data-ocid="footer.newsletter.success_state"
              >
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                {t("footer.subscribed")}
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubscribe}
                className="flex gap-2 max-w-sm mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-card/60 border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 backdrop-blur-sm transition-smooth"
                  data-ocid="footer.newsletter.email.input"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-display font-semibold text-sm text-white gradient-primary hover:opacity-90 hover:scale-[1.02] transition-smooth disabled:opacity-60 shrink-0"
                  data-ocid="footer.newsletter.submit_button"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {t("footer.subscribe")}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}

// ─── Back to top button ───────────────────────────────────────────────────────
  function BackToTop() {
    const [visible, setVisible] = useState(false);
    const { scrollY } = useScroll();

    useEffect(() => {
      return scrollY.on("change", (v) => setVisible(v > 300));
    }, [scrollY]);

    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center"
            data-ocid="back_to_top.wrapper"
          >
            {/* Left glow beam */}
            <div
              className="h-[2px] w-14 rounded-full"
              style={{
                background: "linear-gradient(to right, transparent, rgba(99,102,241,0.8))",
                boxShadow: "0 0 10px 3px rgba(99,102,241,0.35)",
              }}
            />

            {/* Main pill button */}
            <motion.button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              data-ocid="back_to_top.button"
              className="flex items-center justify-center px-6 py-2.5 rounded-full gradient-primary text-white"
              style={{
                boxShadow:
                  "0 0 28px 8px rgba(99,102,241,0.5), 0 4px 16px rgba(99,102,241,0.3)",
              }}
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>

            {/* Right glow beam */}
            <div
              className="h-[2px] w-14 rounded-full"
              style={{
                background: "linear-gradient(to left, transparent, rgba(139,92,246,0.8))",
                boxShadow: "0 0 10px 3px rgba(139,92,246,0.35)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const footerSections = [
    {
      titleKey: "footer.product",
      links: [
        { labelKey: "nav.home", to: "/" },
        { labelKey: "nav.pricing", to: "/pricing" },
        { labelKey: "nav.docs", to: "/docs" },
        { labelKey: "nav.contact", to: "/contact" },
      ],
    },
    {
      titleKey: "footer.company",
      links: [
        { labelKey: "nav.contact", to: "/contact" },
        { labelKey: "footer.privacy", to: "/privacy" },
        { labelKey: "footer.terms", to: "/terms" },
        { labelKey: "footer.refund", to: "/refund" },
      ],
    },
    {
      titleKey: "footer.legal",
      links: [
        { labelKey: "footer.privacy", to: "/privacy" },
        { labelKey: "footer.terms", to: "/terms" },
        { labelKey: "footer.refund", to: "/refund" },
      ],
    },
  ];

  return (
    <>
      <NewsletterStrip />
      <footer className="bg-card border-t border-border" data-ocid="footer">
        {/* Top accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="container mx-auto px-4 md:px-6 pt-14 pb-8">
          {/* 4-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand col */}
            <motion.div
              className="sm:col-span-2 lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-1 font-display font-bold text-xl text-foreground mb-3"
              >
                <span className="w-5 h-5 rounded-md gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-[9px]">B</span>
                </span>
                <span className="text-gradient">Babies</span>IQ
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed font-body mb-5">
                {t("footer.tagline")}
              </p>
              {/* Stats pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { val: "300K+", label: "Developers" },
                  { val: "99.9%", label: "Uptime" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50 text-[11px] font-mono"
                  >
                    <span className="text-primary font-semibold">
                      {stat.val}
                    </span>
                    <span className="text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map(({ href, label, icon: Icon, hoverClass }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    whileHover={{ scale: 1.18, y: -1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground transition-all duration-200 hover:bg-primary/10 ${hoverClass}`}
                    data-ocid={`footer.social.${label.toLowerCase().replace(/\s.*/, "")}.link`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Link cols */}
            {footerSections.map((section, sIdx) => (
              <motion.div
                key={section.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (sIdx + 1) * 0.08 }}
              >
                <h3 className="font-display font-semibold text-sm text-foreground mb-4">
                  {t(section.titleKey)}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.to + link.labelKey}>
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-0.5 inline-flex items-center gap-1 group"
                      >
                        <span className="w-0 group-hover:w-1.5 h-px bg-primary transition-all duration-200 rounded-full" />
                        {t(link.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Bottom bar */}
          <motion.div
            className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex items-center gap-1.5">
              <span>© {year} BabiesIQ. Made with ❤️ for developers.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/privacy"
                className="hover:text-foreground transition-colors"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                to="/terms"
                className="hover:text-foreground transition-colors"
              >
                {t("footer.terms")}
              </Link>
              <Link
                to="/refund"
                className="hover:text-foreground transition-colors"
              >
                {t("footer.refund")}
              </Link>
            </div>
          </motion.div>
        </div>
      </footer>
      <BackToTop />
    </>
  );
}
