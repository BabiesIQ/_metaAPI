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
import { generateApiKey, getApiKeys } from "@/lib/api";
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
  History,
  Key,
  RefreshCw,
  ShieldCheck,
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

export function ApiKeysPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [appName, setAppName] = useState("");
  const [appNameError, setAppNameError] = useState("");
  const [revealTimer, setRevealTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [resetCountdown, setResetCountdown] = useState(() => countdownToReset());

  const { data: keys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await getApiKeys();
      return res.success && res.data ? res.data : [];
    },
  });

  const activeKey = keys?.find((k) => k.status === "active");
  const revokedKeys = keys?.filter((k) => k.status === "revoked") ?? [];

  const generateMut = useMutation({
    mutationFn: (name: string) => generateApiKey(name, expiresAt || null),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error ?? "Could not generate API key.");
        return;
      }
      toast.success("New API key generated successfully!");
      setConfirmOpen(false);
      setAppName("");
      setAppNameError("");
      setShowKey(false);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: () => toast.error("Network error. Please try again."),
  });

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setAppName("");
      setAppNameError("");
      setExpiresAt("");
    }
    setConfirmOpen(open);
  };

  const handleGenerate = () => {
    const trimmed = appName.trim();
    if (!trimmed) {
      setAppNameError(t("api_keys.app_name_required"));
      return;
    }
    if (trimmed.length > 100) {
      setAppNameError(t("api_keys.app_name_too_long"));
      return;
    }
    setAppNameError("");
    generateMut.mutate(trimmed);
  };

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

  useEffect(() => {
    return () => {
      if (revealTimer) clearTimeout(revealTimer);
    };
  }, [revealTimer]);

  // update reset countdown every minute
  useEffect(() => {
    const id = setInterval(() => setResetCountdown(countdownToReset()), 60_000);
    return () => clearInterval(id);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success(t("common.copied"), { duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageTransition>
          <div
            className="space-y-6 fade-in max-w-2xl"
            data-ocid="api_keys.page"
          >
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
                    {t("api_keys.subtitle")}
                  </p>
                </div>
                <Button
                  className="gradient-primary text-white border-0 gap-2 shadow-elevated shrink-0"
                  onClick={() => setConfirmOpen(true)}
                  data-ocid="api_keys.generate.open_modal_button"
                >
                  <RefreshCw className="w-4 h-4" />
                  {activeKey
                    ? t("api_keys.generate_new")
                    : t("api_keys.generate_first")}
                </Button>
              </div>
            </motion.div>

            {/* Active Key Card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
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
                      {/* Key display */}
                      <div className="flex items-center gap-2 p-3.5 rounded-xl bg-background border border-border font-mono text-sm group hover:border-primary/30 transition-smooth">
                        <ShieldCheck className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                        <span
                          className="flex-1 truncate text-foreground"
                          data-ocid="api_keys.active_key.display"
                        >
                          {showKey
                            ? activeKey.api_key
                            : maskKey(activeKey.api_key)}
                        </span>
                        <button
                          type="button"
                          onClick={showKey ? handleHide : handleReveal}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted min-w-[32px] min-h-[32px] flex items-center justify-center"
                          aria-label={
                            showKey
                              ? t("api_keys.hide_key")
                              : t("api_keys.reveal_key")
                          }
                          data-ocid="api_keys.reveal.toggle"
                        >
                          {showKey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(activeKey.api_key)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted min-w-[32px] min-h-[32px] flex items-center justify-center"
                          aria-label={t("api_keys.copy_key")}
                          data-ocid="api_keys.copy.button"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Key meta row */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs border-primary/30 text-primary bg-primary/5"
                        >
                          {activeKey.prefix}
                        </Badge>
                        {activeKey.application_name && (
                          <span className="font-medium text-foreground/80 bg-muted/50 px-2.5 py-1 rounded-full text-xs">
                            {activeKey.application_name}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          {t("api_keys.generated_on")}{" "}
                          {formatDate(activeKey.created_at)}
                        </span>
                        {activeKey.expires_at && (
                          <span className="flex items-center gap-1 text-xs text-amber-400">
                            <CalendarDays className="w-3 h-3" />
                            Expires {formatDate(activeKey.expires_at)}
                          </span>
                        )}
                      </div>
                      {/* Reset time */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Resets in {resetCountdown} ({IST_RESET_TIME_LABEL})
                      </div>

                      {showKey && (
                        <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          {t("api_keys.key_hides")}
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      className="text-center py-12"
                      data-ocid="api_keys.empty_state"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Key className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="font-display font-semibold text-foreground mb-1">
                        {t("api_keys.no_key_title")}
                      </p>
                      <p className="text-sm text-muted-foreground mb-5 font-body">
                        {t("api_keys.no_key_desc")}
                      </p>
                      <Button
                        className="gradient-primary text-white border-0 gap-2 shadow-elevated"
                        onClick={() => setConfirmOpen(true)}
                        disabled={generateMut.isPending}
                        data-ocid="api_keys.generate_first.button"
                      >
                        <Key className="w-4 h-4" />
                        {generateMut.isPending
                          ? t("api_keys.generating")
                          : t("api_keys.generate_first")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Key History */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2 text-muted-foreground">
                    <History className="w-4 h-4" />
                    {t("api_keys.key_history")}
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
                    <div
                      className="text-center py-8"
                      data-ocid="api_keys.history.empty_state"
                    >
                      <p className="text-sm text-muted-foreground">
                        {t("api_keys.no_history")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {revokedKeys.slice(0, 10).map((k, idx) => (
                        <div
                          key={k.id}
                          className="flex items-center gap-3 py-3 px-3 rounded-lg border border-border/40 hover:bg-muted/20 transition-smooth"
                          data-ocid={`api_keys.revoked.item.${idx + 1}`}
                        >
                          <Badge
                            variant="outline"
                            className="font-mono text-xs border-border text-muted-foreground flex-shrink-0 bg-muted/30"
                          >
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
                          <Badge
                            variant="outline"
                            className="text-xs text-destructive border-destructive/30 bg-destructive/10 flex-shrink-0"
                          >
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

          {/* Generate Dialog */}
          <Dialog open={confirmOpen} onOpenChange={handleDialogClose}>
            <DialogContent
              className="sm:max-w-md bg-card border-border"
              data-ocid="api_keys.dialog"
            >
              <DialogHeader>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
                <DialogTitle className="font-display text-center text-lg">
                  {activeKey
                    ? t("api_keys.regen_title")
                    : t("api_keys.gen_title")}
                </DialogTitle>
                <DialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
                  {activeKey ? (
                    <>
                      {t("api_keys.regen_desc")}{" "}
                      <span className="font-mono text-foreground/70 text-xs">
                        ({activeKey.prefix}...{activeKey.api_key.slice(-4)})
                      </span>
                    </>
                  ) : (
                    t("api_keys.gen_desc")
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-2">
                <Label
                  htmlFor="api_keys_app_name"
                  className="text-sm font-medium"
                >
                  {t("api_keys.app_name_label")}{" "}
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </Label>
                <Input
                  id="api_keys_app_name"
                  placeholder={t("api_keys.app_name_placeholder")}
                  value={appName}
                  onChange={(e) => {
                    setAppName(e.target.value);
                    if (appNameError) setAppNameError("");
                  }}
                  maxLength={100}
                  className={`bg-background border-border h-11 ${appNameError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  data-ocid="api_keys.app_name.input"
                  disabled={generateMut.isPending}
                />
                {appNameError && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="api_keys.app_name.field_error"
                  >
                    {appNameError}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {appName.trim().length}/100 {t("api_keys.chars_limit")}
                </p>
              </div>

              {/* Optional key expiry */}
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
                <p className="text-xs text-muted-foreground">
                  Leave blank for a key that never expires.
                </p>
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
                  variant="destructive"
                  className="flex-1"
                  onClick={handleGenerate}
                  disabled={generateMut.isPending}
                  data-ocid="api_keys.confirm_button"
                >
                  {generateMut.isPending
                    ? t("api_keys.generating")
                    : activeKey
                      ? t("api_keys.yes_regen")
                      : t("api_keys.generate_key")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageTransition>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
