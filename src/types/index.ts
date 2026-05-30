// PHP BabyAPI types

export type UserRole = "free" | "pro" | "pro_plus" | "business" | "admin";
export type UserStatus = "active" | "banned" | "restricted";
export type PlanCode = "free" | "pro" | "pro_plus" | "business";
export type UsageStatus = "safe" | "restricted" | "banned";
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
