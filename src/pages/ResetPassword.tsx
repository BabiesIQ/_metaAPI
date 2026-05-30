import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { AuthShell } from "@/components/AuthShell";
import { PasswordStrength } from "@/components/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { resetPassword } from "@/lib/api";
import type { MeResponse } from "@/types/index";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser } = useAuth();
  const search = useSearch({ strict: false }) as { token?: string };
  const token = search.token ?? "";

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  // If there is no token in the URL, show an error immediately.
  const missingToken = !token;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const passwordValue = watch("password", "");

  // Auto-redirect to dashboard after success
  useEffect(() => {
    if (done) {
      const id = setTimeout(() => {
        router.navigate({ to: "/panel/dashboard" });
      }, 1800);
      return () => clearTimeout(id);
    }
  }, [done, router]);

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await resetPassword(token, values.password);
      if (!res.success) {
        toast.error(res.error ?? t("auth.could_not_reset"));
        return;
      }
      // Backend auto-logs the user in — store the returned session data.
      if (res.data) {
        setUser(res.data as MeResponse);
      }
      setDone(true);
    } catch {
      toast.error(t("auth.network_error"));
    }
  };

  // ── Missing token state ───────────────────────────────────────────────────

  if (missingToken) {
    return (
      <AuthShell>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5">
            <Lock className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">
            Invalid Reset Link
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            This link is missing a reset token. Please request a new password
            reset link.
          </p>
          <Link to="/forgot-password" className="w-full">
            <Button
              type="button"
              className="w-full h-11 gradient-primary font-semibold text-sm text-white hover:opacity-90 transition-smooth border-0"
            >
              Request new link
            </Button>
          </Link>
        </motion.div>
      </AuthShell>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────

  if (done) {
    return (
      <AuthShell>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5"
          >
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </motion.div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">
            Password updated!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Your password has been reset successfully. Taking you to your
            dashboard…
          </p>
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      </AuthShell>
    );
  }

  // ── Form state ────────────────────────────────────────────────────────────

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary" />
          </div>
        </div>

        <div className="text-center mb-7">
          <h1 className="font-display font-bold text-2xl text-foreground mb-1.5">
            {t("auth.reset_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose a new password for your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-ocid="reset_password.form"
        >
          {/* New Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-foreground/80"
            >
              {t("auth.new_password")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                autoFocus
                className={`h-11 pl-10 pr-10 bg-background/60 border-border transition-colors ${
                  errors.password
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : ""
                }`}
                data-ocid="reset_password.password.input"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  showPwd ? t("auth.hide_password") : t("auth.show_password")
                }
              >
                {showPwd ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p
                className="text-xs text-destructive flex items-center gap-1"
                data-ocid="reset_password.password.field_error"
              >
                <span className="w-3 h-3 rounded-full bg-destructive/20 inline-flex items-center justify-center text-[9px] font-bold">
                  !
                </span>
                {errors.password.message}
              </p>
            ) : (
              <PasswordStrength password={passwordValue} />
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="confirm"
              className="text-sm font-medium text-foreground/80"
            >
              {t("auth.confirm_new_password")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`h-11 pl-10 pr-10 bg-background/60 border-border transition-colors ${
                  errors.confirm
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : ""
                }`}
                data-ocid="reset_password.confirm.input"
                {...register("confirm")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  showConfirm
                    ? t("auth.hide_password")
                    : t("auth.show_password")
                }
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirm && (
              <p
                className="text-xs text-destructive flex items-center gap-1"
                data-ocid="reset_password.confirm.field_error"
              >
                <span className="w-3 h-3 rounded-full bg-destructive/20 inline-flex items-center justify-center text-[9px] font-bold">
                  !
                </span>
                {errors.confirm.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 gradient-primary font-semibold text-sm text-white hover:opacity-90 transition-smooth border-0 mt-2"
            disabled={isSubmitting}
            data-ocid="reset_password.submit_button"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("auth.resetting")}
              </span>
            ) : (
              t("auth.reset_submit")
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="reset_password.back_to_login.link"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t("auth.back_to_login")}
          </Link>
        </div>
      </motion.div>
    </AuthShell>
  );
}
