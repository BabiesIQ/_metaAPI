// API client for BabiesIQ Go backend
// Public auth endpoints send credentials: 'include' so the browser stores
// the session cookie from Set-Cookie response headers (cross-origin).
// All other public endpoints omit credentials.

import type {
  ApiKey,
  Invoice,
  MeResponse,
  Notification,
  UsageDay,
} from "@/types/index";

import { getBackendUrl } from "@/lib/config";
import { useAuthStore } from "@/store/auth";

/** Always reads the runtime-configured backend URL — no hardcoded strings. */
export function BASE_URL(): string {
  return getBackendUrl();
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

/**
 * Handle a 401 Unauthorized response globally.
 * Clears auth state and redirects to /login — unless we're already there.
 */
function handle401(): ApiResponse<never> {
  useAuthStore.getState().setUser(null);
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
  return { success: false, data: null as never, error: "Unauthorized" };
}

/** Parse a Response into an ApiResponse, handling non-OK status codes. */
async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let parsed: ApiResponse<T> | null = null;
    try {
      parsed = JSON.parse(text) as ApiResponse<T>;
    } catch {
      // not JSON
    }
    if (parsed) return parsed;
    return { success: false, data: null as T, error: `HTTP ${res.status}` };
  }
  const json = (await res.json()) as ApiResponse<T>;
  return json;
}

/**
 * Auth fetch — sends credentials: 'include' so the browser sends AND receives
 * cookies for cross-origin requests. Required for login/signup/verify-otp
 * because the server responds with Set-Cookie which the browser only stores
 * when credentials are included.
 */
async function authApiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL()}${path}`;
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

/**
 * Public fetch — NO credentials sent.
 * Use for read-only public routes where session cookies are not needed.
 */
async function publicApiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL()}${path}`;
  const res = await fetch(url, {
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...((options.headers as Record<string, string>) ?? {}),
    },
    ...options,
  });
  return parseResponse<T>(res);
}

/**
 * Protected fetch — sends credentials: 'include' (session cookie).
 * Use for all panel/authenticated endpoints. Auto-redirects to /login on 401.
 */
async function protectedApiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL()}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...((options.headers as Record<string, string>) ?? {}),
    },
    ...options,
  });

  if (res.status === 401) {
    return handle401() as ApiResponse<T>;
  }

  return parseResponse<T>(res);
}

/**
 * Protected form/multipart fetch — sends credentials: 'include'.
 * Use for file uploads (avatar, etc.).
 */
