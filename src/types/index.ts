// BabiesIQ API types

export type UserRole = "free" | "pro" | "pro_plus" | "business" | "admin";
export type UserStatus = "active" | "banned" | "restricted";
export type PlanCode = "free" | "pro" | "pro_plus" | "business";
export type UsageStatus = "safe" | "warning" | "exceeded" | "restricted" | "banned";
export type NotificationLevel = "info" | "success" | "warning";
export type InvoiceStatus = "pending" | "paid" | "failed";
export type ApiKeyStatus = "active" | "revoked";

export interface UserProfile {
  id: number;
  uuid: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  first_name?: string;
  last_name?: string;
  country?: string;
}

export interface Plan {
  code: PlanCode;
  name: string;
  price: number;
  daily_limit: number;
}

export interface UsageToday {
  today: number;
  remaining: number;
  lifetime: number;
}

export interface MeResponse {
  user: UserProfile;
  plan: Plan;
  usage: UsageToday;
}

export interface ApiKey {
  id: number;
  api_key: string;
  prefix: string;
  status: ApiKeyStatus;
  created_at: string;
  application_name?: string;
  /** ISO 8601 timestamp — null/undefined means no expiry */
  expires_at?: string | null;
}

export interface UsageDay {
  date: string;
  count: number;
  status: UsageStatus;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  plan: string;
  months: number;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  created_at: string;
}

export interface Notification {
  id: number;
  type: string;
  level: NotificationLevel;
  title: string;
  message: string;
  created_at: string;
  read_at?: string | null;
}

// Plan display helpers
export const PLAN_LABELS: Record<PlanCode, string> = {
  free: "Free",
  pro: "Pro",
  pro_plus: "Pro Plus",
  business: "Business",
};

export const PLAN_COLORS: Record<PlanCode, string> = {
  free: "text-muted-foreground",
  pro: "text-primary",
  pro_plus: "text-accent",
  business: "text-yellow-400",
};

// ── Reset-time helpers (IST = UTC+5:30, no DST) ───────────────────────────────

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Returns a Date representing the next IST midnight (in UTC). */
export function nextISTMidnight(): Date {
  const nowUtcMs = Date.now();
  const nowISTms = nowUtcMs + IST_OFFSET_MS;

  // Truncate to IST day start, then advance one day
  const dayStartISTms = Math.floor(nowISTms / 86_400_000) * 86_400_000;
  const nextMidnightISTms = dayStartISTms + 86_400_000;

  // Convert back to UTC
  return new Date(nextMidnightISTms - IST_OFFSET_MS);
}

/** Returns a human-readable countdown string e.g. "3h 42m" or "< 1m". */
export function countdownToReset(): string {
  const diffMs = nextISTMidnight().getTime() - Date.now();
  if (diffMs <= 0) return "< 1m";
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

/** Returns "12:00 AM IST" — always the same, shown for context. */
export const IST_RESET_TIME_LABEL = "12:00 AM IST";
