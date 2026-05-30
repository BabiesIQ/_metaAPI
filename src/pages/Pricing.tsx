import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, Minus, Shield, Star, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type BillingCycle = "monthly" | "yearly";
type Duration = 1 | 3 | 6 | 12;

const PLANS = [
  {
    code: "free",
    name: "Free",
    monthlyPrice: 0,
    daily: "500 req/day",
    description: "Perfect for hobby projects and exploring the API",
    badge: null,
    highlight: false,
    features: [
      "500 requests per day",
      "1 active API key",
      "Search, song & video endpoints",
      "30+ equalizer presets",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/signup" as const,
    business: false,
  },
  {
    code: "pro",
    name: "Pro",
    monthlyPrice: 49,
    daily: "2,500 req/day",
    description: "For developers building real projects",
    badge: "Most Popular",
    highlight: true,
    features: [
      "2,500 requests per day",
      "1 active API key",
      "All endpoints + EQ presets",
      "Seek & download support",
      "Email support",
    ],
    cta: "Buy Now",
    href: null,
    business: false,
  },
  {
    code: "pro_plus",
    name: "Pro Plus",
    monthlyPrice: 99,
    daily: "5,000 req/day",
    description: "For high-traffic apps and power users",
    badge: null,
    highlight: false,
    features: [
      "5,000 requests per day",
      "1 active API key",
      "All endpoints + EQ presets",
      "Seek & download support",
      "Priority support",
    ],
    cta: "Buy Now",
    href: null,
    business: false,
  },
  {
    code: "business",
    name: "Business",
    monthlyPrice: null,
    daily: "Unlimited",
    description: "Custom limits for enterprise-scale usage",
    badge: null,
    highlight: false,
    features: [
      "Unlimited requests per day",
      "Multiple API keys",
      "All endpoints + EQ presets",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact Us",
    href: "/contact" as const,
    business: true,
  },
];

const DURATIONS: Duration[] = [1, 3, 6, 12];

const COMPARISON_ROWS = [
  {
    feature: "Daily API requests",
    free: "500",
    pro: "2,500",
    proPlus: "5,000",
    biz: "Unlimited",
  },
  {
    feature: "Active API keys",
    free: "1",
    pro: "1",
    proPlus: "1",
    biz: "Multiple",
  },
  {
    feature: "Search endpoint",
    free: true,
    pro: true,
    proPlus: true,
    biz: true,
  },
  {
    feature: "Song / Video endpoint",
    free: true,
    pro: true,
    proPlus: true,
    biz: true,
  },
  {
    feature: "Stream with seek",
    free: true,
    pro: true,
    proPlus: true,
    biz: true,
  },
  {
    feature: "Equalizer presets (30+)",
    free: true,
    pro: true,
    proPlus: true,
    biz: true,
  },
  {
    feature: "Force download header",
    free: true,
    pro: true,
    proPlus: true,
    biz: true,
  },
  {
    feature: "Email support",
    free: false,
    pro: true,
    proPlus: true,
    biz: true,
  },
  {
    feature: "Priority support",
    free: false,
    pro: false,
    proPlus: true,
    biz: true,
  },
  {
    feature: "Dedicated support",
    free: false,
    pro: false,
    proPlus: false,
    biz: true,
  },
  {
    feature: "Custom limits",
    free: false,
    pro: false,
    proPlus: false,
    biz: true,
  },
];

const TRUST_ITEMS = [
  "🛡️ 30-day satisfaction guarantee",
  "⚡ Instant activation after payment",
  "🔄 Cancel anytime, no lock-in",
  "🔑 API key generated immediately",
  "📊 Real-time usage dashboard",
  "💳 Secure payments via Razorpay",
  "🌍 Worldwide API coverage",
  "🎵 30+ equalizer presets included",
];

const FAQS = [
  {
    q: "Can I upgrade or downgrade my plan anytime?",
    a: "Yes, you can upgrade or downgrade at any time from your billing panel. When upgrading, you get immediate access to the higher limits. When downgrading, the change takes effect at the start of your next billing cycle.",
  },
  {
    q: "What happens when I hit my daily request limit?",
    a: "Once you reach your daily limit, all API requests return a 429 Too Many Requests response until the limit resets at midnight UTC. You can upgrade to a higher plan anytime for instant access to more requests.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "We offer a generous Free plan (500 requests/day) that you can use indefinitely. For paid plans, we have a 30-day money-back guarantee — if you're not satisfied, contact us for a full refund, no questions asked.",
  },
  {
    q: "How does the 30-day refund policy work?",
    a: "If you're not happy with BabiesIQ within 30 days of your first purchase, email us at support@babiesiq.com and we'll process a full refund immediately. We believe in earning your trust, not locking you in.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay — India's leading payment gateway. All transactions are secured and encrypted.",
  },
];

function formatRupees(v: number): string {
  return `₹${v}`;
}
function CellValue({ v }: { v: boolean | string }) {
  if (typeof v === "boolean") {
    return v ? (
      <Check className="w-4 h-4 text-primary mx-auto" />
    ) : (
      <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />
    );
  }
  return <span className="text-foreground font-mono text-xs">{v}</span>;
}

function useRipple() {
  const ref = useRef<HTMLButtonElement>(null);
  function trigger(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const circle = document.createElement("span");
    const size = Math.max(rect.width, rect.height) * 2;
    circle.className = "ripple-circle";
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${e.clientX - rect.left - size / 2}px`;
    circle.style.top = `${e.clientY - rect.top - size / 2}px`;
    el.appendChild(circle);
    circle.addEventListener("animationend", () => circle.remove());
  }
  return { ref, trigger };
}

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="border border-border rounded-xl overflow-hidden"
      data-ocid={`pricing.faq.item.${index + 1}`}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 bg-card hover:bg-muted/40 transition-colors duration-200 text-left"
        aria-expanded={open}
      >
        <span className="font-display font-semibold text-sm text-foreground">
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 bg-background border-t border-border">
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                {a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [durations, setDurations] = useState<Record<string, Duration>>({
    pro: 1,
    pro_plus: 1,
  });

  function setDuration(planCode: string, d: Duration) {
    setDurations((prev) => ({ ...prev, [planCode]: d }));
  }
  function buildHref(planCode: string): string {
    const months = durations[planCode] ?? 1;
    return `/panel/billing?plan=${planCode}&months=${months}`;
  }

  return (
    <Layout>
      {/* Hero */}
      <section
        className="relative bg-background pt-20 pb-8 overflow-hidden"
        data-ocid="pricing.page"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-80 bg-primary/7 rounded-full blur-[100px] pointer-events-none" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.55 0.01 260 / 0.6) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.01 260 / 0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="container mx-auto px-4 relative">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-mono px-3 py-1.5 rounded-full mb-5">
              <Zap className="w-3 h-3" />
              Simple, transparent pricing
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-5 leading-[1.08] tracking-tight">
              Plans for every <span className="text-gradient">developer</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-body max-w-xl mx-auto leading-relaxed">
              Start free, upgrade when you need more. All plans include all
              endpoints and 30+ equalizer presets.
            </p>
            {/* Billing toggle — segmented pill control */}
            <motion.div
              className="flex flex-col items-center gap-3 mt-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              data-ocid="pricing.billing_toggle"
            >
              <div className="relative inline-flex items-center p-1 rounded-full bg-muted/60 border border-border shadow-inner">
                {/* Sliding active pill */}
                <motion.span
                  layoutId="billing-pill"
                  className="absolute inset-y-1 rounded-full gradient-primary shadow-md shadow-primary/30 pointer-events-none"
                  style={{
                    left: billing === "monthly" ? "4px" : "calc(50%)",
                    width: "calc(50% - 4px)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  data-ocid="pricing.billing_toggle.monthly"
                  className={`relative z-10 px-6 py-2 rounded-full text-sm font-display font-semibold transition-colors duration-200 min-w-[110px] ${
                    billing === "monthly"
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("yearly")}
                  data-ocid="pricing.billing_toggle.yearly"
                  className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2 rounded-full text-sm font-display font-semibold transition-colors duration-200 min-w-[110px] ${
                    billing === "yearly"
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Yearly
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-all duration-200 ${
                      billing === "yearly"
                        ? "bg-white/20 text-white"
                        : "bg-emerald-500/15 text-emerald-500"
                    }`}
                  >
                    −30%
                  </span>
                </button>
              </div>
              <AnimatePresence>
                {billing === "yearly" && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-emerald-500 font-body font-medium"
                  >
                    🎉 You save 30% with yearly billing
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="bg-background pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {PLANS.map((plan, i) => (
              <PlanCard
                key={plan.code}
                plan={plan}
                index={i}
                billing={billing}
                duration={durations[plan.code] ?? 1}
                onDurationChange={(d) => setDuration(plan.code, d)}
                buildHref={buildHref}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-background py-5 overflow-hidden border-y border-border/50">
        <div className="flex items-center gap-1">
          <div className="marquee-track">
            {[
              ...TRUST_ITEMS.map((t, i) => ({ text: t, id: `a${i}` })),
              ...TRUST_ITEMS.map((t, i) => ({ text: t, id: `b${i}` })),
            ].map((item) => (
              <span
                key={item.id}
                className="flex-shrink-0 px-8 text-xs text-muted-foreground font-body whitespace-nowrap select-none"
              >
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section
        className="bg-muted/30 border-t border-border py-16"
        data-ocid="pricing.comparison.section"
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display font-bold text-xl text-foreground mb-2">
              Full Feature Comparison
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              All plans include the core API — upgrade for higher limits and
              support.
            </p>
          </motion.div>
          <div className="max-w-4xl mx-auto overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs font-body min-w-[480px]">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="text-left px-5 py-3 font-display font-semibold text-foreground text-[11px] uppercase tracking-wider">
                    Feature
                  </th>
                  {["Free", "Pro", "Pro Plus", "Business"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-center font-display font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap"
                    >
                      <span
                        className={
                          h === "Pro" ? "text-primary" : "text-foreground"
                        }
                      >
                        {h}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(
                  ({ feature, free, pro, proPlus, biz }, i) => (
                    <motion.tr
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.35, delay: i * 0.04 }}
                      className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-card"}`}
                      data-ocid={`pricing.comparison.row.${i + 1}`}
                    >
                      <td className="px-5 py-3 text-foreground font-body">
                        {feature}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <CellValue v={free} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <CellValue v={pro} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <CellValue v={proPlus} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <CellValue v={biz} />
                      </td>
                    </motion.tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
          <p className="text-center mt-8 text-xs text-muted-foreground font-body">
            All prices in INR. Yearly billing saves 30%.{" "}
            <Link
              to="/contact"
              className="text-primary hover:underline underline-offset-4"
              data-ocid="pricing.comparison.contact_link"
            >
              Questions? Contact us.
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="bg-background py-16 border-t border-border"
        data-ocid="pricing.faq.section"
      >
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-mono text-primary uppercase tracking-[0.18em] mb-2">
              FAQ
            </p>
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Frequently asked questions
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              Everything you need to know about BabiesIQ pricing.
            </p>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-muted-foreground font-body">
            Still have questions?{" "}
            <Link
              to="/contact"
              className="text-primary hover:underline underline-offset-4"
              data-ocid="pricing.faq.contact_link"
            >
              Contact our team →
            </Link>
          </p>
        </div>
      </section>

      {/* Guarantee section */}
      <motion.section
        className="relative bg-card py-20 border-t border-border overflow-hidden"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-2xl border border-primary/20 bg-background/60 backdrop-blur-sm shadow-xl shadow-primary/5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-display font-bold text-xl text-foreground mb-2">
                30-Day Satisfaction Guarantee
              </h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Not happy with BabiesIQ? Contact us within 30 days of your
                purchase for a full refund — no questions asked. We stand behind
                the quality of our service.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground font-body">
                {[
                  "Instant activation",
                  "Cancel anytime",
                  "No hidden fees",
                  "Secure checkout",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/signup" className="shrink-0">
              <Button className="gradient-primary text-white font-display font-semibold shadow-md shadow-primary/20 hover:opacity-90">
                Start Free Today
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}

function PlanCard({
  plan,
  index,
  billing,
  duration,
  onDurationChange,
  buildHref,
}: {
  plan: (typeof PLANS)[number];
  index: number;
  billing: BillingCycle;
  duration: Duration;
  onDurationChange: (d: Duration) => void;
  buildHref: (code: string) => string;
}) {
  const ripple = useRipple();
  const { t } = useTranslation();

  // Yearly price calculations
  const monthlyEquiv = plan.monthlyPrice
    ? Math.round(plan.monthlyPrice * 0.7 * 100) / 100
    : null;
  const yearlyTotal = plan.monthlyPrice
    ? Math.round(plan.monthlyPrice * 12 * 0.7 * 100) / 100
    : null;

  // For monthly, duration selector controls months; for yearly, always 12mo
  const effectiveDuration = billing === "yearly" ? 12 : duration;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      className="relative flex"
      data-ocid={`pricing.plan.item.${index + 1}`}
    >
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <Badge className="gradient-primary text-white text-[10px] font-display font-semibold px-3 py-0.5 gap-1 shadow-lg shadow-primary/30 badge-pulse">
            <Star className="w-2.5 h-2.5 fill-current" />
            {plan.badge}
          </Badge>
        </div>
      )}
      <div
        className={`relative flex flex-col w-full rounded-xl border p-5 transition-all duration-300 ${
          plan.highlight
            ? "border-primary bg-card shadow-elevated shadow-primary/10 ring-1 ring-primary/20 hover:shadow-[0_0_32px_-4px_oklch(0.72_0.24_254_/_0.35),0_12px_28px_-8px_rgba(0,0,0,0.3)]"
            : "border-border bg-card hover:border-primary/30 hover:shadow-[0_0_32px_-4px_oklch(0.72_0.24_254_/_0.15),0_12px_28px_-8px_rgba(0,0,0,0.25)]"
        }`}
      >
        <div className="mb-4">
          <h3
            className={`font-display font-bold text-base mb-1 ${
              plan.highlight ? "text-primary" : "text-foreground"
            }`}
          >
            {plan.name}
          </h3>
          {plan.business ? (
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display font-extrabold text-3xl text-foreground">
                Custom
              </span>
            </div>
          ) : plan.monthlyPrice === 0 ? (
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display font-extrabold text-3xl text-foreground">
                ₹0
              </span>
              <span className="text-xs text-muted-foreground">
                {t("pricing.per_month")}
              </span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {billing === "monthly" ? (
                <motion.div
                  key="monthly-price"
                  className="mb-1"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-3xl text-foreground leading-none">
                      {formatRupees(plan.monthlyPrice!)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("pricing.per_month")}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="yearly-price"
                  className="mb-1"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Discounted per-month price */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-extrabold text-3xl text-foreground leading-none">
                      {formatRupees(monthlyEquiv!)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("pricing.per_month")}
                    </span>
                    {/* Strikethrough original */}
                    <span className="text-sm text-muted-foreground/60 line-through font-body ml-0.5">
                      {formatRupees(plan.monthlyPrice!)}
                    </span>
                  </div>
                  {/* Total yearly payment */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[11px] font-body font-medium text-emerald-500">
                      Billed {formatRupees(yearlyTotal!)}/year
                    </span>
                    <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      SAVE 30%
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <Badge
            variant="outline"
            className="text-[10px] border-border text-muted-foreground mt-1"
          >
            {plan.daily}
          </Badge>
          <p className="text-xs text-muted-foreground font-body leading-relaxed mt-2">
            {plan.description}
          </p>
        </div>
        <div className="border-t border-border mb-4" />
        <ul className="space-y-2.5 flex-1 mb-5">
          {plan.features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 text-xs text-foreground font-body"
            >
              <Check
                className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                  plan.highlight ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        {/* Duration selector: show for monthly only; yearly is always 12mo */}
        {!plan.business && plan.monthlyPrice !== 0 && (
          <div className="mb-4">
            <AnimatePresence mode="wait">
              {billing === "monthly" ? (
                <motion.div
                  key="duration-selector"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2">
                    Duration
                  </p>
                  <div
                    className="grid grid-cols-4 gap-1"
                    data-ocid={`pricing.${plan.code}.duration_selector`}
                  >
                    {DURATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => onDurationChange(d)}
                        data-ocid={`pricing.${plan.code}.duration.${d}mo`}
                        className={`py-1 text-[11px] font-mono rounded border transition-smooth ${
                          duration === d
                            ? "bg-primary/15 border-primary/50 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        {d}mo
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="yearly-locked"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2">
                    Duration
                  </p>
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5"
                    data-ocid={`pricing.${plan.code}.duration_selector`}
                  >
                    <span className="text-[11px] font-mono text-emerald-500 font-semibold">
                      12 months
                    </span>
                    <span className="text-[10px] text-emerald-500/70 font-body">
                      · 30% off applied
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {plan.href ? (
          <Link to={plan.href}>
            <Button
              type="button"
              variant={plan.highlight ? "default" : "outline"}
              size="sm"
              className={`w-full font-display font-semibold text-xs transition-smooth btn-ripple hover:scale-[1.03] ${
                plan.business
                  ? "border-accent/40 text-accent hover:bg-accent/10 hover:border-accent/60"
                  : plan.highlight
                    ? "gradient-primary text-white hover:opacity-90 shadow-md shadow-primary/20"
                    : "border-border hover:border-primary/50 hover:text-primary"
              }`}
              data-ocid={`pricing.plan.cta.${index + 1}`}
            >
              {plan.cta}
            </Button>
          </Link>
        ) : (
          <a href={buildHref(plan.code)}>
            <Button
              ref={ripple.ref}
              type="button"
              variant={plan.highlight ? "default" : "outline"}
              size="sm"
              onClick={ripple.trigger}
              className={`w-full font-display font-semibold text-xs btn-ripple hover:scale-[1.03] transition-smooth ${
                plan.highlight
                  ? "gradient-primary text-white hover:opacity-90 shadow-md shadow-primary/20"
                  : "border-border hover:border-primary/50 hover:text-primary"
              }`}
              data-ocid={`pricing.plan.cta.${index + 1}`}
            >
              {plan.cta}
              {billing === "yearly" && plan.monthlyPrice ? (
                <span className="ml-1 opacity-70">({effectiveDuration}mo)</span>
              ) : null}
            </Button>
          </a>
        )}
      </div>
    </motion.div>
  );
}
