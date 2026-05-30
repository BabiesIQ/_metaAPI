import { getBackendUrl } from "@/lib/config";

type ApiResponse<T> = { success: boolean; data?: T; error?: string | null };

async function call<T>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (res.ok && json.success !== false) return { success: true, data: json.data ?? json };
    return { success: false, error: json.error ?? json.message ?? "Something went wrong" };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  plan_name: string;
  months: number;
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
  call<{ message: string; plan: string; months: number; amount: number }>("POST", "/payment/verify", req);

export const getSubscriptions = () =>
  call<{ subscriptions: SubscriptionEntry[] }>("GET", "/payment/subscriptions");
