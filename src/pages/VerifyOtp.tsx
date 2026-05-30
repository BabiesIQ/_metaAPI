import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { Mail, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { resendOtp, verifyOtp } from "@/lib/api";

const OTP_LENGTH = 6;
const COOLDOWNS = [60, 180, 300, 600];

export function VerifyOtpPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { initialize } = useAuth();

  const search = useSearch({ strict: false }) as {
    email?: string;
    purpose?: string;
  };
  const email = search.email ?? "";
  const purpose = search.purpose ?? "signup";

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getOtp = () => digits.join("");

  const handleDigitChange = (index: number, value: string) => {
    // Allow only digits
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value) return;

    // Handle paste — fill multiple boxes
    if (cleaned.length > 1) {
      const newDigits = [...digits];
      for (let i = 0; i < cleaned.length && index + i < OTP_LENGTH; i++) {
        newDigits[index + i] = cleaned[i];
      }
      setDigits(newDigits);
      setHasError(false);
      const nextIdx = Math.min(index + cleaned.length, OTP_LENGTH - 1);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    setHasError(false);

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = getOtp();
    if (otp.length < OTP_LENGTH) {
      setHasError(true);
      toast.error(t("auth.invalid_code"));
      return;
    }
    if (!email) {
      toast.error(t("auth.missing_email_err"));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOtp(email, otp, purpose);
      if (!res.success) {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        setHasError(true);
        setDigits(Array(OTP_LENGTH).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
        if (remaining <= 0) {
          toast.error(t("auth.account_locked"));
        } else {
          toast.error(
            res.error ??
              `${t("auth.invalid_code")} ${remaining} ${
                remaining !== 1
                  ? t("auth.attempts_remaining")
                  : t("auth.attempt_remaining")
              }.`,
          );
        }
        return;
      }
      if (purpose === "signup") {
        await initialize();
        toast.success(t("auth.verified_welcome"));
        router.navigate({ to: "/panel/dashboard" });
      } else {
        router.navigate({
          to: "/reset-password",
          search: { email, otp },
        });
      }
    } catch {
      toast.error(t("auth.network_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0 || resendCount >= 4) return;
    try {
      const res = await resendOtp(email, purpose);
      if (!res.success) {
        toast.error(res.error ?? t("auth.could_not_resend"));
        return;
      }
      const nextCount = resendCount + 1;
      setResendCount(nextCount);
      setAttemptsLeft(5);
      setDigits(Array(OTP_LENGTH).fill(""));
      setHasError(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
      const cd = COOLDOWNS[resendCount] ?? 600;
      startCooldown(cd);
      toast.success(t("auth.resent_success"));
    } catch {
      toast.error(t("auth.network_error"));
    }
  };

  const isLocked = attemptsLeft <= 0;
  const isFilled = digits.every((d) => d !== "");

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 18,
              delay: 0.1,
            }}
            className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
          >
            <Mail className="w-7 h-7 text-primary" />
          </motion.div>
        </div>

        <div className="text-center mb-7">
          <h1 className="font-display font-bold text-2xl text-foreground mb-1.5">
            {t("auth.verify_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("auth.verify_subtitle")}{" "}
            <span className="font-semibold text-foreground break-all">
              {email || t("auth.verify_subtitle_default")}
            </span>
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isLocked ? (
            <motion.div
              key="locked"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl bg-destructive/10 border border-destructive/20 p-5 text-center"
              data-ocid="verify_otp.locked_state"
            >
              <p className="text-sm font-semibold text-destructive mb-1">
                {t("auth.locked_title")}
              </p>
              <p className="text-xs text-destructive/70 mb-4">
                {t("auth.locked_desc")}
              </p>
              <Link
                to="/login"
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {t("auth.back_to_login")}
              </Link>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-5"
              data-ocid="verify_otp.form"
            >
              {/* OTP digit boxes */}
              <div className="space-y-2">
                <fieldset className="flex gap-2 justify-center">
                  <legend className="sr-only">One-time password</legend>
                  {digits.map((digit, i) => {
                    const posName =
                      (
                        [
                          "zero",
                          "one",
                          "two",
                          "three",
                          "four",
                          "five",
                          "six",
                          "seven",
                        ] as const
                      )[i] ?? String(i);
                    return (
                      <input
                        key={`otp-pos-${posName}`}
                        ref={(el) => {
                          inputRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        aria-label={`Digit ${i + 1}`}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onFocus={(e) => e.target.select()}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pasted = e.clipboardData
                            .getData("text")
                            .replace(/\D/g, "");
                          handleDigitChange(i, pasted);
                        }}
                        className={[
                          "w-10 h-12 text-center text-lg font-mono font-bold rounded-lg border-2 bg-background/60 outline-none transition-all duration-150",
                          "focus:border-primary focus:ring-0 focus:bg-background",
                          hasError
                            ? "border-destructive bg-destructive/5 text-destructive animate-shake"
                            : digit
                              ? "border-primary/60 bg-primary/5 text-foreground"
                              : "border-border text-foreground",
                        ].join(" ")}
                        data-ocid={i === 0 ? "verify_otp.otp.input" : undefined}
                      />
                    );
                  })}
                </fieldset>

                <p className="text-xs text-muted-foreground text-center">
                  {hasError ? (
                    <span className="text-destructive">
                      {attemptsLeft}{" "}
                      {attemptsLeft !== 1
                        ? t("auth.attempts_remaining")
                        : t("auth.attempt_remaining")}
                    </span>
                  ) : attemptsLeft < 5 ? (
                    `${attemptsLeft} ${attemptsLeft !== 1 ? t("auth.attempts_remaining") : t("auth.attempt_remaining")}`
                  ) : (
                    t("auth.five_attempts")
                  )}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 gradient-primary font-semibold text-sm text-white hover:opacity-90 transition-smooth border-0"
                disabled={isSubmitting || !isFilled}
                data-ocid="verify_otp.submit_button"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("auth.verifying")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    {t("auth.verify_submit")}
                  </span>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Resend section */}
        {!isLocked && (
          <div className="mt-5 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {t("auth.resend_question")}
            </p>
            {resendCount >= 4 ? (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="verify_otp.resend_exhausted"
              >
                {t("auth.resend_exhausted")}
              </p>
            ) : cooldown > 0 ? (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="verify_otp.resend_countdown"
              >
                {t("auth.resend_in")}{" "}
                <span className="font-mono font-semibold text-foreground tabular-nums">
                  {cooldown}s
                </span>
              </p>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="h-auto py-1 text-sm text-primary hover:text-primary/80 transition-colors"
                onClick={handleResend}
                data-ocid="verify_otp.resend_button"
              >
                {t("auth.resend_button")}
              </Button>
            )}
          </div>
        )}

        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="verify_otp.back_to_login.link"
          >
            {t("auth.back_to_login")}
          </Link>
        </div>
      </motion.div>
    </AuthShell>
  );
}
