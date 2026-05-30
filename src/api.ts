/**
 * PHP BabyAPI backend client (legacy secondary client)
 * Public auth endpoints use credentials: 'omit'; protected endpoints use credentials: 'include'
 */

import { getBackendUrl } from "@/lib/config";

function getBase(): string {
  return `${getBackendUrl()}/api/v1`;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Public fetch — NO cookies sent. For auth and other public endpoints. */
async function publicApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const res = await fetch(`${getBase()}${path}`, {
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
    ...options,
  });
  const json = (await res.json()) as ApiResponse<T>;
  return json;
}

/** Protected fetch — sends BABYAPI_SESSION cookie. For authenticated panel endpoints. */
async function protectedApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const res = await fetch(`${getBase()}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
    ...options,
  });
  const json = (await res.json()) as ApiResponse<T>;
  return json;
}

// ─── Auth — PUBLIC (no cookies) ───────────────────────────────────────────────

export async function login(email: string, password: string) {
  return publicApiFetch<import("@/types/index").MeResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(email: string, password: string) {
  return publicApiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function verifyOtp(
  email: string,
  otp_code: string,
  purpose: string,
) {
  return publicApiFetch("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp_code, purpose }),
  });
}

export async function resendOtp(email: string, purpose: string) {
  return publicApiFetch("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email, purpose }),
  });
}

export async function forgotPassword(email: string) {
  return publicApiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  email: string,
  otp_code: string,
  new_password: string,
) {
  return publicApiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp_code, new_password }),
  });
}

export async function createPassword(password: string) {
  return publicApiFetch("/auth/create-password", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

// ─── Auth — PROTECTED (requires session cookie) ───────────────────────────────

export async function logout() {
  try {
    await fetch(`${getBackendUrl()}/panel/logout.php`, {
      credentials: "include",
      redirect: "manual",
    });
  } catch {
    // best-effort
  }
}

export function googleOAuth() {
  window.location.href = `${getBackendUrl()}/auth/google.php`;
}

// ─── User / session — PROTECTED ───────────────────────────────────────────────

export async function getMe() {
  return protectedApiFetch<import("@/types/index").MeResponse>("/me");
}
