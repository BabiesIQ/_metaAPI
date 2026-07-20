/**
 * OAuthCallback — /auth/callback
 *
 * Partner OAuth landing page. After Google login, the backend redirects here
 * with a short-lived token:  /auth/callback?t=SESSION_TOKEN
 *
 * This page exchanges the token for a session cookie by calling
 * POST /api/v1/auth/session-activate via the partner's proxy.
 * Because this is a regular credentialed XHR (not a redirect-through-proxy),
 * the browser properly stores the Set-Cookie on the proxy domain.
 */

import { useEffect, useRef, useState } from "react";

import { activateSession } from "@/lib/api";

type Status = "loading" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  session_failed:       "Sign-in session could not be verified. Please try again.",
  session_store_failed: "Server error while saving your session. Please try again.",
  oauth_failed:         "Google sign-in failed. Please try again.",
  oauth_denied:         "Google sign-in was cancelled or denied.",
  oauth_state:          "Sign-in session expired. Please start over.",
  oauth_exchange:       "Failed to complete Google sign-in. Please try again.",
  oauth_userinfo:       "Could not fetch your account info from Google.",
  email_not_verified:   "Your Google email is not verified. Please verify it first.",
  create_user:          "Account setup failed. Please try again.",
  fetch_user:           "Account lookup failed. Please try again.",
  banned:               "Your account has been suspended. Contact support for help.",
  network:              "Could not reach the server. Check your connection and retry.",
};

function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? `Sign-in failed (${code}). Please try again.`;
}

export function OAuthCallbackPage() {
  const called = useRef(false);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const params = new URLSearchParams(window.location.search);
    const token  = params.get("t");
    const error  = params.get("error");

    // Error already set by backend in the redirect URL
    if (error || !token) {
      const code = error ?? "oauth_failed";
      setErrorMsg(getErrorMessage(code));
      setStatus("error");
      // Give the user a moment to see the message before redirecting
      setTimeout(() => {
        window.location.replace(`/login?error=${encodeURIComponent(code)}`);
      }, 3000);
      return;
    }

    activateSession(token)
      .then((res) => {
        if (res.success) {
          window.location.replace("/panel/dashboard");
        } else {
          // Backend returned {success:false} — most likely Sessions.Get failed
          const code = "session_failed";
          setErrorMsg(getErrorMessage(code));
          setStatus("error");
          setTimeout(() => {
            window.location.replace(`/login?error=${encodeURIComponent(code)}&reason=${encodeURIComponent(res.error ?? "")}`);
          }, 3000);
        }
      })
      .catch((err: unknown) => {
        // Network / CORS / fetch error
        const raw = err instanceof Error ? err.message : String(err);
        const isNetwork =
          raw.toLowerCase().includes("failed to fetch") ||
          raw.toLowerCase().includes("network") ||
          raw.toLowerCase().includes("cors") ||
          err instanceof TypeError;
        const code = isNetwork ? "network" : "session_failed";
        setErrorMsg(getErrorMessage(code));
        setStatus("error");
        setTimeout(() => {
          window.location.replace(`/login?error=${encodeURIComponent(code)}&reason=${encodeURIComponent(raw)}`);
        }, 3000);
      });
  }, []);

  if (status === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 max-w-sm mx-auto px-6">
          {/* Error icon */}
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>

          <div className="space-y-1">
            <h2 className="font-semibold text-foreground text-base">Sign-in failed</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{errorMsg}</p>
          </div>

          <p className="text-xs text-muted-foreground">Redirecting you back to login…</p>

          {/* Progress bar */}
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-[shrink_3s_linear_forwards]" style={{ width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
        <p className="text-sm text-muted-foreground">Completing sign in…</p>
      </div>
    </div>
  );
}
