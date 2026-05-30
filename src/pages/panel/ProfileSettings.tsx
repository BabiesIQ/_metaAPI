import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { changePassword, updateProfile } from "@/lib/api";
import { PLAN_COLORS, PLAN_LABELS } from "@/types/index";
import type { PlanCode } from "@/types/index";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Eye, EyeOff, Lock, Save, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

// ── Schemas ────────────────────────────────────────────────────────────────────

import { PageTransition } from "@/components/PageTransition";
import i18n from "@/lib/i18n";

const profileSchema = z.object({
  first_name: z.string().min(1, i18n.t("profile.first_name_required")),
  last_name: z.string().optional(),
  country: z.enum(["IN", "US", "UK", "OTHER"]),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(6, i18n.t("profile.min_6_chars")),
    new_password: z.string().min(6, i18n.t("profile.min_6_chars")),
    confirm_password: z.string().min(6, i18n.t("profile.min_6_chars")),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: i18n.t("profile.passwords_no_match"),
    path: ["confirm_password"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

// ── Country map ────────────────────────────────────────────────────────────────

function countryCodeFromLabel(
  label: string | undefined,
): "IN" | "US" | "UK" | "OTHER" {
  const map: Record<string, "IN" | "US" | "UK" | "OTHER"> = {
    India: "IN",
    "United States": "US",
    "United Kingdom": "UK",
  };
  return map[label ?? ""] ?? "OTHER";
}

// ── Password field with eye toggle ─────────────────────────────────────────────

function PasswordInput({
  id,
  placeholder,
  error,
  errorOcid,
  inputOcid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  errorOcid?: string;
  inputOcid?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder ?? "••••••••"}
        className="bg-background border-border h-10 pr-10"
        data-ocid={inputOcid}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      {error && (
        <p className="text-xs text-destructive mt-1" data-ocid={errorOcid}>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
      role="img"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ProfileSettingsPage() {
  const { t } = useTranslation();
  const { user, isLoading, initialize } = useAuth();

  const COUNTRIES = useMemo<{ value: string; label: string }[]>(
    () => [
      { value: "IN", label: t("profile.country_india") },
      { value: "US", label: t("profile.country_us") },
      { value: "UK", label: t("profile.country_uk") },
      { value: "CA", label: t("profile.country_canada") },
      { value: "AU", label: t("profile.country_australia") },
      { value: "OTHER", label: t("profile.country_other") },
    ],
    [t],
  );
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const planCode = (user?.plan?.code ?? "free") as PlanCode;
  const displayName =
    [user?.user?.first_name, user?.user?.last_name].filter(Boolean).join(" ") ||
    user?.user?.email ||
    "User";

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // ── Profile form ──────────────────────────────────────────────────────────

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: "", last_name: "", country: "IN" },
  });

  useEffect(() => {
    if (user?.user) {
      resetProfile({
        first_name: user.user.first_name ?? "",
        last_name: user.user.last_name ?? "",
        country: countryCodeFromLabel(user.user.country),
      });
    }
  }, [user, resetProfile]);

  const profileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const fd = new FormData();
      fd.append("first_name", values.first_name);
      fd.append("last_name", values.last_name ?? "");
      fd.append("country", values.country);
      if (avatarFile) fd.append("avatar", avatarFile);
      return updateProfile(fd);
    },
    onSuccess: async (res) => {
      if (!res.success) {
        toast.error(res.error ?? t("common.error"));
        return;
      }
      await initialize();
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(`${t("profile.save_changes")}!`);
      setAvatarFile(null);
    },
    onError: () => toast.error(t("auth.network_error")),
  });

  // ── Password form ─────────────────────────────────────────────────────────

  const [showPwdSection, setShowPwdSection] = useState(false);

  const {
    register: regPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const passwordMutation = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      changePassword(values.current_password, values.new_password),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error ?? t("common.error"));
        return;
      }
      toast.success(`${t("profile.update_password")} ✓`);
      setShowPwdSection(false);
      resetPwd();
    },
    onError: () => toast.error(t("auth.network_error")),
  });

  // ── Avatar handler ────────────────────────────────────────────────────────

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("profile.avatar_too_large"));
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("profile.avatar_invalid_type"));
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const avatarSrc = avatarPreview ?? user?.user?.avatar ?? null;
  const canSave = isProfileDirty || !!avatarFile;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageTransition>
          <div
            className="space-y-6 max-w-2xl"
            data-ocid="profile_settings.page"
          >
            {/* Page header */}
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {t("profile.title")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("profile.subtitle")}
              </p>
            </div>

            {/* Card 1 — Personal Info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="bg-card border-border shadow-sm overflow-hidden">
                <div className="h-0.5 gradient-primary w-full" />
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    {t("profile.profile_section")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Avatar section — prominent at 128px */}
                  <div className="flex flex-col items-center mb-6 pb-6 border-b border-border/50">
                    <div className="relative mb-3">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-border ring-4 ring-primary/10">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full gradient-primary flex items-center justify-center">
                            {isLoading ? (
                              <User className="w-12 h-12 text-white/70" />
                            ) : (
                              <span className="text-white font-display font-bold text-4xl">
                                {initials || <User className="w-12 h-12" />}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Camera overlay */}
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute bottom-1 right-1 w-9 h-9 rounded-full gradient-primary text-white flex items-center justify-center hover:opacity-90 transition-smooth shadow-elevated border-2 border-card"
                        aria-label={t("profile.change_avatar")}
                        data-ocid="profile_settings.avatar.upload_button"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                        aria-label={t("profile.upload_avatar")}
                      />
                    </div>

                    {isLoading ? (
                      <div className="space-y-2 text-center">
                        <div className="h-5 w-32 rounded bg-muted/50 animate-pulse mx-auto" />
                        <div className="h-4 w-44 rounded bg-muted/50 animate-pulse mx-auto" />
                        <div className="h-5 w-20 rounded-full bg-muted/50 animate-pulse mx-auto" />
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="font-semibold text-foreground">
                          {displayName}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {user?.user?.email}
                        </p>
                        <div className="mt-2 flex justify-center">
                          <Badge
                            variant="outline"
                            className={`text-xs border-border ${PLAN_COLORS[planCode]}`}
                          >
                            {PLAN_LABELS[planCode]} Plan
                          </Badge>
                        </div>
                      </div>
                    )}

                    {avatarFile && (
                      <p className="text-xs text-primary mt-2">
                        {t("profile.new_avatar")}
                      </p>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 border-border hover:border-primary/40 gap-1.5 text-xs transition-smooth"
                      onClick={() => fileRef.current?.click()}
                      data-ocid="profile_settings.avatar.upload_button"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {t("profile.change_avatar")}
                    </Button>
                  </div>

                  {/* Form fields */}
                  <form
                    onSubmit={handleProfileSubmit((v) =>
                      profileMutation.mutate(v),
                    )}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* First name */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="first_name"
                          className="text-sm text-muted-foreground"
                        >
                          {t("profile.first_name")}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="first_name"
                          {...regProfile("first_name")}
                          className="bg-background border-border h-10"
                          placeholder={t("profile.first_name")}
                          data-ocid="profile_settings.first_name.input"
                        />
                        {profileErrors.first_name && (
                          <p
                            className="text-xs text-destructive"
                            data-ocid="profile_settings.first_name.field_error"
                          >
                            {profileErrors.first_name.message}
                          </p>
                        )}
                      </div>

                      {/* Last name */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="last_name"
                          className="text-sm text-muted-foreground"
                        >
                          {t("profile.last_name")}
                        </Label>
                        <Input
                          id="last_name"
                          {...regProfile("last_name")}
                          className="bg-background border-border h-10"
                          placeholder={t("profile.last_name")}
                          data-ocid="profile_settings.last_name.input"
                        />
                      </div>

                      {/* Email (readonly) — spans full row */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label
                          htmlFor="email"
                          className="text-sm text-muted-foreground flex items-center gap-1.5"
                        >
                          {t("profile.email")}
                          <Lock className="w-3 h-3 text-muted-foreground/60" />
                        </Label>
                        <Input
                          id="email"
                          value={user?.user?.email ?? ""}
                          readOnly
                          className="bg-muted/30 border-border h-10 text-muted-foreground cursor-not-allowed select-none"
                          data-ocid="profile_settings.email.input"
                        />
                      </div>

                      {/* Country */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label
                          htmlFor="country"
                          className="text-sm text-muted-foreground"
                        >
                          {t("profile.country")}
                        </Label>
                        <select
                          id="country"
                          {...regProfile("country")}
                          className="w-full h-10 rounded-md border border-border bg-background text-foreground text-sm px-3 focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-150"
                          data-ocid="profile_settings.country.select"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button
                        type="submit"
                        className="gradient-primary text-white border-0 gap-2 hover:opacity-90 transition-smooth min-w-[140px]"
                        disabled={!canSave || profileMutation.isPending}
                        data-ocid="profile_settings.save.button"
                      >
                        {profileMutation.isPending ? (
                          <>
                            <Spinner />
                            {t("profile.saving")}
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {t("profile.save_changes")}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2 — Security */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    {t("profile.security")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t("profile.security_desc")}
                  </p>

                  {!showPwdSection ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border hover:border-primary/40 gap-2 transition-smooth"
                      onClick={() => setShowPwdSection(true)}
                      data-ocid="profile_settings.change_password.button"
                    >
                      <Lock className="w-4 h-4" />
                      {t("profile.change_password")}
                    </Button>
                  ) : (
                    <>
                      <Separator className="bg-border" />
                      <form
                        id="pwd-form"
                        onSubmit={handlePwdSubmit((v) =>
                          passwordMutation.mutate(v),
                        )}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="current_password"
                            className="text-sm text-muted-foreground"
                          >
                            {t("profile.current_password")}
                          </Label>
                          <PasswordInput
                            id="current_password"
                            {...regPwd("current_password")}
                            inputOcid="profile_settings.current_password.input"
                            error={pwdErrors.current_password?.message}
                            errorOcid="profile_settings.current_password.field_error"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="new_password"
                              className="text-sm text-muted-foreground"
                            >
                              {t("profile.new_password")}
                            </Label>
                            <PasswordInput
                              id="new_password"
                              {...regPwd("new_password")}
                              inputOcid="profile_settings.new_password.input"
                              error={pwdErrors.new_password?.message}
                              errorOcid="profile_settings.new_password.field_error"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label
                              htmlFor="confirm_password"
                              className="text-sm text-muted-foreground"
                            >
                              {t("profile.confirm_password")}
                            </Label>
                            <PasswordInput
                              id="confirm_password"
                              {...regPwd("confirm_password")}
                              inputOcid="profile_settings.confirm_password.input"
                              error={pwdErrors.confirm_password?.message}
                              errorOcid="profile_settings.confirm_password.field_error"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setShowPwdSection(false);
                              resetPwd();
                            }}
                            data-ocid="profile_settings.cancel_button"
                          >
                            {t("profile.cancel")}
                          </Button>
                          <Button
                            type="submit"
                            form="pwd-form"
                            className="gradient-primary text-white border-0 hover:opacity-90 transition-smooth min-w-[150px] gap-2"
                            disabled={passwordMutation.isPending}
                            data-ocid="profile_settings.save_password.button"
                          >
                            {passwordMutation.isPending ? (
                              <>
                                <Spinner />
                                {t("profile.updating")}
                              </>
                            ) : (
                              t("profile.update_password")
                            )}
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </PageTransition>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