async function protectedFormClient<T>(
  path: string,
  body: FormData | URLSearchParams,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL()}${path}`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
    body,
  });

  if (res.status === 401) {
    return handle401() as ApiResponse<T>;
  }

  return parseResponse<T>(res);
}

// ── Auth — uses authApiClient (credentials: 'include') so cookies are stored ──

export function login(email: string, password: string) {
  return authApiClient<MeResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signup(email: string, password: string) {
  return authApiClient<null>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function verifyOtp(email: string, otp: string, purpose: string) {
  return authApiClient<MeResponse>("/api/v1/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp, purpose }),
  });
}

export function resendOtp(email: string, purpose: string) {
  return authApiClient<null>("/api/v1/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email, purpose }),
  });
}

export function forgotPassword(email: string) {
  return publicApiClient<null>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset password using the one-time token from the magic link.
 * The token is embedded in the URL: /reset-password?token=<token>
 * On success the backend also logs the user in (returns MeResponse).
 */
export function resetPassword(token: string, password: string) {
  return authApiClient<MeResponse>("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export function createPassword(password: string) {
  return protectedApiClient<null>("/api/v1/auth/create-password", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

/**
 * Initiates Google OAuth by redirecting the browser to the backend's
 * /api/v1/auth/google endpoint, which then redirects to Google.
 * After approval, Google sends the user back to the backend callback,
 * which sets a session cookie and redirects to /panel/dashboard.
 */
export function googleOAuth() {
  window.location.href = `${BASE_URL()}/api/v1/auth/google`;
}

// ── Auth — PROTECTED (requires session cookie) ────────────────────────────────

export function logout() {
  return protectedApiClient<null>("/api/v1/auth/logout", { method: "POST" });
}

export function changePassword(current: string, newPwd: string) {
  return protectedApiClient<null>("/api/v1/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password: current, new_password: newPwd }),
  });
}

// ── User — PROTECTED ──────────────────────────────────────────────────────────

export function getMe() {
  return protectedApiClient<MeResponse>("/api/v1/me");
}

export function updateProfile(formData: FormData) {
  return protectedFormClient<MeResponse>("/api/v1/profile", formData);
}

// ── API Keys — PROTECTED ──────────────────────────────────────────────────────

export function getApiKeys() {
  return protectedApiClient<ApiKey[]>("/api/v1/api-keys");
}

export function generateApiKey(applicationName: string) {
  return protectedApiClient<ApiKey>("/api/v1/api-keys/generate", {
    method: "POST",
    body: JSON.stringify({ application_name: applicationName }),
  });
}

export function revokeApiKey(keyId: number, applicationName: string) {
  return protectedApiClient<null>("/api/v1/api-keys/revoke", {
    method: "POST",
    body: JSON.stringify({ key_id: keyId, application_name: applicationName }),
  });
}

// ── Usage — PROTECTED ─────────────────────────────────────────────────────────

export function getUsage(days = 7) {
  return protectedApiClient<UsageDay[]>(`/api/v1/usage?days=${days}`);
}

export function getUsageStats() {
  return protectedApiClient<{
    today: number;
    remaining: number;
    lifetime: number;
    limit: number;
  }>("/api/v1/usage/stats");
}

// ── Billing — PROTECTED ───────────────────────────────────────────────────────

export function getBillingCurrent() {
  return protectedApiClient<{
    plan: string;
    subscription_end: string | null;
  }>("/api/v1/billing/current");
}

export function goToBillingCheckout(plan: string, months: number) {
  window.location.href = `${BASE_URL()}/panel/billing-callback.php?plan=${encodeURIComponent(plan)}&months=${months}`;
}

// ── Plans — PUBLIC ────────────────────────────────────────────────────────────

export function getPlans() {
  return publicApiClient<
    { id: number; name: string; price: number; limit: number }[]
  >("/api/v1/plans");
}

// ── Invoices — PROTECTED ──────────────────────────────────────────────────────

export function getInvoices() {
  return protectedApiClient<Invoice[]>("/api/v1/invoices");
}

export function getInvoicePdfUrl(id: number) {
  return `${BASE_URL()}/api/v1/invoices/${id}/pdf`;
}

// ── Notifications — PROTECTED ─────────────────────────────────────────────────

export function getNotifications() {
  return protectedApiClient<Notification[]>("/api/v1/notifications");
}

export function markNotificationsRead(ids: string[] | "all") {
  return protectedApiClient<null>("/api/v1/notifications/mark-read", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function deleteNotifications(ids: string[]) {
  return protectedApiClient<null>("/api/v1/notifications/delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// ── Telegram — PUBLIC + PROTECTED ─────────────────────────────────────────────

export function checkTelegramToken(token: string) {
  return publicApiClient<{ status: string; telegram_id?: number }>(
    `/api/telegram/check?token=${encodeURIComponent(token)}`,
  );
}

export function linkTelegramAuth(token: string) {
  return protectedApiClient<{
    status: string;
    telegram_id?: number;
    user_id?: number;
    bot_url?: string;
  }>("/api/v1/telegram/link", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function getTelegramStatus() {
  return protectedApiClient<{
    connected: boolean;
    telegram_id?: number;
    bot_url?: string;
  }>("/api/v1/telegram/status");
}

export function telegramDisconnect() {
  return protectedApiClient<{ status: string; message?: string }>(
    "/api/v1/telegram/disconnect",
    { method: "POST" },
  );
}

// ── Contact — PUBLIC ──────────────────────────────────────────────────────────

export function submitContact(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return publicApiClient<null>("/api/v1/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
