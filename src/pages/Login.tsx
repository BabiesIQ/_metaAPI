import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { AuthShell } from "@/components/AuthShell";
import { GoogleIcon } from "@/components/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { googleOAuth, login } from "@/lib/api";
import { getBackendUrl } from "@/lib/config";
import type { MeResponse } from "@/types/index";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuth();
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (isAuthenticated) {
    router.navigate({ to: "/panel/dashboard" });
    return null;
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await login(values.email, values.password);
      if (!res.success) {
        toast.error(res.error ?? t("auth.login_failed"), {
          description: res.error ? undefined : t("auth.check_credentials"),
        });
        return;
      }
      setUser(res.data as MeResponse);
      router.navigate({ to: "/panel/dashboard" });
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : String(err);
      const msg = raw.toLowerCase();
      const detail = `Technical detail: "${raw}"`;
      if (msg.includes("cors") || msg.includes("cross-origin")) {
        toast.error(t("auth.error_cors"), {
          description: `${detail} — Please contact support.`,
          duration: 8000,
        });
      } else if (msg.includes("ssl") || msg.includes("certificate")) {
        toast.error(t("auth.error_ssl"), {
          description: `${detail}`,
          duration: 8000,
        });
      } else if (msg.includes("timeout") || msg.includes("timed out")) {
        toast.error(t("auth.error_timeout"), {
          description: `${detail}`,
          duration: 8000,
        });
      } else if (
        msg.includes("failed to fetch") ||
        msg.includes("load failed")
      ) {
        toast.error(t("auth.error_network"), {
          description: `${detail} — Backend: ${getBackendUrl()}`,
          duration: 10000,
        });
      } else if (
        msg.includes("networkerror") ||
        msg.includes("network error") ||
        err instanceof TypeError
      ) {
        toast.error(t("auth.error_network"), {
          description: `${detail}`,
          duration: 8000,
        });
      } else {
        toast.error(t("auth.error_unexpected"), {
          description: detail,
          duration: 8000,
        });
      }
    }
  };

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="mb-7">
          <h1 className="font-display font-bold text-2xl text-foreground mb-1.5">
            {t("auth.login_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("auth.login_subtitle")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-ocid="login.form"
        >
          {/* Email */}
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
                placeholder={t("auth.email_placeholder")}
                autoComplete="email"
                className={`h-11 pl-10 bg-background/60 border-border transition-colors ${
                  errors.email
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : ""
                }`}
                data-ocid="login.email.input"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p
                className="text-xs text-destructive flex items-center gap-1"
                data-ocid="login.email.field_error"
              >
                <span className="w-3 h-3 rounded-full bg-destructive/20 inline-flex items-center justify-center text-[9px] font-bold">
                  !
                </span>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground/80"
              >
                {t("auth.password")}
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:text-primary/70 transition-colors font-medium"
                data-ocid="login.forgot_password.link"
              >
                {t("auth.forgot_password")}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`h-11 pl-10 pr-10 bg-background/60 border-border transition-colors ${
                  errors.password
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : ""
                }`}
                data-ocid="login.password.input"
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
            {errors.password && (
              <p
                className="text-xs text-destructive flex items-center gap-1"
                data-ocid="login.password.field_error"
              >
                <span className="w-3 h-3 rounded-full bg-destructive/20 inline-flex items-center justify-center text-[9px] font-bold">
                  !
                </span>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 gradient-primary font-semibold text-sm text-white hover:opacity-90 transition-smooth border-0 mt-1"
            disabled={isSubmitting}
            data-ocid="login.submit_button"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("auth.signing_in")}
              </span>
            ) : (
              t("auth.sign_in")
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">
            {t("auth.or_continue")}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 border-border bg-background/40 hover:bg-muted/60 gap-2.5 transition-smooth font-medium text-sm"
          onClick={googleOAuth}
          data-ocid="login.google.button"
        >
          <GoogleIcon className="w-4 h-4" />
          {t("auth.continue_google")}
        </Button>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("auth.no_account")}{" "}
          <Link
            to="/signup"
            className="text-primary hover:text-primary/70 font-semibold transition-colors"
            data-ocid="login.signup.link"
          >
            {t("auth.sign_up")}
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
