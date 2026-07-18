import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  generateApiKey,
  getApiKeys,
  pauseApiKey,
  resumeApiKey,
  revokeApiKey,
} from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { countdownToReset, IST_RESET_TIME_LABEL } from "@/types/index";
import type { ApiKey } from "@/types/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Gauge,
  History,
  Key,
  Pause,
  Play,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

function maskKey(key: string): string {
  if (key.length <= 12) return key;
  return `${key.slice(0, 8)}••••••••••••${key.slice(-4)}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Single-key card (Free / Pro / Pro+) ──────────────────────────────────────

function SingleKeyCard({
  activeKey,
  isLoading,
  onRegenerate,
}: {
  activeKey?: ApiKey;
  isLoading: boolean;
  onRegenerate: () => void;
}) {
  const { t } = useTranslation();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revealTimer, setRevealTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleReveal = () => {
    if (revealTimer) clearTimeout(revealTimer);
    setShowKey(true);
    const timer = setTimeout(() => setShowKey(false), 10000);
    setRevealTimer(timer);
  };
  const handleHide = () => {
    if (revealTimer) clearTimeout(revealTimer);
    setRevealTimer(null);
    setShowKey(false);
  };
  useEffect(() => () => { if (revealTimer) clearTimeout(revealTimer); }, [revealTimer]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success(t("common.copied"), { duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="h-0.5 gradient-primary w-full" />
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-primary" />
            </div>
            {t("api_keys.active_key")}
          </CardTitle>
          {activeKey && (
            <Badge
              variant="outline"
              className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t("api_keys.active")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        ) : activeKey ? (
          <>
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-background border border-border font-mono text-sm group hover:border-primary/30 transition-smooth">
              <ShieldCheck className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              <span className="flex-1 truncate text-foreground" data-ocid="api_keys.active_key.display">
                {showKey ? activeKey.api_key : maskKey(activeKey.api_key)}
              </span>
              <button
                type="button"
                onClick={showKey ? handleHide : handleReveal}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted min-w-[32px] min-h-[32px] flex items-center justify-center"
                aria-label={showKey ? t("api_keys.hide_key") : t("api_keys.reveal_key")}
                data-ocid="api_keys.reveal.toggle"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(activeKey.api_key)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted min-w-[32px] min-h-[32px] flex items-center justify-center"
                aria-label={t("api_keys.copy_key")}
                data-ocid="api_keys.copy.button"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary bg-primary/5">
                {activeKey.prefix}
              </Badge>
              {activeKey.application_name && (
                <span className="bg-muted/50 px-2 py-0.5 rounded-full">
                  {activeKey.application_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t("api_keys.created")} {formatDate(activeKey.created_at)}
              </span>
              {activeKey.expires_at && (
                <span className="flex items-center gap-1 text-amber-400">
                  <CalendarDays className="w-3 h-3" />
                  {t("api_keys.expires")} {formatDate(activeKey.expires_at)}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-muted-foreground hover:text-foreground border-dashed"
              onClick={onRegenerate}
              data-ocid="api_keys.regenerate.button"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t("api_keys.generate_new")}
            </Button>
          </>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
              <Key className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t("api_keys.no_key")}</p>
            <Button className="gradient-primary text-white border-0 gap-2" onClick={onRegenerate} data-ocid="api_keys.first.generate.button">
              <Key className="w-4 h-4" />
              {t("api_keys.generate_first")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Multi-key row (Business / Admin) ─────────────────────────────────────────

function MultiKeyRow({
  apiKey,
  onPause,
  onResume,
  onRevoke,
  actionLoading,
}: {
  apiKey: ApiKey;
  onPause: (id: number) => void;
  onResume: (id: number) => void;
  onRevoke: (key: ApiKey) => void;
  actionLoading: number | null;
}) {
  const { t } = useTranslation();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revealTimer, setRevealTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const isLoading = actionLoading === apiKey.id;
  const isPaused = apiKey.status === "paused";
  const isActive = apiKey.status === "active";

  const handleReveal = () => {
    if (revealTimer) clearTimeout(revealTimer);
    setShowKey(true);
    const timer = setTimeout(() => setShowKey(false), 10000);
    setRevealTimer(timer);
  };
  const handleHide = () => {
    if (revealTimer) clearTimeout(revealTimer);
    setRevealTimer(null);
    setShowKey(false);
  };
  useEffect(() => () => { if (revealTimer) clearTimeout(revealTimer); }, [revealTimer]);

  const copy = () => {
    navigator.clipboard.writeText(apiKey.api_key).then(() => {
      setCopied(true);
      toast.success(t("common.copied"), { duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border transition-smooth ${
        isPaused
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-border bg-background hover:border-primary/20"
      }`}
    >
      {/* Top row: name + status + actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <Badge
            variant="outline"
            className="font-mono text-xs border-primary/30 text-primary bg-primary/5 flex-shrink-0"
          >
            {apiKey.prefix}
          </Badge>
          {apiKey.application_name && (
            <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
              {apiKey.application_name}
            </span>
          )}
          {isPaused ? (
            <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30 bg-amber-500/10 flex items-center gap-1">
              <Pause className="w-2.5 h-2.5" />
              Paused
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isActive && (
            <button
              type="button"
              onClick={() => onPause(apiKey.id)}
              disabled={isLoading}
              title="Pause this key"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}
          {isPaused && (
            <button
              type="button"
              onClick={() => onResume(apiKey.id)}
              disabled={isLoading}
              title="Resume this key"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onRevoke(apiKey)}
            disabled={isLoading}
            title="Revoke this key"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Key display row */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50 font-mono text-xs">
        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
        <span className="flex-1 truncate text-foreground/70">
          {showKey ? apiKey.api_key : maskKey(apiKey.api_key)}
        </span>
        <button
          type="button"
          onClick={showKey ? handleHide : handleReveal}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded flex-shrink-0"
        >
          {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={copy}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded flex-shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Created {formatDate(apiKey.created_at)}
        </span>
        {apiKey.expires_at && (
          <span className="flex items-center gap-1 text-amber-400">
            <CalendarDays className="w-3 h-3" />
            Expires {formatDate(apiKey.expires_at)}
          </span>
        )}
        {apiKey.request_limit !== undefined && apiKey.request_limit !== null && (
          <span className="flex items-center gap-1 text-primary">
            <Gauge className="w-3 h-3" />
            {apiKey.request_limit === -1 ? "Unlimited" : `${apiKey.request_limit.toLocaleString()}/day`}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ApiKeysPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((s) => s.user);
  const userRole = authUser?.user.role;
  const isMultiKeyUser = userRole === "business" || userRole === "admin";

  // Dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [appName, setAppName] = useState("");
  const [appNameError, setAppNameError] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [requestLimit, setRequestLimit] = useState<string>("");
  const [requestLimitError, setRequestLimitError] = useState("");

  // Revoke confirm dialog state
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);

  // Per-key action loading tracker
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [resetCountdown, setResetCountdown] = useState(() => countdownToReset());

  const { data: keys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await getApiKeys();
      return res.success && res.data ? res.data : [];
    },
  });

  // For single-key mode: the first active key
  const activeKey = keys?.find((k) => k.status === "active");
  // For multi-key mode: all non-revoked keys
  const liveKeys = keys?.filter((k) => k.status === "active" || k.status === "paused") ?? [];
  const revokedKeys = keys?.filter((k) => k.status === "revoked") ?? [];

  const generateMut = useMutation({
    mutationFn: () => {
      const limit = requestLimit.trim()
        ? Number(requestLimit.trim())
        : null;
      return generateApiKey(appName.trim(), expiresAt || null, limit);
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error ?? "Could not generate API key.");
        return;
      }
      toast.success("API key generated successfully!");
      handleDialogClose(false);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: () => toast.error("Network error. Please try again."),
  });

  const revokeMut = useMutation({
    mutationFn: (key: ApiKey) =>
      revokeApiKey(key.id, key.application_name ?? ""),
    onSuccess: (res, key) => {
      if (!res.success) {
        toast.error(res.error ?? "Could not revoke key.");
        return;
      }
      toast.success(`Key "${key.prefix}…" revoked`);
      setRevokeTarget(null);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: () => toast.error("Network error. Please try again."),
  });

  const pauseMut = useMutation({
    mutationFn: (keyId: number) => {
      setActionLoadingId(keyId);
      return pauseApiKey(keyId);
    },
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? "Could not pause key."); return; }
      toast.success("Key paused");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: () => toast.error("Network error."),
    onSettled: () => setActionLoadingId(null),
  });

  const resumeMut = useMutation({
    mutationFn: (keyId: number) => {
      setActionLoadingId(keyId);
      return resumeApiKey(keyId);
    },
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? "Could not resume key."); return; }
      toast.success("Key resumed");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: () => toast.error("Network error."),
    onSettled: () => setActionLoadingId(null),
  });

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setAppName("");
      setAppNameError("");
      setExpiresAt("");
      setRequestLimit("");
      setRequestLimitError("");
    }
    setConfirmOpen(open);
  };

  const handleGenerate = () => {
    const trimmed = appName.trim();
    if (!trimmed) { setAppNameError(t("api_keys.app_name_required")); return; }
    if (trimmed.length > 100) { setAppNameError(t("api_keys.app_name_too_long")); return; }
    setAppNameError("");

    // Validate request limit
    if (requestLimit.trim()) {
      const num = Number(requestLimit.trim());
      if (!Number.isInteger(num) || num < 1) {
        setRequestLimitError("Must be a positive whole number (e.g. 500)");
        return;
      }
    }
    setRequestLimitError("");
    generateMut.mutate();
  };

  // update reset countdown every minute
  useEffect(() => {
    const id = setInterval(() => setResetCountdown(countdownToReset()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageTransition>
          <div className="space-y-6 fade-in max-w-2xl" data-ocid="api_keys.page">
            {/* Page header */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    {t("api_keys.title")}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isMultiKeyUser
                      ? "Manage multiple API keys. Pause, resume, or revoke individual keys anytime."
                      : t("api_keys.subtitle")}
                  </p>
                </div>
                <Button
                  className="gradient-primary text-white border-0 gap-2 shadow-elevated shrink-0"
                  onClick={() => setConfirmOpen(true)}
                  data-ocid="api_keys.generate.open_modal_button"
                >
                  {isMultiKeyUser ? (
                    <>
                      <Plus className="w-4 h-4" />
                      New Key
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      {activeKey ? t("api_keys.generate_new") : t("api_keys.generate_first")}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* ── Multi-key view (Business / Admin) ── */}
            {isMultiKeyUser ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
              >
                <Card className="bg-card border-border overflow-hidden">
                  <div className="h-0.5 gradient-primary w-full" />
                  <CardHeader className="pb-3 pt-5">
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Key className="w-4 h-4 text-primary" />
                      </div>
                      Active Keys
                      {liveKeys.length > 0 && (
                        <Badge variant="outline" className="ml-1 text-xs border-primary/30 text-primary bg-primary/5">
                          {liveKeys.length}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <Skeleton key={i} className="h-28 w-full rounded-xl" />
                        ))}
                      </div>
                    ) : liveKeys.length === 0 ? (
                      <div className="text-center py-10 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                          <Key className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No active keys yet. Generate your first key.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {liveKeys.map((k) => (
                          <MultiKeyRow
                            key={k.id}
                            apiKey={k}
                            onPause={(id) => pauseMut.mutate(id)}
                            onResume={(id) => resumeMut.mutate(id)}
                            onRevoke={setRevokeTarget}
                            actionLoading={actionLoadingId}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              /* ── Single-key view (Free / Pro / Pro+) ── */
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
              >
                <SingleKeyCard
                  activeKey={activeKey}
                  isLoading={isLoading}
                  onRegenerate={() => setConfirmOpen(true)}
                />
              </motion.div>
            )}

            {/* Reset time chip */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1" data-ocid="usage.reset_time">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>
                Daily quota resets in{" "}
                <span className="font-semibold text-foreground">{resetCountdown}</span>{" "}
                ({IST_RESET_TIME_LABEL})
              </span>
            </div>

            {/* Key History (revoked) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              <Card className="bg-card border-border">
                <CardHeader className="pb-3 pt-5">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                      <History className="w-4 h-4 text-muted-foreground" />
                    </div>
                    {t("api_keys.history_title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : revokedKeys.length === 0 ? (
                    <div className="text-center py-8" data-ocid="api_keys.history.empty_state">
                      <p className="text-sm text-muted-foreground">{t("api_keys.no_history")}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {revokedKeys.slice(0, 10).map((k, idx) => (
                        <div
                          key={k.id}
                          className="flex items-center gap-3 py-3 px-3 rounded-lg border border-border/40 hover:bg-muted/20 transition-smooth"
                          data-ocid={`api_keys.revoked.item.${idx + 1}`}
                        >
                          <Badge variant="outline" className="font-mono text-xs border-border text-muted-foreground flex-shrink-0 bg-muted/30">
                            {k.prefix}
                          </Badge>
                          <span className="font-mono text-xs text-muted-foreground flex-1 truncate">
                            {maskKey(k.api_key)}
                          </span>
                          {k.application_name && (
                            <span className="text-xs text-muted-foreground truncate max-w-[120px] flex-shrink-0 bg-muted/40 px-2 py-0.5 rounded-full">
                              {k.application_name}
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs text-destructive border-destructive/30 bg-destructive/10 flex-shrink-0">
                            {t("api_keys.revoked")}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatDate(k.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ── Generate Dialog ── */}
          <Dialog open={confirmOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="sm:max-w-md bg-card border-border" data-ocid="api_keys.dialog">
              <DialogHeader>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                <DialogTitle className="font-display text-center text-lg">
                  {isMultiKeyUser
                    ? "Generate New API Key"
                    : activeKey
                      ? t("api_keys.regen_title")
                      : t("api_keys.gen_title")}
                </DialogTitle>
                <DialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
                  {isMultiKeyUser
                    ? "A new key will be created. Your existing keys remain active."
                    : activeKey
                      ? <>
                          {t("api_keys.regen_desc")}{" "}
                          <span className="font-mono text-foreground/70 text-xs">
                            ({activeKey.prefix}...{activeKey.api_key.slice(-4)})
                          </span>
                        </>
                      : t("api_keys.gen_desc")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* App name */}
                <div className="space-y-2">
                  <Label htmlFor="api_keys_app_name" className="text-sm font-medium">
                    {t("api_keys.app_name_label")}{" "}
                    <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <Input
                    id="api_keys_app_name"
                    placeholder={t("api_keys.app_name_placeholder")}
                    value={appName}
                    onChange={(e) => { setAppName(e.target.value); if (appNameError) setAppNameError(""); }}
                    maxLength={100}
                    className={`bg-background border-border h-11 ${appNameError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    data-ocid="api_keys.app_name.input"
                    disabled={generateMut.isPending}
                  />
                  {appNameError && (
                    <p className="text-xs text-destructive" data-ocid="api_keys.app_name.field_error">
                      {appNameError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{appName.trim().length}/100 {t("api_keys.chars_limit")}</p>
                </div>

                {/* Expiry date */}
                <div className="space-y-2">
                  <Label htmlFor="api_keys_expires_at" className="text-sm font-medium flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                    Key Expiry Date
                    <span className="text-xs text-muted-foreground font-normal ml-1">(optional)</span>
                  </Label>
                  <Input
                    id="api_keys_expires_at"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    min={new Date(Date.now() + 86_400_000).toISOString().split("T")[0]}
                    className="bg-background border-border h-11"
                    data-ocid="api_keys.expires_at.input"
                    disabled={generateMut.isPending}
                  />
                  <p className="text-xs text-muted-foreground">Leave blank for a key that never expires.</p>
                </div>

                {/* Per-key request limit — business/admin only */}
                {isMultiKeyUser && (
                  <div className="space-y-2">
                    <Label htmlFor="api_keys_request_limit" className="text-sm font-medium flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                      Daily Request Limit
                      <span className="text-xs text-muted-foreground font-normal ml-1">(optional)</span>
                    </Label>
                    <Input
                      id="api_keys_request_limit"
                      type="number"
                      min={1}
                      placeholder="e.g. 1000 — leave blank for plan default"
                      value={requestLimit}
                      onChange={(e) => { setRequestLimit(e.target.value); if (requestLimitError) setRequestLimitError(""); }}
                      className={`bg-background border-border h-11 ${requestLimitError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      data-ocid="api_keys.request_limit.input"
                      disabled={generateMut.isPending}
                    />
                    {requestLimitError && (
                      <p className="text-xs text-destructive">{requestLimitError}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Override the per-key daily cap. Leave blank to use your plan's default limit.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2 sm:flex-row flex-col-reverse">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDialogClose(false)}
                  disabled={generateMut.isPending}
                  data-ocid="api_keys.cancel_button"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  className="flex-1 gradient-primary text-white border-0"
                  onClick={handleGenerate}
                  disabled={generateMut.isPending}
                  data-ocid="api_keys.confirm_button"
                >
                  {generateMut.isPending
                    ? t("api_keys.generating")
                    : isMultiKeyUser
                      ? "Generate Key"
                      : activeKey
                        ? t("api_keys.yes_regen")
                        : t("api_keys.generate_key")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Revoke Confirm Dialog (multi-key mode) ── */}
          {isMultiKeyUser && (
            <Dialog open={!!revokeTarget} onOpenChange={(open) => { if (!open) setRevokeTarget(null); }}>
              <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                  <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                    <ShieldOff className="w-6 h-6 text-destructive" />
                  </div>
                  <DialogTitle className="font-display text-center text-lg">Revoke API Key?</DialogTitle>
                  <DialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
                    Key{" "}
                    <span className="font-mono text-foreground/70">
                      {revokeTarget?.prefix}…{revokeTarget?.api_key.slice(-4)}
                    </span>{" "}
                    will be permanently disabled. This cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:flex-row flex-col-reverse">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setRevokeTarget(null)}
                    disabled={revokeMut.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => revokeTarget && revokeMut.mutate(revokeTarget)}
                    disabled={revokeMut.isPending}
                  >
                    {revokeMut.isPending ? "Revoking…" : "Yes, Revoke"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </PageTransition>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
