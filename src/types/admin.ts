// Admin Panel TypeScript types

export type AdminStatus = "active" | "suspended";
export type TicketStatus = "open" | "replied" | "closed";
export type UserRole = "free" | "pro" | "pro_plus" | "business";
export type UserStatus = "active" | "banned" | "restricted" | "pending";

export const PERMISSION_LABELS: Record<string, string> = {
  view_users: "View Users",
  suspend_users: "Suspend Users",
  ban_users: "Ban/Unban Users",
  reset_passwords: "Reset Passwords",
  change_roles: "Change Roles",
  view_support: "View Support Tickets",
  reply_support: "Reply to Support",
  manage_admins: "Manage Admins",
};

export const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS);

export interface Admin {
  id: number;
  email: string;
  name: string;
  is_owner: boolean;
  status: AdminStatus;
  created_by?: number;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  banned_users: number;
  suspended_users: number;
  pro_users: number;
  open_tickets: number;
  total_admins: number;
  today_signups: number;
}

export interface AdminUserRow {
  id: number;
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  created_at: string;
  subscription_expires_at: string | null;
  daily_usage: number;
  total_usage: number;
}

export interface SupportReply {
  id: number;
  ticket_id: number;
  admin_id: number;
  admin_name: string;
  message: string;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
  status: TicketStatus;
  created_at: string;
  replies?: SupportReply[];
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  pages: number;
  users?: T[];
  tickets?: T[];
}

export const ROLE_LABELS: Record<UserRole, string> = {
  free: "Free",
  pro: "Pro",
  pro_plus: "Pro Plus",
  business: "Business",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  free: "text-muted-foreground border-border bg-muted/40",
  pro: "text-primary border-primary/30 bg-primary/10",
  pro_plus: "text-accent border-accent/30 bg-accent/10",
  business: "text-amber-400 border-amber-500/30 bg-amber-500/10",
};

export const STATUS_COLORS: Record<UserStatus, string> = {
  active: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  banned: "text-red-400 border-red-500/30 bg-red-500/10",
  restricted: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  pending: "text-blue-400 border-blue-500/30 bg-blue-500/10",
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  open: "text-red-400 border-red-500/30 bg-red-500/10",
  replied: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  closed: "text-muted-foreground border-border bg-muted/40",
};
