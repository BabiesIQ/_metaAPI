import { getBackendUrl } from "@/lib/config";
import { CheckCircle, Loader2, Wrench, X, XCircle } from "lucide-react";
import { useCallback, useState } from "react";

type Status = "untested" | "loading" | "ok" | "error";

interface EndpointResult {
  status: Status;
  httpCode?: number;
  message?: string;
}

interface EndpointDef {
  name: string;
  method: "GET" | "POST";
  path: string;
  okCodes: number[]; // these codes count as "reachable"
  body?: Record<string, string>;
}

const ENDPOINTS: EndpointDef[] = [
  {
    name: "Backend Reachable",
    method: "GET",
    path: "/api/v1/me",
    okCodes: [200, 401, 403],
  },
  {
    name: "Login Endpoint",
    method: "POST",
    path: "/api/v1/auth/login",
    okCodes: [200, 400, 401, 422],
    body: { email: "test@test.com", password: "wrongpassword" },
  },
  {
    name: "Signup Endpoint",
    method: "POST",
    path: "/api/v1/auth/signup",
    okCodes: [200, 400, 409, 422],
    body: { email: "test@test.com", password: "wrongpassword" },
  },
  {
    name: "Get Profile",
    method: "GET",
    path: "/api/v1/me",
    okCodes: [200, 401, 403],
  },
  {
    name: "API Keys",
    method: "GET",
    path: "/api/v1/api-keys",
    okCodes: [200, 401, 403],
  },
  {
    name: "Usage Stats",
    method: "GET",
    path: "/api/v1/usage/stats",
    okCodes: [200, 401, 403],
  },
  {
    name: "Invoices",
    method: "GET",
    path: "/api/v1/invoices",
    okCodes: [200, 401, 403],
  },
  {
    name: "Notifications",
    method: "GET",
    path: "/api/v1/notifications",
    okCodes: [200, 401, 403],
  },
  {
    name: "Billing/Plans",
    method: "GET",
    path: "/api/v1/plans",
    okCodes: [200, 401, 403],
  },
  {
    name: "Billing Current",
    method: "GET",
    path: "/api/v1/billing/current",
    okCodes: [200, 401, 403],
  },
];

async function testEndpoint(ep: EndpointDef): Promise<EndpointResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const init: RequestInit = {
      method: ep.method,
      credentials: "include",
      signal: controller.signal,
      headers: ep.body ? { "Content-Type": "application/json" } : undefined,
      body: ep.body ? JSON.stringify(ep.body) : undefined,
    };

    const res = await fetch(`${getBackendUrl()}${ep.path}`, init);
    clearTimeout(timer);

    let errorMsg: string | undefined;
    try {
      const json = (await res.clone().json()) as {
        error?: string;
        message?: string;
      };
      errorMsg = json.error ?? json.message;
    } catch {
      // non-JSON body — ignore
    }

    if (ep.okCodes.includes(res.status)) {
      return {
        status: "ok",
        httpCode: res.status,
        message:
          res.status === 401 ? "Not logged in (endpoint exists)" : errorMsg,
      };
    }

    return {
      status: "error",
      httpCode: res.status,
      message: errorMsg ?? `HTTP ${res.status}`,
    };
  } catch (err: unknown) {
    clearTimeout(timer);
    const raw = err instanceof Error ? err.message : String(err);
    const msg = raw.toLowerCase();

    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        status: "error",
        message: "Timeout (5s) — server not responding",
      };
    }
    if (msg.includes("cors") || msg.includes("cross-origin")) {
      return {
        status: "error",
        message: `CORS blocked — origin not allowed. Raw: "${raw}"`,
      };
    }
    if (msg.includes("load failed") || msg.includes("failed to fetch")) {
      // iOS Safari / desktop Safari: CORS or network failure shows as "Load failed"
      return {
        status: "error",
        message: `Network/CORS error (iOS: "Load failed"). Raw: "${raw}"`,
      };
    }
    if (msg.includes("ssl") || msg.includes("certificate")) {
      return {
        status: "error",
        message: `SSL/certificate error. Raw: "${raw}"`,
      };
    }
    if (err instanceof TypeError) {
      return {
        status: "error",
        message: `Network error — server unreachable. Raw: "${raw}"`,
      };
    }
    return { status: "error", message: `Unknown error. Raw: "${raw}"` };
  }
}

function StatusBadge({ result }: { result: EndpointResult }) {
  if (result.status === "untested") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40">
        —
      </span>
    );
  }
  if (result.status === "loading") {
    return (
      <Loader2 className="w-4 h-4 text-yellow-400 animate-spin shrink-0" />
    );
  }
  if (result.status === "ok") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-400">
        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
        {result.httpCode && (
          <span className="font-mono">{result.httpCode}</span>
        )}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-red-400">
      <XCircle className="w-3.5 h-3.5 shrink-0" />
      {result.httpCode && <span className="font-mono">{result.httpCode}</span>}
    </span>
  );
}

