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

import { useEffect, useRef } from "react";

import { activateSession } from "@/lib/api";

export function OAuthCallbackPage() {
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("t");
    const error = params.get("error");

    if (error || !token) {
      window.location.replace(`/login?error=${encodeURIComponent(error ?? "oauth_failed")}`);
      return;
    }

    activateSession(token)
      .then((res) => {
        if (res.success) {
          window.location.replace("/panel/dashboard");
        } else {
          window.location.replace("/login?error=session_failed");
        }
      })
      .catch(() => {
        window.location.replace("/login?error=session_failed");
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
        <p className="text-sm text-muted-foreground">Completing sign in…</p>
      </div>
    </div>
  );
}
