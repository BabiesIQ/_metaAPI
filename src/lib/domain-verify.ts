/**
 * Domain Verification — BabiesIQ Platform Protection
 *
 * On every startup, the frontend sends the current hostname to the backend.
 * If the hostname is not in the trusted domains list, the app is locked.
 * This prevents unauthorized deployments from accessing any platform features.
 */

import { getBackendUrl } from "@/lib/config";

export type DomainVerifyResult =
  | { trusted: true; environment: string }
  | { trusted: false; reason: string };

/**
 * Verify the current deployment hostname against the BabiesIQ backend.
 * Returns true if the hostname is a trusted domain, false otherwise.
 */
export async function verifyDomain(): Promise<DomainVerifyResult> {
  const hostname = window.location.hostname;

  // Always trust localhost for developer convenience
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".replit.dev") ||
    hostname.endsWith(".repl.co")
  ) {
    return { trusted: true, environment: "development" };
  }

  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/verify-domain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({ hostname }),
      signal: AbortSignal.timeout(8000),
      credentials: "omit",
    });

    if (!res.ok) {
      return { trusted: false, reason: `Verification failed (HTTP ${res.status})` };
    }

    const json = await res.json() as { success: boolean; data: { trusted: boolean; environment?: string } };
    if (json.success && json.data.trusted) {
      return { trusted: true, environment: json.data.environment ?? "production" };
    }

    return { trusted: false, reason: "Hostname not in trusted domains list" };
  } catch (err) {
    // Network failure — fail open only in explicit development mode
    if (import.meta.env.DEV) {
      console.warn("[BabiesIQ] Domain verification skipped in dev mode");
      return { trusted: true, environment: "development" };
    }
    return { trusted: false, reason: "Could not reach verification server" };
  }
}