export function DiagnosticPanel() {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Record<string, EndpointResult>>(
    Object.fromEntries(
      ENDPOINTS.map((e) => [e.name, { status: "untested" as Status }]),
    ),
  );

  const runTest = useCallback(async (ep: EndpointDef) => {
    setResults((prev) => ({ ...prev, [ep.name]: { status: "loading" } }));
    const result = await testEndpoint(ep);
    setResults((prev) => ({ ...prev, [ep.name]: result }));
  }, []);

  const runAll = useCallback(async () => {
    // Set all to loading
    setResults(
      Object.fromEntries(
        ENDPOINTS.map((e) => [e.name, { status: "loading" as Status }]),
      ),
    );
    // Run all in parallel
    const settled = await Promise.all(ENDPOINTS.map((ep) => testEndpoint(ep)));
    const next: Record<string, EndpointResult> = {};
    ENDPOINTS.forEach((ep, i) => {
      next[ep.name] = settled[i];
    });
    setResults(next);
  }, []);

  const allOk = ENDPOINTS.every((e) => results[e.name]?.status === "ok");
  const anyError = ENDPOINTS.some((e) => results[e.name]?.status === "error");

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        data-ocid="diagnostics.toggle"
        className="fixed bottom-5 right-5 z-[9999] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
        }}
        aria-label="Toggle diagnostics panel"
      >
        <Wrench className="w-3.5 h-3.5" />
        Diagnostics
        {anyError && (
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        )}
        {allOk &&
          !anyError &&
          ENDPOINTS.some((e) => results[e.name]?.status === "ok") && (
            <span className="w-2 h-2 rounded-full bg-green-400" />
          )}
      </button>

      {/* Panel */}
      {open && (
        <div
          data-ocid="diagnostics.panel"
          className="fixed bottom-16 right-5 z-[9998] w-[420px] max-w-[calc(100vw-2.5rem)] rounded-xl overflow-hidden shadow-2xl"
          style={{
            background: "rgba(10,10,20,0.97)",
            border: "1px solid rgba(59,130,246,0.3)",
            maxHeight: "60vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(59,130,246,0.2)" }}
          >
            <div>
              <p className="text-sm font-semibold text-white">
                BabiesIQ Backend Diagnostics
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(148,163,184,0.8)" }}
              >
                <span className="font-mono">{getBackendUrl()}</span>
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  LIVE
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runAll}
                data-ocid="diagnostics.test_all_button"
                className="px-2.5 py-1 rounded-md text-xs font-semibold text-white transition-all hover:opacity-80"
                style={{
                  background: "rgba(59,130,246,0.25)",
                  border: "1px solid rgba(59,130,246,0.4)",
                }}
              >
                Test All
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                data-ocid="diagnostics.close_button"
                className="w-6 h-6 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Close panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Endpoint rows */}
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {ENDPOINTS.map((ep) => {
              const result = results[ep.name];
              return (
                <div
                  key={ep.name}
                  data-ocid={`diagnostics.endpoint.${ep.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`}
                  className="flex items-start gap-2 px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Left: name + path */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/90 truncate">
                      {ep.name}
                    </p>
                    <p
                      className="text-[11px] font-mono mt-0.5 truncate"
                      style={{ color: "rgba(148,163,184,0.6)" }}
                    >
                      <span
                        className="mr-1 font-bold"
                        style={{
                          color: ep.method === "POST" ? "#f59e0b" : "#60a5fa",
                        }}
                      >
                        {ep.method}
                      </span>
                      {ep.path}
                    </p>
                    {result.status === "error" && result.message && (
                      <p className="text-[11px] mt-1 text-red-400/80 break-words">
                        {result.message}
                      </p>
                    )}
                    {result.status === "ok" && result.message && (
                      <p className="text-[11px] mt-1 text-green-400/70">
                        {result.message}
                      </p>
                    )}
                  </div>

                  {/* Right: status + test button */}
                  <div className="flex items-center gap-2 shrink-0 mt-0.5">
                    <StatusBadge result={result} />
                    <button
                      type="button"
                      onClick={() => runTest(ep)}
                      disabled={result.status === "loading"}
                      className="px-2 py-0.5 rounded text-[11px] font-medium transition-all hover:opacity-80 disabled:opacity-40"
                      style={{
                        background: "rgba(59,130,246,0.15)",
                        border: "1px solid rgba(59,130,246,0.3)",
                        color: "#93c5fd",
                      }}
                    >
                      Test
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-2 shrink-0 text-[11px]"
            style={{
              borderTop: "1px solid rgba(59,130,246,0.15)",
              color: "rgba(148,163,184,0.5)",
            }}
          >
            Green = server responded (any 2xx/4xx). Red = network error or 5xx.
            Timeout = 5s.
          </div>
        </div>
      )}
    </>
  );
}
