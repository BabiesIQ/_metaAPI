import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { AuthShell } from "@/components/AuthShell";
import { GoogleIcon } from "@/components/GoogleIcon";
import { PasswordStrength } from "@/components/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { googleOAuth, signup } from "@/lib/api";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string(),
    terms: z.boolean().refine((v) => v === true, "You must agree to the terms"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { terms: false },
  });

  const passwordValue = watch("password", "");
  const termsValue = watch("terms");

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await signup(values.email, values.password);
      if (!res.success) {
        toast.error(res.error ?? t("auth.signup_failed"));
        return;
      }
      toast.success(t("auth.signup_success"));
      router.navigate({
        to: "/auth/verify-otp",
        search: { email: values.email, purpose: "signup" },
      });
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-foreground mb-1.5">
            {t("auth.signup_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("auth.signup_subtitle")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-ocid="signup.form"
        >
          {/* First + Last name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-foreground/80"
              >
                {t("auth.first_name")}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder={t("auth.first_name_placeholder")}
                  autoComplete="given-name"
                  className={`h-11 pl-10 bg-background/60 border-border transition-colors ${
                    errors.firstName
                      ? "border-destructive focus-visible:ring-destructive/30"
                      : ""
                  }`}
                  data-ocid="signup.first_name.input"
                  {...register("firstName")}
                />
              </div>
              {errors.firstName && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="signup.first_name.field_error"
                >
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-foreground/80"
              >
                {t("auth.last_name")}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder={t("auth.last_name_placeholder")}
                  autoComplete="family-name"
                  className={`h-11 pl-10 bg-background/60 border-border transition-colors ${
                    errors.lastName
                      ? "border-destructive focus-visible:ring-destructive/30"
                      : ""
                  }`}
                  data-ocid="signup.last_name.input"
                  {...register("lastName")}
                />
              </div>
              {errors.lastName && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="signup.last_name.field_error"
                >
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

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
                data-ocid="signup.email.input"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p
                className="text-xs text-destructive flex items-center gap-1"
                data-ocid="signup.email.field_error"
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
            <Label
              htmlFor="password"
              className="text-sm font-medium text-foreground/80"
            >
              {t("auth.password")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`h-11 pr-10 bg-background/60 border-border transition-colors ${
                  errors.password
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : ""
                }`}
                data-ocid="signup.password.input"
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
                data-ocid="signup.password.field_error"
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
              {t("auth.confirm_password")}
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
                data-ocid="signup.confirm.input"
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
                data-ocid="signup.confirm.field_error"
              >
                <span className="w-3 h-3 rounded-full bg-destructive/20 inline-flex items-center justify-center text-[9px] font-bold">
                  !
                </span>
                {errors.confirm.message}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="space-y-1.5">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="terms"
                checked={termsValue}
                onCheckedChange={(checked) =>
                  setValue("terms", checked === true, { shouldValidate: true })
                }
                className="mt-0.5"
                data-ocid="signup.terms.checkbox"
              />
              <Label
                htmlFor="terms"
                className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
              >
                {t("auth.terms_agree")}{" "}
                <a
                  href="/terms"
                  className="text-primary hover:underline transition-colors"
                >
                  {t("auth.terms_of_service")}
                </a>{" "}
                {t("auth.and")}{" "}
                <a
                  href="/privacy"
                  className="text-primary hover:underline transition-colors"
                >
                  {t("auth.privacy_policy")}
                </a>
              </Label>
            </div>
            {errors.terms && (
              <p
                className="text-xs text-destructive"
                data-ocid="signup.terms.field_error"
              >
                {t("auth.terms_required")}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 gradient-primary font-semibold text-sm text-white hover:opacity-90 transition-smooth border-0 mt-1"
            disabled={isSubmitting}
            data-ocid="signup.submit_button"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("auth.creating_account")}
              </span>
            ) : (
              t("auth.sign_up")
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
          data-ocid="signup.google.button"
        >
          <GoogleIcon className="w-4 h-4" />
          {t("auth.continue_google")}
        </Button>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("auth.have_account")}{" "}
          <Link
            to="/login"
            className="text-primary hover:text-primary/70 font-semibold transition-colors"
            data-ocid="signup.login.link"
          >
            {t("auth.sign_in")}
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
