// Admin Panel API client
import type { Admin, AdminStats, AdminUserRow, ContactMessage, PaginatedResponse } from "@/types/admin";
import { getBackendUrl } from "@/lib/config";
import { useAdminAuthStore } from "@/store/adminAuth";

function BASE_URL(): string {
  return getBackendUrl();
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

function handle401(): ApiResponse<never> {
  useAdminAuthStore.getState().setAdmin(null);
  if (!window.location.pathname.startsWith("/admin/login")) {
    window.location.href = "/admin/login";
  }
  return { success: false, data: null as never, error: "Unauthorized" };
}

async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  if (res.status === 401) return handle401();
  const text = await res.text().catch(() => "");
  let parsed: ApiResponse<T> | null = null;
  try { parsed = JSON.parse(text) as ApiResponse<T>; } catch { /* not JSON */ }
  if (parsed) return parsed;
  return { success: false, data: null as T, error: `HTTP ${res.status}` };
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${BASE_URL()}/admin${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...((options.headers as Record<string, string>) ?? {}),
    },
    ...options,
  });
  return parseResponse<T>(res);
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export function adminLogin(email: string, password: string) {
  return adminFetch<Admin>("/login", { method: "POST", body: JSON.stringify({ email, password }) });
}
export function adminLogout() {
  return adminFetch<null>("/logout", { method: "POST" });
}
export function getAdminMe() {
  return adminFetch<Admin>("/me");
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export function getAdminStats() {
  return adminFetch<AdminStats>("/stats");
}

// ── Users ─────────────────────────────────────────────────────────────────────
export function listAdminUsers(params: { search?: string; role?: string; status?: string; page?: number; limit?: number } = {}) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.role) q.set("role", params.role);
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  return adminFetch<PaginatedResponse<AdminUserRow> & { users: AdminUserRow[] }>(`/users?${q.toString()}`);
}
export function getAdminUser(id: number) {
  return adminFetch<AdminUserRow>(`/users/${id}`);
}
export function suspendUser(id: number, reason: string, durationHours: number) {
  return adminFetch<{ message: string }>(`/users/${id}/suspend`, { method: "POST", body: JSON.stringify({ reason, duration_hours: durationHours }) });
}
export function unsuspendUser(id: number) {
  return adminFetch<{ message: string }>(`/users/${id}/unsuspend`, { method: "POST" });
}
export function banUser(id: number, reason: string) {
  return adminFetch<{ message: string }>(`/users/${id}/ban`, { method: "POST", body: JSON.stringify({ reason }) });
}
export function unbanUser(id: number) {
  return adminFetch<{ message: string }>(`/users/${id}/unban`, { method: "POST" });
}
export function restrictUser(id: number, reason: string) {
  return adminFetch<{ message: string }>(`/users/${id}/restrict`, { method: "POST", body: JSON.stringify({ reason }) });
}
export function unrestrictUser(id: number) {
  return adminFetch<{ message: string }>(`/users/${id}/unrestrict`, { method: "POST" });
}
export function resetUserPassword(id: number, password: string) {
  return adminFetch<{ message: string }>(`/users/${id}/reset-password`, { method: "POST", body: JSON.stringify({ password }) });
}
export function changeUserRole(id: number, role: string, subscriptionMonths: number) {
  return adminFetch<{ message: string }>(`/users/${id}/change-role`, { method: "POST", body: JSON.stringify({ role, subscription_months: subscriptionMonths }) });
}
export function sendUserNotification(id: number, title: string, message: string, level: string, sendEmail: boolean) {
  return adminFetch<{ message: string }>(`/users/${id}/notify`, { method: "POST", body: JSON.stringify({ title, message, level, send_email: sendEmail }) });
}

// ── Support ───────────────────────────────────────────────────────────────────
export function listSupportTickets(params: { status?: string; page?: number; limit?: number } = {}) {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  return adminFetch<PaginatedResponse<ContactMessage> & { tickets: ContactMessage[] }>(`/support?${q.toString()}`);
}
export function getSupportTicket(id: number) {
  return adminFetch<ContactMessage>(`/support/${id}`);
}
export function replyToTicket(id: number, message: string, sendEmail: boolean) {
  return adminFetch<{ message: string }>(`/support/${id}/reply`, { method: "POST", body: JSON.stringify({ message, send_email: sendEmail }) });
}
export function updateTicketStatus(id: number, status: string) {
  return adminFetch<{ message: string }>(`/support/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

// ── Manage Admins ─────────────────────────────────────────────────────────────
export function listAdmins() {
  return adminFetch<Admin[]>("/admins");
}
export function addAdmin(data: { email: string; name: string; password: string; permissions: string[] }) {
  return adminFetch<Admin>("/admins", { method: "POST", body: JSON.stringify(data) });
}
export function removeAdmin(id: number) {
  return adminFetch<{ message: string }>(`/admins/${id}`, { method: "DELETE" });
}
export function updateAdminPermissions(id: number, permissions: string[]) {
  return adminFetch<{ message: string; permissions: string[] }>(`/admins/${id}/permissions`, { method: "PUT", body: JSON.stringify({ permissions }) });
}
export function updateAdminStatus(id: number, status: string) {
  return adminFetch<{ message: string }>(`/admins/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}
