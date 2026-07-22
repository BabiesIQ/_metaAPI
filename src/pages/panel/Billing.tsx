import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PaymentResultModal } from "@/components/PaymentResultModal";
import { InvoiceExportModal } from "@/components/InvoiceExportModal";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { getMe, getInvoices } from "@/lib/api";
import { createOrder, verifyPayment, getSubscriptions, type SubscriptionEntry } from "@/lib/payment-api";
import type { Invoice } from "@/types/index";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Check, Crown, Mail, Sparkles, Star, Zap, Shield, Clock,
  ArrowRight, Loader2, FileText, Download, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Duration = 1 | 3 | 6 | 12;
type BillingCycle = "monthly" | "yearly";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string; amount: number; currency: string; name: string;
  description: string; order_id: string; theme?: { color?: string };
  prefill?: { email?: string; name?: string };
  handler?: (res: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance { open(): void; }

const PLAN_DATA = [
  {
    code: "pro", name: "Pro", monthlyPrice: 49, dailyLimit: "2,500",
    highlight: false, popular: false, badge: null as string | null, icon: Zap,
    features: ["All Free features","2,500 API calls / day","Audio & Video streaming","All 30+ equalizer presets","Priority email support"],
  },
  {
    code: "pro_plus", name: "Pro Plus", monthlyPrice: 99, dailyLimit: "5,000",
    highlight: true, popular: true, badge: "Most Popular", icon: Sparkles,
    features: ["All Pro features","5,000 API calls / day","Download support","Maximum throughput","Advanced analytics","Dedicated support"],
  },
  {
    code: "business", name: "Business", monthlyPrice: 299, dailyLimit: "Unlimited",
    highlight: false, popular: false, badge: null, icon: Building2,
    features: ["All Pro Plus features","Unlimited API calls","Custom rate limits","SLA guarantee","Enterprise support","Custom integration"],
  },
];

const DURATIONS: { value: Duration; label: string; best?: boolean }[] = [
  { value: 1, label: "1 Month" }, { value: 3, label: "3 Months" },
  { value: 6, label: "6 Months", best: true }, { value: 12, label: "1 Year" },
];

const PLAN_LABEL: Record<string, string> = {
  free: "Free", pro: "Pro", pro_plus: "Pro Plus", business: "Business",
};

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700", pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

export default function BillingPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [billing, setBillingCycle] = useState<BillingCycle>("monthly");
  const [duration, setDuration] = useState<Duration>(1);
  const [paying, setPaying] = useState<string | null>(null);
  const [resultModal, setResultModal] = useState<{
    open: boolean; type: "success" | "failure"; plan?: string; months?: number; amount?: number;
  }>({ open: false, type: "success" });
  const [lastPlan, setLastPlan] = useState<string | null>(null);
  const [invoiceModal, setInvoiceModal] = useState<Invoice | null>(null);
  const [showAllInvoices, setShowAllInvoices] = useState(false);

  const { data: meData } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const currentPlan = meData?.data?.plan?.code ?? "free";
  const userEmail = meData?.data?.user?.email ?? "";
  const userName = [meData?.data?.user?.first_name, meData?.data?.user?.last_name].filter(Boolean).join(" ");

  const { data: subsData } = useQuery({ queryKey: ["subscriptions"], queryFn: getSubscriptions });
  const subscriptions: SubscriptionEntry[] = subsData?.data?.subscriptions ?? [];
  const futureSubs = subscriptions.filter(s => new Date(s.end_at) > new Date()).slice(0, 5);

  const { data: invoicesData } = useQuery({ queryKey: ["invoices"], queryFn: getInvoices });
  const invoices: Invoice[] = invoicesData?.data ?? [];
  const visibleInvoices = showAllInvoices ? invoices : invoices.slice(0, 3);

  const effectiveDuration = billing === "yearly" ? 12 : duration;
  const getDisplayPrice = (m: number) => billing === "yearly" ? Math.round(m * 0.7 * 100) / 100 : m;
  const getTotalPrice = (m: number) => Math.round(getDisplayPrice(m) * effectiveDuration * 100) / 100;

  const handleBuy = useCallback(async (planCode: string) => {
    if (planCode === "business") {
      window.location.href = "mailto:support@babiesiq.tech?subject=Business Plan Inquiry";
      return;
    }
    setPaying(planCode);
    setLastPlan(planCode);

    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error("Could not load payment gateway."); setPaying(null); return; }

    const res = await createOrder(planCode, effectiveDuration);
    if (!res.success || !res.data) { toast.error(res.error ?? "Could not create order"); setPaying(null); return; }

    const { order_id, amount, currency, key_id, plan_name, months, payment_link_url } = res.data;

    // Partner proxy flow — open Razorpay's hosted payment page (no domain mismatch)
    if (payment_link_url) {
      setPaying(null);
      window.open(payment_link_url, "_blank", "noopener,noreferrer");
      toast.info("Payment page opened in a new tab. Come back once payment is complete.");
      return;
    }

    // Main site fast flow — embedded one-click checkout
    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error("Could not load payment gateway."); setPaying(null); return; }

    const rzp = new window.Razorpay({
      key: key_id, amount: Math.round(amount * 100), currency,
      name: "BabiesIQ",
      description: `${plan_name} — ${months} month${months > 1 ? "s" : ""}`,
      order_id,
      theme: { color: "#7c3aed" },
      prefill: { email: userEmail, name: userName },
      handler: async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
        const vRes = await verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
        setPaying(null);
        if (vRes.success) {
          qc.invalidateQueries({ queryKey: ["me"] });
          qc.invalidateQueries({ queryKey: ["subscriptions"] });
          qc.invalidateQueries({ queryKey: ["invoices"] });
          setResultModal({ open: true, type: "success", plan: planCode, months, amount });
        } else {
          setResultModal({ open: true, type: "failure" });
        }
      },
      modal: { ondismiss: () => { setPaying(null); toast.info("Payment cancelled"); } },
    });
    rzp.open();
  }, [effectiveDuration, userEmail, userName, qc]);

  const closeResult = () => {
    setResultModal(r => ({ ...r, open: false }));
    if (resultModal.type === "success") qc.invalidateQueries({ queryKey: ["me"] });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageTransition>
          <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">Subscription</p>
              <h1 className="text-3xl font-bold text-foreground font-display mb-2">Upgrade Your Plan</h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">Scale your audio & video streaming API. Instant activation, cancel anytime.</p>
            </motion.div>

            {/* Current plan banner */}
            {currentPlan !== "free" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Current Plan: <span className="text-primary">{PLAN_LABEL[currentPlan] ?? currentPlan}</span></p>
                  {futureSubs.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Active until {new Date(futureSubs[futureSubs.length - 1].end_at).toLocaleDateString()}
                      {futureSubs.length > 1 && ` · ${futureSubs.length} subscriptions queued`}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">Active</Badge>
              </motion.div>
            )}

            {/* Queued subscriptions */}
            {futureSubs.length > 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">Subscription Queue</p>
                    <p className="text-xs text-muted-foreground mt-0.5">New purchases will extend your access beyond your current expiry.</p>
                    <div className="mt-2 space-y-1">
                      {futureSubs.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span className="text-muted-foreground capitalize">{PLAN_LABEL[s.plan] ?? s.plan}</span>
                          <span className="text-muted-foreground/60">→</span>
                          <span className="text-muted-foreground">{new Date(s.start_at).toLocaleDateString()} – {new Date(s.end_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Billing cycle toggle */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="flex items-center justify-center gap-1 p-1 bg-muted/40 border border-border rounded-xl w-fit mx-auto">
              {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
                <button key={c} onClick={() => setBillingCycle(c)}
                  className={cn("px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                    billing === c ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground")}>
                  {c}
                  {c === "yearly" && <span className="ml-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">SAVE 30%</span>}
                </button>
              ))}
            </motion.div>

            {/* Duration picker */}
            <AnimatePresence>
              {billing === "monthly" && (
                <motion.div key="duration" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center gap-2 flex-wrap">
                  {DURATIONS.map(d => (
                    <button key={d.value} onClick={() => setDuration(d.value)}
                      className={cn("relative px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                        duration === d.value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/30 text-muted-foreground border-border hover:border-primary/40")}>
                      {d.label}
                      {d.best && <span className="absolute -top-2 -right-2 text-[9px] bg-amber-400 text-black px-1.5 rounded-full font-bold leading-5">BEST</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Plan cards */}
            <div className="grid sm:grid-cols-3 gap-5">
              {PLAN_DATA.map((plan, i) => {
                const displayPrice = getDisplayPrice(plan.monthlyPrice);
                const totalPrice = getTotalPrice(plan.monthlyPrice);
                const isCurrentPlan = currentPlan === plan.code;
                const isPayingThis = paying === plan.code;
                const PlanIcon = plan.icon;
                return (
                  <motion.div key={plan.code} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }} whileHover={{ y: -4 }} className="relative flex flex-col">
                    {plan.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-purple-500/30">
                          <Star className="w-2.5 h-2.5 fill-current" />{plan.badge}
                        </span>
                      </div>
                    )}
                    <div className={cn("relative flex flex-col flex-1 rounded-2xl border p-5 transition-all duration-300",
                      plan.highlight ? "border-primary/50 bg-card shadow-[0_0_32px_-4px_oklch(0.72_0.24_254_/_0.25)] ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/30 hover:shadow-md")}>
                      {plan.highlight && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent rounded-t-2xl" />}
                      <div className="mb-4">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", plan.highlight ? "bg-gradient-to-br from-violet-500 to-purple-700" : "bg-muted")}>
                            <PlanIcon className={cn("w-4 h-4", plan.highlight ? "text-white" : "text-muted-foreground")} />
                          </div>
                          <h3 className={cn("font-bold text-base font-display", plan.highlight ? "text-primary" : "text-foreground")}>{plan.name}</h3>
                          {isCurrentPlan && <Badge variant="outline" className="ml-auto text-[10px] text-muted-foreground">Current</Badge>}
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.div key={`${billing}-${effectiveDuration}`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15 }}>
                            <div className="flex items-baseline gap-1.5 mb-1">
                              <span className="text-4xl font-extrabold text-foreground font-display">₹{displayPrice}</span>
                              <span className="text-xs text-muted-foreground">/mo</span>
                              {billing === "yearly" && <span className="text-sm text-muted-foreground/60 line-through ml-1">₹{plan.monthlyPrice}</span>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {billing === "yearly" ? `₹${(displayPrice * 12).toFixed(0)} billed annually` : effectiveDuration > 1 ? `₹${totalPrice} total for ${effectiveDuration} months` : ""}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                        <p className="text-xs text-muted-foreground mt-1.5">{plan.dailyLimit} API calls/day</p>
                      </div>
                      <div className="border-t border-border mb-4" />
                      <ul className="space-y-2.5 flex-1 mb-5">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-start gap-2 text-xs text-foreground">
                            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", plan.highlight ? "bg-primary/20" : "bg-emerald-500/15")}>
                              <Check className={cn("w-2.5 h-2.5", plan.highlight ? "text-primary" : "text-emerald-500")} />
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>
                      {isCurrentPlan ? (
                        <div className="w-full py-2.5 rounded-xl border border-border text-center text-sm text-muted-foreground">Current Plan</div>
                      ) : plan.code === "business" ? (
                        <button onClick={() => handleBuy(plan.code)}
                          className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2">
                          <Mail className="w-3.5 h-3.5" /> Contact Us
                        </button>
                      ) : (
                        <button onClick={() => handleBuy(plan.code)} disabled={isPayingThis || !!paying}
                          className={cn("w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                            plan.highlight ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/25 disabled:opacity-60"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60")}>
                          {isPayingThis
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                            : <><Zap className="w-3.5 h-3.5" /> Upgrade to {plan.name} <ArrowRight className="w-3.5 h-3.5" /></>}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-6 text-xs text-muted-foreground flex-wrap">
              {[{ icon: Shield, text: "Secure Razorpay Checkout" }, { icon: Check, text: "30-Day Money Back" }, { icon: Clock, text: "Instant Activation" }].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-muted-foreground/60" />{text}</span>
              ))}
            </motion.div>

            {/* ── Payment History ─────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground font-display">Payment History</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total</p>
                </div>
              </div>

              {invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-card border border-border rounded-2xl text-center">
                  <FileText className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No payments yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Your invoices will appear here after your first purchase.</p>
                </div>
              ) : (
                <>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-border bg-muted/20">
                      {["Invoice #", "Plan", "Duration", "Amount", "Actions"].map((h) => (
                        <div key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</div>
                      ))}
                    </div>

                    {/* Rows */}
                    {visibleInvoices.map((inv, i) => (
                      <motion.div key={inv.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="grid grid-cols-5 gap-4 items-center px-5 py-4 border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                        {/* Invoice # */}
                        <div>
                          <p className="text-sm font-medium text-foreground">{inv.invoice_no}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(inv.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                          </p>
                        </div>
                        {/* Plan */}
                        <div>
                          <span className="text-sm font-medium capitalize">{PLAN_LABEL[inv.plan] ?? inv.plan}</span>
                        </div>
                        {/* Duration */}
                        <div>
                          <span className="text-sm text-muted-foreground">{inv.months} month{inv.months > 1 ? "s" : ""}</span>
                        </div>
                        {/* Amount */}
                        <div>
                          <p className="text-sm font-semibold text-foreground">₹{Number(inv.amount).toFixed(2)}</p>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize", STATUS_COLORS[inv.status] ?? "bg-gray-100 text-gray-600")}>
                            {inv.status}
                          </span>
                        </div>
                        {/* Actions */}
                        <div>
                          <button
                            onClick={() => setInvoiceModal(inv)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted hover:border-primary/30 hover:text-primary transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Receipt
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Show more / less */}
                  {invoices.length > 3 && (
                    <button
                      onClick={() => setShowAllInvoices(v => !v)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
                    >
                      {showAllInvoices ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show all {invoices.length} invoices</>}
                    </button>
                  )}
                </>
              )}
            </motion.div>

          </div>
        </PageTransition>
      </DashboardLayout>

      {/* Payment result popup */}
      <PaymentResultModal
        open={resultModal.open} type={resultModal.type}
        plan={resultModal.plan} months={resultModal.months} amount={resultModal.amount}
        onClose={closeResult}
        onRetry={resultModal.type === "failure" && lastPlan ? () => {
          setResultModal(r => ({ ...r, open: false }));
          setTimeout(() => handleBuy(lastPlan!), 300);
        } : undefined}
      />

      {/* Invoice PDF export */}
      <InvoiceExportModal
        open={!!invoiceModal} invoice={invoiceModal}
        userEmail={userEmail} userName={userName}
        onClose={() => setInvoiceModal(null)}
      />
    </ProtectedRoute>
  );
}

export { BillingPage };

