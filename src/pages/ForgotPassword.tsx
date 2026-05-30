import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await forgotPassword(values.email);
      if (!res.success) {
        toast.error(res.error ?? t("common.error"));
        return;
      }
      setSentTo(values.email);
    } catch {
      toast.error(t("auth.network_error"));
    }
  };

  return (
    <AuthShell>
      <AnimatePresence mode="wait">
        {sentTo ? (
          /* ── Success state ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
            data-ocid="forgot_password.success_state"
          >
            {/* Animated icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 18,
                delay: 0.1,
              }}
              className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5"
            >
              <Mail className="w-8 h-8 text-primary" />
            </motion.div>

            <h1 className="font-display font-bold text-2xl text-foreground mb-2">
              {t("auth.forgot_sent_title")}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-1.5">
              {t("auth.forgot_sent_desc")}{" "}
              <span className="font-semibold text-foreground break-all">
                {sentTo}
              </span>
            </p>
            <p className="text-xs text-muted-foreground/70 mb-6">
              {t("auth.forgot_sent_note")}
            </p>

            <Link
              to="/login"
              className="w-full"
              data-ocid="forgot_password.back_to_login.button"
            >
              <Button
                type="button"
                className="w-full h-11 gradient-primary font-semibold text-sm text-white hover:opacity-90 transition-smooth border-0"
              >
                {t("auth.back_to_login")}
              </Button>
            </Link>
          </motion.div>
        ) : (
          /* ── Form state ── */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Mail className="w-7 h-7 text-primary" />
              </div>
            </div>

            <div className="text-center mb-7">
              <h1 className="font-display font-bold text-2xl text-foreground mb-1.5">
                {t("auth.forgot_title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("auth.forgot_subtitle")}
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              data-ocid="forgot_password.form"
            >
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground/80"
                >
                  {t("auth.email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoFocus
                    autoComplete="email"
                    className={`h-11 pl-10 bg-background/60 border-border transition-colors ${
                      errors.email
                        ? "border-destructive focus-visible:ring-destructive/30"
                        : ""
                    }`}
                    data-ocid="forgot_password.email.input"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p
                    className="text-xs text-destructive flex items-center gap-1"
                    data-ocid="forgot_password.email.field_error"
                  >
                    <span className="w-3 h-3 rounded-full bg-destructive/20 inline-flex items-center justify-center text-[9px] font-bold">
                      !
                    </span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 gradient-primary font-semibold text-sm text-white hover:opacity-90 transition-smooth border-0"
                disabled={isSubmitting}
                data-ocid="forgot_password.submit_button"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("auth.sending")}
                  </span>
                ) : (
                  t("auth.forgot_send")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="forgot_password.back_to_login.link"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("auth.back_to_login")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
