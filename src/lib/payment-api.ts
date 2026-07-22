import { getBackendUrl } from "@/lib/config";
import { useAuthStore } from "@/store/auth";

type ApiResponse<T> = { success: boolean; data?: T; error?: string | null };

/**
 * Safely parse a fetch Response into an ApiResponse.
 * - Handles non-JSON bodies (HTML error pages, empty bodies, plain text)
 * - Redirects to /login on 401
 * - Surfaces the HTTP status code in the error string for easier debugging
 */
async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  // 401 → clear auth state and go to login
  if (res.status === 401) {
    useAuthStore.getState().setUser(null);
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    return { success: false, error: "Unauthorized" };
  }

  // Read body as text first so we can inspect it regardless of Content-Type
  const text = await res.text().catch(() => "");

  // Try to parse as JSON
  let json: ApiResponse<T> | null = null;
  try {
    json = JSON.parse(text) as ApiResponse<T>;
  } catch {
    // Not JSON — backend or proxy returned HTML / plain-text error page
    // (e.g. Nginx 502/504 gateway error page).
    // Surface a clear message instead of the raw "Unexpected token '<'" crash.
    const preview = text.slice(0, 120).replace(/\s+/g, " ").trim();
    return {
      success: false,
      error: `Server error (HTTP ${res.status})${preview ? `: ${preview}` : ""}`,
    };
  }

  if (!res.ok || json.success === false) {
    return {
      success: false,
      error: json.error ?? json.message ?? `HTTP ${res.status}`,
    };
  }

  return { success: true, data: (json as { data?: T }).data ?? (json as unknown as T) };
}

async function call<T>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        "X-Requested-With": "XMLHttpRequest",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return parseResponse<T>(res);
  } catch (e: unknown) {
    // Network-level failure (DNS, connection refused, CORS block, etc.)
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error — check your connection",
    };
  }
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  plan_name: string;
  months: number;
  /** Set only for partner-proxy requests. If non-empty, redirect here instead of opening embedded checkout. */
  payment_link_url?: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface SubscriptionEntry {
  plan: string;
  status: string;
  start_at: string;
  end_at: string;
}

export const createOrder = (plan_code: string, months: number) =>
  call<CreateOrderResponse>("POST", "/payment/create-order", { plan_code, months });

export const verifyPayment = (req: VerifyPaymentRequest) =>
  call<{ message: string; plan: string; months: number; amount: number }>(
    "POST",
    "/payment/verify",
    req,
  );

export const getSubscriptions = () =>
  call<{ subscriptions: SubscriptionEntry[] }>("GET", "/payment/subscriptions");
