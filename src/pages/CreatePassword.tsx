import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { AuthShell } from "@/components/AuthShell";
import { PasswordStrength } from "@/components/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPassword } from "@/lib/api";

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

export function CreatePasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const passwordValue = watch("password", "");

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await createPassword(values.password);
      if (!res.success) {
        toast.error(res.error ?? t("auth.could_not_set_pwd"));
        return;
      }
      router.navigate({ to: "/auth/password-success" });
    } catch {
      toast.error(t("auth.network_error"));
    }
  };

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
            <KeyRound className="w-7 h-7 text-primary" />
          </div>
        </div>

        <div className="text-center mb-7">
          <h1 className="font-display font-bold text-2xl text-foreground mb-1.5">
            {t("auth.create_pwd_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("auth.create_pwd_subtitle")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-ocid="create_password.form"
        >
          {/* Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-foreground/80"
            >
              {t("auth.create_pwd_new")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                autoFocus
                className={`h-11 pr-10 bg-background/60 border-border transition-colors ${
                  errors.password
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : ""
                }`}
                data-ocid="create_password.password.input"
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
                className="text-xs text-destructive"
                data-ocid="create_password.password.field_error"
              >
                {errors.password.message}
              </p>
            ) : (
              <PasswordStrength password={passwordValue} />
            )}
          </div>

          {/* Confirm */}
          <div className="space-y-1.5">
            <Label
              htmlFor="confirm"
              className="text-sm font-medium text-foreground/80"
            >
              {t("auth.create_pwd_confirm")}
            </Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`h-11 pr-10 bg-background/60 border-border transition-colors ${
                  errors.confirm
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : ""
                }`}
                data-ocid="create_password.confirm.input"
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
                className="text-xs text-destructive"
                data-ocid="create_password.confirm.field_error"
              >
                {errors.confirm.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 gradient-primary font-semibold text-sm text-white hover:opacity-90 transition-smooth border-0 mt-2"
            disabled={isSubmitting}
            data-ocid="create_password.submit_button"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("auth.setting_password")}
              </span>
            ) : (
              t("auth.create_pwd_submit")
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/panel/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="create_password.skip.link"
          >
            {t("auth.create_pwd_skip")}
          </Link>
        </div>
      </motion.div>
    </AuthShell>
  );
}
