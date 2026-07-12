import { useTranslation } from "react-i18next";

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.max(1, Math.min(4, Math.ceil(score * 0.8)));
}

const STRENGTH_CONFIG = [
  { label: "auth.pwd_weak", color: "bg-destructive" },
  { label: "auth.pwd_fair", color: "bg-amber-500" },
  { label: "auth.pwd_good", color: "bg-yellow-400" },
  { label: "auth.pwd_strong", color: "bg-emerald-500" },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation();
  const strength = getStrength(password);

  if (!password) return null;

  const config = STRENGTH_CONFIG[strength - 1] ?? STRENGTH_CONFIG[0];

  return (
    <div className="space-y-1.5" data-ocid="password_strength.indicator">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              level <= strength ? config.color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {t("auth.pwd_strength")}:{" "}
        <span
          className={`font-medium ${
            strength === 1
              ? "text-destructive"
              : strength === 2
                ? "text-amber-500"
                : strength === 3
                  ? "text-yellow-500"
                  : "text-emerald-500"
          }`}
        >
          {t(config.label)}
        </span>
      </p>
    </div>
  );
}
