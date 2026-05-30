import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { generateApiKey, getApiKeys, revokeApiKey } from "@/lib/api";
import type { ApiKey } from "@/types/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  Key,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function maskKey(key: string): string {
  if (key.length <= 12) return "••••••••••••";
  return `${key.slice(0, 8)}${"•".repeat(key.length - 12)}${key.slice(-4)}`;
}

function KeyRow({
  apiKey,
  index,
  onRevoke,
}: {
  apiKey: ApiKey;
  index: number;
  onRevoke: (key: ApiKey) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey.api_key);
    setCopied(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 border-b border-border/60 last:border-0"
      data-ocid={`keys.item.${index}`}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">
            {apiKey.prefix}…
          </span>
          <Badge
            className={`text-xs px-2 py-0 border-0 ${
              apiKey.status === "active"
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {apiKey.status}
          </Badge>
          {apiKey.application_name && (
            <span className="text-xs font-medium text-foreground/70 truncate max-w-[160px]">
              {apiKey.application_name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-muted-foreground break-all">
            {revealed ? apiKey.api_key : maskKey(apiKey.api_key)}
          </code>
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            aria-label={revealed ? "Hide key" : "Show key"}
          >
            {revealed ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <div className="text-xs text-muted-foreground font-body">
          Created: {formatDate(apiKey.created_at)}
        </div>
      </div>
      {apiKey.status === "active" && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-3 text-xs border-border"
            data-ocid={`keys.copy_button.${index}`}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 mr-1.5 text-primary" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1.5" />
            )}
            Copy
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRevoke(apiKey)}
            className="h-8 px-3 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
            data-ocid={`keys.revoke_button.${index}`}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Revoke
          </Button>
        </div>
      )}
    </div>
  );
}

function DashboardKeysContent() {
  const queryClient = useQueryClient();
  const [showConfirmGenerate, setShowConfirmGenerate] = useState(false);
  const [appName, setAppName] = useState("");
  const [appNameError, setAppNameError] = useState("");
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);

  const { data: keys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ["apiKeys"],
    queryFn: async () => {
      const res = await getApiKeys();
      return res.success ? res.data : [];
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await generateApiKey(name);
      if (!res.success) throw new Error(res.error ?? "Failed to generate key");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      setShowConfirmGenerate(false);
      setAppName("");
      setAppNameError("");
      toast.success("New API key generated! Old key has been revoked.");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Failed to generate key");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (target: ApiKey) => {
      const res = await revokeApiKey(target.id, target.application_name ?? "");
      if (!res.success) throw new Error(res.error ?? "Failed to revoke key");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      setRevokeTarget(null);
      toast.success("API key revoked");
    },
    onError: () => {
      toast.error("Failed to revoke API key");
    },
  });

  const activeKey = keys?.find((k) => k.status === "active");

  const handleGenerateDialogClose = (open: boolean) => {
    if (!open) {
      setAppName("");
      setAppNameError("");
    }
    setShowConfirmGenerate(open);
  };

  const handleGenerateConfirm = () => {
    const trimmed = appName.trim();
    if (!trimmed) {
      setAppNameError("Application name is required.");
      return;
    }
    if (trimmed.length > 100) {
      setAppNameError("Application name must be 100 characters or fewer.");
      return;
    }
    setAppNameError("");
    generateMutation.mutate(trimmed);
  };

  return (
    <div className="space-y-6" data-ocid="keys.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            API Keys
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Manage your API access tokens
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowConfirmGenerate(true)}
          className="gradient-primary text-white border-0"
          data-ocid="keys.generate.open_modal_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          {activeKey ? "Regenerate Key" : "Generate Key"}
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Your API Keys
          </CardTitle>
          <CardDescription className="font-body">
            {isLoading
              ? "Loading…"
              : `${keys?.length ?? 0} key${(keys?.length ?? 0) !== 1 ? "s" : ""} in your account`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4" data-ocid="keys.loading_state">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="py-4 border-b border-border/60 last:border-0"
                >
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-64 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          ) : keys && keys.length > 0 ? (
            keys.map((k, i) => (
              <KeyRow
                key={k.id}
                apiKey={k}
                index={i + 1}
                onRevoke={(key) => setRevokeTarget(key)}
              />
            ))
          ) : (
            <div className="text-center py-12" data-ocid="keys.empty_state">
              <Key className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-body text-muted-foreground mb-4">
                No API keys yet. Generate your first key to get started.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmGenerate(true)}
                data-ocid="keys.empty_generate.button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate / Regenerate Confirm Modal */}
      <Dialog
        open={showConfirmGenerate}
        onOpenChange={handleGenerateDialogClose}
      >
        <DialogContent
          className="bg-card border-border"
          data-ocid="keys.generate.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              {activeKey ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />{" "}
                  Regenerate API Key
                </>
              ) : (
                "Generate API Key"
              )}
            </DialogTitle>
            <DialogDescription className="font-body">
              {activeKey
                ? "Generating a new key will permanently revoke your current key. Any services using the old key will stop working immediately."
                : "Generate a new API key to start making requests to BabiesIQ."}
            </DialogDescription>
          </DialogHeader>

          {/* Application Name field */}
          <div className="space-y-1.5 py-1">
            <Label htmlFor="dash_keys_app_name" className="text-sm font-medium">
              Application Name{" "}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </Label>
            <Input
              id="dash_keys_app_name"
              placeholder="e.g. My Mobile App"
              value={appName}
              onChange={(e) => {
                setAppName(e.target.value);
                if (appNameError) setAppNameError("");
              }}
              maxLength={100}
              className={`bg-background border-border ${appNameError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              data-ocid="keys.app_name.input"
              disabled={generateMutation.isPending}
            />
            {appNameError && (
              <p
                className="text-xs text-destructive"
                data-ocid="keys.app_name.field_error"
              >
                {appNameError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {appName.trim().length}/100 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleGenerateDialogClose(false)}
              className="border-border"
              disabled={generateMutation.isPending}
              data-ocid="keys.generate.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleGenerateConfirm}
              disabled={generateMutation.isPending}
              className={
                activeKey
                  ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                  : "gradient-primary text-white border-0"
              }
              data-ocid="keys.generate.confirm_button"
            >
              {generateMutation.isPending
                ? "Generating…"
                : activeKey
                  ? "Yes, Regenerate"
                  : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm Modal */}
      <Dialog
        open={revokeTarget !== null}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <DialogContent
          className="bg-card border-border"
          data-ocid="keys.revoke.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              Revoke API Key
            </DialogTitle>
            <DialogDescription className="font-body">
              {revokeTarget?.application_name ? (
                <>
                  Are you sure you want to revoke the key for{" "}
                  <span className="font-semibold text-foreground">
                    &ldquo;{revokeTarget.application_name}&rdquo;
                  </span>
                  ? This action cannot be undone. Services using this key will
                  lose access immediately.
                </>
              ) : (
                "This action cannot be undone. Services using this key will lose access immediately."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRevokeTarget(null)}
              data-ocid="keys.revoke.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                revokeTarget !== null && revokeMutation.mutate(revokeTarget)
              }
              disabled={revokeMutation.isPending}
              data-ocid="keys.revoke.confirm_button"
            >
              {revokeMutation.isPending ? "Revoking…" : "Revoke Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DashboardKeysPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardKeysContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
