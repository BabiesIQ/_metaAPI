import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiKeys, getMe, getNotifications } from "@/lib/api";
import { PLAN_LABELS } from "@/types/index";
import type { ApiKey, MeResponse, Notification, PlanCode } from "@/types/index";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  ArrowUpCircle,
  BarChart2,
  Bell,
  BookOpen,
  CheckCircle,
  Copy,
  Crown,
  Key,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const LEVEL_DOT: Record<string, string> = {
  info: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
};

const PLAN_BADGE_COLORS: Record<PlanCode, string> = {
  free: "text-muted-foreground border-border bg-muted/40",
  pro: "text-primary border-primary/30 bg-primary/10",
  pro_plus: "text-accent border-accent/30 bg-accent/10",
  business: "text-amber-400 border-amber-500/30 bg-amber-500/10",
};

const STATUS_BADGE: Record<string, string> = {
  active: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  restricted: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  banned: "text-destructive border-destructive/30 bg-destructive/10",
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub?: string;
  iconClass: string;
  accentBar?: string;
  isLoading?: boolean;
  progress?: number;
  delay?: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass,
  accentBar,
  isLoading,
  progress,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="bg-card border-border hover:border-primary/30 transition-smooth group relative overflow-hidden h-full">
        {accentBar && (
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentBar}`} />
        )}
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass} group-hover:scale-110 transition-smooth`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest font-semibold">
              {label}
            </span>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          ) : (
            <>
              <div className="text-3xl font-display font-bold text-foreground tracking-tight">
                {value}
              </div>
              {sub && (
                <p className="text-xs text-muted-foreground mt-1 font-body">
                  {sub}
                </p>
              )}
              {progress !== undefined && (
                <div className="mt-3">
                  <Progress value={progress} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {progress}% used
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActiveKeyCard({ activeKey }: { activeKey: ApiKey | undefined }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!activeKey) return;
    await navigator.clipboard.writeText(activeKey.api_key);
    setCopied(true);
    toast.success(t("api_keys.copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeKey) {
    return (
      <div
        className="text-center py-8"
        data-ocid="dashboard.apikey.empty_state"
      >
        <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
          <Key className="w-6 h-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {t("api_keys.no_key_title")}
        </p>
        <Button
          asChild
          size="sm"
          className="gradient-primary text-white border-0 gap-2"
          data-ocid="dashboard.apikey.generate.button"
        >
          <Link to="/panel/api-keys">
            <Key className="w-3.5 h-3.5" /> {t("api_keys.generate_first")}
          </Link>
        </Button>
      </div>
    );
  }

  const masked = `${activeKey.api_key.slice(0, 8)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${activeKey.api_key.slice(-4)}`;

  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border font-mono text-sm hover:border-primary/30 transition-smooth"
        data-ocid="dashboard.apikey.display"
      >
        <span className="flex-1 truncate text-foreground text-xs">
          {masked}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          aria-label="Copy API key"
          data-ocid="dashboard.apikey.copy.button"
        >
          {copied ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      {activeKey.application_name && (
        <div className="flex items-center gap-2">
          <span className="text-xs bg-muted/50 text-muted-foreground px-2.5 py-1 rounded-full">
            {activeKey.application_name}
          </span>
          <Badge
            variant="outline"
            className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t("api_keys.active")}
          </Badge>
        </div>
      )}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t("api_keys.generated_on")}{" "}
          {new Date(activeKey.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-primary hover:text-primary gap-1"
          data-ocid="dashboard.apikeys.manage.link"
        >
          <Link to="/panel/api-keys">
            {t("common.manage")} <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();

  const { data: me, isLoading: meLoading } = useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await getMe();
      if (!res.success || !res.data) throw new Error(res.error ?? "Failed");
      return res.data;
    },
  });

  const { data: keysData, isLoading: keysLoading } = useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await getApiKeys();
      return res.success && res.data ? res.data : [];
    },
  });

  const { data: notifs, isLoading: notifsLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await getNotifications();
      return res.success && res.data ? res.data : [];
    },
  });

  const isLoading = meLoading;
  const planCode = (me?.plan?.code ?? "free") as PlanCode;
  const planName = PLAN_LABELS[planCode] ?? "Free";
  const userName = me?.user?.first_name ?? me?.user?.email?.split("@")[0] ?? "";
  const userStatus = me?.user?.status ?? "active";
  const dailyLimit = me?.plan?.daily_limit ?? 500;
  const today = me?.usage?.today ?? 0;
  const remaining = me?.usage?.remaining ?? 0;
  const lifetime = me?.usage?.lifetime ?? 0;
  const usedPct =
    dailyLimit > 0 ? Math.min(100, Math.round((today / dailyLimit) * 100)) : 0;
  const activeKey = keysData?.find((k) => k.status === "active");
  const recentNotifs = notifs?.slice(0, 5) ?? [];
  const todayDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 fade-in" data-ocid="dashboard.page">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-2xl bg-card border border-border p-6"
            data-ocid="dashboard.welcome.card"
          >
            <div className="absolute top-0 right-0 w-80 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-28 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />
            <div className="relative flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  {isLoading ? (
                    <Skeleton className="w-6 h-6 rounded-full" />
                  ) : (
                    <User className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground">
                    {isLoading ? (
                      <Skeleton className="h-6 w-52 inline-block" />
                    ) : (
                      <>
                        {t("dashboard.welcome")},{" "}
                        <span className="text-gradient">{userName}</span>! 👋
                      </>
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5 font-body">
                    {isLoading ? (
                      <Skeleton className="h-4 w-36 inline-block mt-1" />
                    ) : (
                      todayDate
                    )}
                  </p>
                </div>
              </div>
              <div
                className="flex items-center gap-2 flex-wrap"
                data-ocid="dashboard.tier.badge"
              >
                {isLoading ? (
                  <Skeleton className="h-7 w-28 rounded-full" />
                ) : (
                  <>
                    <Badge
                      variant="outline"
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${PLAN_BADGE_COLORS[planCode]}`}
                    >
                      <Crown className="w-3 h-3 mr-1.5" />
                      {planName} Plan
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${STATUS_BADGE[userStatus]}`}
                    >
                      {userStatus}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            data-ocid="dashboard.stats.section"
          >
            <StatCard
              icon={Zap}
              label={t("dashboard.api_requests")}
              value={today.toLocaleString()}
              sub={t("usage.api_calls_today")}
              iconClass="bg-primary/10 text-primary"
              accentBar="gradient-primary"
              isLoading={isLoading}
              delay={0.05}
            />
            <StatCard
              icon={CheckCircle}
              label={t("dashboard.remaining")}
              value={remaining.toLocaleString()}
              sub={t("usage.calls_left")}
              iconClass={
                remaining > 100
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-destructive/10 text-destructive"
              }
              isLoading={isLoading}
              progress={isLoading ? undefined : usedPct}
              delay={0.1}
            />
            <StatCard
              icon={Activity}
              label={t("usage.lifetime")}
              value={lifetime.toLocaleString()}
              sub={t("usage.total_all_time")}
              iconClass="bg-accent/10 text-accent"
              isLoading={isLoading}
              delay={0.15}
            />
            <StatCard
              icon={Crown}
              label={t("dashboard.current_plan")}
              value={planName}
              sub={
                dailyLimit === -1
                  ? `${t("dashboard.unlimited")} calls/day`
                  : `${dailyLimit.toLocaleString()} calls/day`
              }
              iconClass="bg-amber-500/10 text-amber-400"
              isLoading={isLoading}
              delay={0.2}
            />
          </div>

          {/* Mid row: API Key + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Active API Key */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="lg:col-span-2"
            >
              <Card
                className="bg-card border-border overflow-hidden h-full"
                data-ocid="dashboard.apikey.card"
              >
                <div className="h-0.5 gradient-primary w-full" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Key className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-sm text-foreground">
                      {t("api_keys.active_key")}
                    </h3>
                  </div>
                  {keysLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full rounded-xl" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ) : (
                    <ActiveKeyCard activeKey={activeKey} />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="lg:col-span-3"
            >
              <div className="space-y-1 mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  {t("dashboard.quick_actions")}
                </h3>
              </div>
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 h-[calc(100%-2rem)]"
                data-ocid="dashboard.quickactions.section"
              >
                <Link
                  to="/panel/api-keys"
                  data-ocid="dashboard.apikeys.quicklink"
                >
                  <Card className="bg-card border-border hover:border-primary/40 hover:shadow-elevated transition-smooth cursor-pointer group h-full">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-smooth">
                        <Key className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {t("dashboard.get_api_key")}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 font-body leading-relaxed">
                          {t("dashboard.get_api_key_desc")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                {planCode !== "business" && (
                  <Link
                    to="/panel/billing"
                    data-ocid="dashboard.upgrade.quicklink"
                  >
                    <Card className="bg-card border-border hover:border-accent/40 hover:shadow-elevated transition-smooth cursor-pointer group h-full">
                      <CardContent className="p-4 flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 group-hover:scale-110 transition-smooth">
                          <ArrowUpCircle className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-display font-semibold text-sm text-foreground group-hover:text-accent transition-colors">
                            {t("dashboard.upgrade_plan")}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 font-body leading-relaxed">
                            {t("dashboard.upgrade_plan_desc")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}
                <Link to="/docs" data-ocid="dashboard.docs.quicklink">
                  <Card className="bg-card border-border hover:border-muted-foreground/30 hover:shadow-elevated transition-smooth cursor-pointer group h-full">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-muted group-hover:scale-110 transition-smooth">
                        <BookOpen className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-sm text-foreground">
                          {t("dashboard.view_docs")}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 font-body leading-relaxed">
                          {t("dashboard.view_docs_desc")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Recent Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card
              className="bg-card border-border"
              data-ocid="dashboard.notifications.section"
            >
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-sm text-foreground">
                      {t("dashboard.recent_activity")}
                    </h3>
                    {!notifsLoading &&
                      recentNotifs.filter((n) => !n.read_at).length > 0 && (
                        <Badge className="gradient-primary text-white border-0 text-xs px-2 h-5">
                          {recentNotifs.filter((n) => !n.read_at).length}
                        </Badge>
                      )}
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary hover:text-primary h-7 font-medium gap-1"
                  >
                    <Link
                      to="/panel/notifications"
                      data-ocid="dashboard.notifications.viewall"
                    >
                      {t("dashboard.view_all")}{" "}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>

                {notifsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3.5 w-36" />
                          <Skeleton className="h-3 w-52" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentNotifs.length === 0 ? (
                  <div
                    className="py-10 text-center"
                    data-ocid="dashboard.notifications.empty_state"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground font-body">
                      {t("dashboard.no_notifications")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentNotifs.map((n, idx) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-smooth hover:bg-muted/30 ${
                          !n.read_at ? "border-l-2 border-l-primary pl-3" : ""
                        }`}
                        data-ocid={`dashboard.notification.item.${idx + 1}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${LEVEL_DOT[n.level] ?? "bg-muted-foreground"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-sm font-medium truncate ${n.read_at ? "text-muted-foreground" : "text-foreground"}`}
                            >
                              {n.title}
                            </p>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {relativeTime(n.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upgrade CTA for free plan */}
          {!isLoading && planCode === "free" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-primary/10 via-accent/5 to-accent/10 border-primary/20 overflow-hidden">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground">
                        {t("dashboard.upgrade_pro")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("dashboard.upgrade_desc")}
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="gradient-primary text-white border-0 shrink-0"
                    size="sm"
                    data-ocid="dashboard.upgrade.button"
                  >
                    <Link to="/panel/billing">
                      {t("billing.upgrade_now")}{" "}
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
