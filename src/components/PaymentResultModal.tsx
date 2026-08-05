import { CheckCircle2, XCircle, Crown, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface PaymentResultModalProps {
  open: boolean;
  type: "success" | "failure";
  plan?: string;
  months?: number;
  amount?: number;
  onClose: () => void;
  onRetry?: () => void;
}

const PLAN_LABELS: Record<string, string> = {
  pro: "Pro",
  pro_plus: "Pro Plus",
  business: "Business",
};

export function PaymentResultModal({ open, type, plan, months, amount, onClose, onRetry }: PaymentResultModalProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={cn(
              "relative w-full max-w-sm rounded-2xl border bg-card shadow-2xl overflow-hidden",
              type === "success" ? "border-emerald-500/30" : "border-red-500/30"
            )}
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient bar */}
            <div className={cn("h-1 w-full", type === "success" ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-red-500 to-rose-500")} />

            {/* Glow bg */}
            <div className={cn(
              "absolute inset-0 pointer-events-none",
              type === "success" ? "bg-gradient-to-b from-emerald-500/5 to-transparent" : "bg-gradient-to-b from-red-500/5 to-transparent"
            )} />

            <div className="relative p-7 text-center">
              {/* Icon */}
              <motion.div
                className={cn(
                  "w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center",
                  type === "success" ? "bg-emerald-500/15" : "bg-red-500/15"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 20 }}
              >
                {type === "success"
                  ? <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                  : <XCircle className="w-9 h-9 text-red-400" />
                }
              </motion.div>

              {type === "success" ? (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-1">{t("payment_modal.success_title")}</h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    {t("payment_modal.success_desc")}
                  </p>
                  {plan && (
                    <div className="bg-muted/40 border border-border rounded-xl p-4 mb-5 text-left space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t("payment_modal.plan_label")}</span>
                        <span className="text-sm font-semibold flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          {PLAN_LABELS[plan] ?? plan}
                        </span>
                      </div>
                      {months && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{t("payment_modal.duration_label")}</span>
                          <span className="text-sm font-semibold">
                            {months} {months > 1 ? t("payment_modal.months") : t("payment_modal.month")}
                          </span>
                        </div>
                      )}
                      {amount !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{t("payment_modal.amount_paid")}</span>
                          <span className="text-sm font-semibold text-emerald-400">₹{amount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    {t("payment_modal.continue_dashboard")}
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-1">{t("payment_modal.failed_title")}</h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    {t("payment_modal.failed_desc")}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
                    >
                      {t("payment_modal.cancel")}
                    </button>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> {t("payment_modal.try_again")}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
