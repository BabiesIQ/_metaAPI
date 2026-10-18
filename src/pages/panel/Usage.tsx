import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  getQuotaAdjustments,
  getUsage,
  getUsageStats,
  type QuotaAdjustment,
} from "@/lib/api";
import { countdownToReset, IST_RESET_TIME_LABEL } from "@/types/index";
import type { UsageDay } from "@/types/index";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  Activity,
  BarChart2,
  CheckCircle,
  Clock,
  Gauge,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_COLOR: Record<string, string> = {
  safe: "#22c55e",
  warning: "#eab308",
  exceeded: "#ef4444",
};

const STATUS_BANNER: Record<string, { bg: string; text: string; key: string }> =
  {
    safe: {
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-400",
      key: "usage.status_safe",
    },
    warning: {
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-400",
      key: "usage.status_warning",
    },
    exceeded: {
      bg: "bg-destructive/10 border-destructive/20",
      text: "text-destructive",
      key: "usage.status_exceeded",
    },
  };

interface ChartEntry {
  label: string;
  count: number;
  date: string;
}

interface TooltipPayloadItem {
  value: number;
  payload: ChartEntry;
}

function CustomTooltip({
  active,
  payload,
  t,
  locale,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  t: (key: string) => string;
  locale: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border/80 bg-popover/95 px-4 py-3 text-xs shadow-xl backdrop-blur-md">
      <p className="mb-2 font-medium text-muted-foreground">{d.date}</p>
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.7)]" />
        {d.count.toLocaleString(locale)} {t("usage.requests")}
      </p>
    </div>
  );
}

const PERIOD_OPTIONS: { key: string; days: number }[] = [
  { key: "usage.days_7", days: 7 },
  { key: "usage.days_30", days: 30 },
  { key: "usage.days_90", days: 90 },
];

const STAT_CARDS = (
  today: number,
  remaining: number,
  lifetime: number,
  dailyLimit: number,
  t: (k: string) => string,
  locale: string,
) => [
  {
    icon: BarChart2,
    label: t("usage.today"),
    value: today.toLocaleString(locale),
    sub: t("usage.api_calls_today"),
    iconClass: "bg-primary/10 text-primary",
    tint: "from-primary/5 to-transparent",
  },
  {
    icon: CheckCircle,
    label: t("usage.remaining"),
    value: remaining.toLocaleString(locale),
    sub: t("usage.calls_left"),
    iconClass:
      remaining > 100
        ? "bg-emerald-500/10 text-emerald-400"
        : "bg-destructive/10 text-destructive",
    tint:
      remaining > 100
        ? "from-emerald-500/5 to-transparent"
        : "from-destructive/5 to-transparent",
  },
  {
    icon: Activity,
    label: t("usage.lifetime"),
    value: lifetime.toLocaleString(locale),
    sub: t("usage.total_all_time"),
    iconClass: "bg-accent/10 text-accent",
    tint: "from-accent/5 to-transparent",
  },
  {
    icon: Zap,
    label: t("usage.daily_limit"),
    value:
      dailyLimit === -1 ? t("usage.unlimited") : dailyLimit.toLocaleString(locale),
    sub: t("usage.per_day"),
    iconClass: "bg-amber-500/10 text-amber-400",
    tint: "from-amber-500/5 to-transparent",
  },
];

function indiaDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function UsagePage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const { user: me, isLoading: meLoading, initialize: refreshMe } = useAuth();
  const [selectedDays, setSelectedDays] = useState(7);
  const [resetCountdown, setResetCountdown] = useState(() => countdownToReset());

  useEffect(() => {
    const id = setInterval(() => setResetCountdown(countdownToReset()), 60_000);
    return () => clearInterval(id);
  }, []);

  const {
    data: days,
    isLoading: usageLoading,
    refetch: refetchUsage,
    isError: usageError,
    error: usageQueryError,
  } = useQuery<UsageDay[]>({
    queryKey: ["usage", me?.user?.id, selectedDays],
    enabled: Boolean(me?.user?.id),
    queryFn: async () => {
      const res = await getUsage(selectedDays);
      if (!res.success || !res.data) {
        throw new Error(res.error ?? "Could not load usage history.");
      }
      return res.data;
    },
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
  const {
    data: quotaAdjustments = [],
    isLoading: quotaAdjustmentsLoading,
    isError: quotaAdjustmentsError,
    refetch: refetchQuotaAdjustments,
  } =
    useQuery<QuotaAdjustment[]>({
      queryKey: ["quota-adjustments", me?.user?.id],
      enabled: Boolean(me?.user?.id),
      queryFn: async () => {
        const res = await getQuotaAdjustments();
        if (!res.success || !res.data) {
          throw new Error(res.error ?? "Could not load quota history.");
        }
        return res.data;
      },
    });

  const {
    data: usageSummary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["usage-stats", me?.user?.id],
    enabled: Boolean(me?.user?.id),
    queryFn: async () => {
      const res = await getUsageStats();
      if (!res.success || !res.data) {
        throw new Error(res.error ?? "Could not load usage statistics.");
      }
      return res.data;
    },
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const isLoading = meLoading || usageLoading || (summaryLoading && !usageSummary);

  const dailyLimit = usageSummary?.limit ?? me?.plan?.daily_limit ?? 500;
  const today = usageSummary?.today ?? me?.usage?.today ?? 0;
  const remaining = usageSummary?.remaining ?? me?.usage?.remaining ?? 0;
  const lifetime = usageSummary?.lifetime ?? me?.usage?.lifetime ?? 0;

  const todayEntry = days?.find((d) => d.date === indiaDateKey(new Date()));
  const usageStatus = todayEntry?.status ?? "safe";

  const chartData: ChartEntry[] = (days ?? []).map((d) => ({
    label: (() => {
      try {
        const date = new Date(`${d.date}T12:00:00`);
        return date.toLocaleDateString(
          locale,
          selectedDays === 7
            ? { weekday: "short" }
            : { month: "short", day: "numeric" },
        );
      } catch {
        return d.date;
      }
    })(),
    count: d.count,
    date: (() => {
      try {
        return new Date(`${d.date}T12:00:00`).toLocaleDateString(locale, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {
        return d.date;
      }
    })(),
  }));

  const totalReqs = (days ?? []).reduce((sum, d) => sum + d.count, 0);
  const avgPerDay =
    days && days.length > 0 ? Math.round(totalReqs / days.length) : 0;
  const peakDay =
    days && days.length > 0
      ? days.reduce((max, d) => (d.count > max.count ? d : max), days[0])
      : null;

  const handleRefresh = () => {
    void refreshMe();
    void refetchUsage();
    void refetchSummary();
    void refetchQuotaAdjustments();
  };

  const bannerInfo = STATUS_BANNER[usageStatus] ?? STATUS_BANNER.safe;
  const stats = STAT_CARDS(today, remaining, lifetime, dailyLimit, t, locale);
  const historyFrom =
    days && days.length > 0 && days.length < selectedDays
      ? new Date(`${days[0].date}T12:00:00`).toLocaleDateString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageTransition>
          <div className="space-y-6" data-ocid="usage.page">
            {/* Page header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {t("usage.title")}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("usage.subtitle")}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                  >
                    {t("usage.live")}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="gap-1.5 text-xs border-border hover:border-primary/30 transition-smooth"
                  data-ocid="usage.refresh.button"
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                  />
                  {t("usage.refresh")}
                </Button>
              </div>
            </div>

            {summaryError && (
              <div
                className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                role="alert"
              >
                <p className="text-sm text-foreground">
                  Could not refresh your usage summary. Showing the latest available values.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetchSummary()}
                  className="shrink-0"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Stats Row — staggered entrance */}
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              data-ocid="usage.stats.section"
            >
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                >
                  <Card className="relative bg-card border-border hover:border-primary/25 hover:shadow-md transition-smooth overflow-hidden">
                    <CardContent className="p-5 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconClass}`}
                        >
                          <s.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs text-muted-foreground font-body uppercase tracking-wider font-medium">
                          {s.label}
                        </span>
                      </div>
                      {isLoading ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        <>
                          <div className="text-3xl font-display font-bold text-foreground tracking-tight">
                            {s.value}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-body">
                            {s.sub}
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Status Banner */}
            {!usageLoading && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.32 }}
                  className={`surface-machined-soft flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${bannerInfo.bg}`}
                  data-ocid="usage.status.banner"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        usageStatus === "safe"
                          ? "bg-emerald-400"
                          : usageStatus === "warning"
                            ? "bg-amber-400"
                            : "bg-destructive"
                      }`}
                    />
                    <p className={`text-sm font-medium ${bannerInfo.text}`}>
                      {t(bannerInfo.key)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-5 sm:pl-0" data-ocid="usage.reset_time">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>
                      Daily quota resets in{" "}
                      <span className="font-semibold text-foreground">{resetCountdown}</span>{" "}
                      ({IST_RESET_TIME_LABEL})
                    </span>
                  </div>
                </motion.div>
              </>
            )}

            {/* Temporary quota adjustment history */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.36 }}
            >
              <Card className="bg-card border-border" data-ocid="usage.quota_history.section">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-primary" />
                    Temporary quota history
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Admin changes to your daily request limit. Your regular plan limit resumes after an adjustment expires.
                  </p>
                </CardHeader>
                <CardContent>
                  {quotaAdjustmentsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : quotaAdjustments.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      No temporary quota changes have been made to your account.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {quotaAdjustments.map((adjustment) => (
                        <div
                          key={adjustment.id}
                          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 rounded-lg border border-border/70 bg-muted/15 p-3"
                          data-ocid={`usage.quota_history.item.${adjustment.id}`}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {adjustment.previous_limit === -1 ? "Unlimited" : adjustment.previous_limit.toLocaleString()}
                              {" → "}
                              {adjustment.daily_limit === -1 ? "Unlimited" : adjustment.daily_limit.toLocaleString()}
                              {" requests/day"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Changed {format(parseISO(adjustment.created_at), "MMM d, yyyy")}
                              {" · "}Expires {format(parseISO(adjustment.expires_at), "MMM d, yyyy")}
                              {" · "}{adjustment.duration_days} days
                            </p>
                            {adjustment.reason && (
                              <p className="text-xs text-muted-foreground mt-1 break-words">
                                Reason: {adjustment.reason}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={adjustment.status === "active"
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 capitalize"
                              : "border-border text-muted-foreground capitalize"}
                          >
                            {adjustment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Period selector */}
            <div
              className="surface-machined-soft flex items-center gap-1 p-1 w-fit"
              data-ocid="usage.period.tabs"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setSelectedDays(opt.days)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-smooth ${
                    selectedDays === opt.days
                      ? "bg-card text-foreground shadow-sm rounded-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-ocid={`usage.period.${opt.days}d`}
                >
                  {t(opt.key)}
                </button>
              ))}
            </div>

            {/* Summary mini-stats */}
            {!usageLoading && days && days.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    icon: BarChart2,
                    label: t("usage.total_requests"),
                    value: totalReqs.toLocaleString(locale),
                    iconClass: "text-primary",
                  },
                  {
                    icon: TrendingUp,
                    label: t("usage.avg_per_day"),
                    value: avgPerDay.toLocaleString(locale),
                    iconClass: "text-accent",
                  },
                  {
                    icon: Zap,
                    label: t("usage.peak_day"),
                    value: peakDay ? peakDay.count.toLocaleString(locale) : "0",
                    iconClass: "text-amber-400",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="surface-machined-soft flex items-center gap-3 px-4 py-3"
                  >
                    <s.icon
                      className={`w-4 h-4 ${s.iconClass} flex-shrink-0`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {s.label}
                      </p>
                      <p className="text-base font-display font-bold text-foreground">
                        {s.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chart Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card
                className="bg-card border-border"
                data-ocid="usage.chart.section"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    {t("usage.chart_title")} —{" "}
                    {t("usage.last_days", { days: selectedDays })}
                  </CardTitle>
                  {historyFrom && (
                    <p className="text-xs text-muted-foreground">
                      {t("usage.history_from", { date: historyFrom })}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {usageLoading ? (
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                  ) : usageError ? (
                    <div
                      className="py-12 text-center"
                      data-ocid="usage.chart.error_state"
                      role="alert"
                    >
                      <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {usageQueryError instanceof Error
                          ? usageQueryError.message
                          : t("usage.failed_load")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void refetchUsage()}
                        className="mt-3"
                      >
                        Retry
                      </Button>
                    </div>
                  ) : !days || days.length === 0 ? (
                    <div
                      className="py-12 text-center"
                      data-ocid="usage.chart.empty_state"
                    >
                      <Activity className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("usage.no_data")}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {t("usage.no_data_desc")}
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={chartData}
                        margin={{ top: 16, right: 12, left: 4, bottom: 4 }}
                      >
                        <defs>
                          <linearGradient
                            id="usage-chart-gradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0.34}
                            />
                            <stop
                              offset="95%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0.015}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="4 7"
                          stroke="hsl(var(--border))"
                          strokeOpacity={0.5}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          interval={Math.max(0, Math.ceil(chartData.length / 7) - 1)}
                          minTickGap={16}
                          tickMargin={12}
                          tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 10,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          width={48}
                          tickFormatter={(value: number) =>
                            new Intl.NumberFormat(locale, {
                              notation: "compact",
                              maximumFractionDigits: 1,
                            }).format(value)
                          }
                          tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 10,
                          }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                          domain={[0, "auto"]}
                        />
                        <Tooltip
                          content={<CustomTooltip t={t} locale={locale} />}
                          cursor={{
                            stroke: "hsl(var(--primary))",
                            strokeDasharray: "4 4",
                            strokeOpacity: 0.25,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="url(#usage-chart-gradient)"
                          dot={
                            chartData.length <= 7
                              ? {
                                  r: 3,
                                  fill: "hsl(var(--background))",
                                  strokeWidth: 2,
                                }
                              : false
                          }
                          activeDot={{
                            r: 6,
                            fill: "hsl(var(--primary))",
                            stroke: "hsl(var(--background))",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {/* Per-day breakdown */}
                  {!usageLoading && days && days.length > 0 && (
                    <div className="mt-4 max-h-64 space-y-2 overflow-y-auto border-t border-border/50 pt-4 pr-2">
                      {days.map((day, idx) => {
                        const dot = day.status
                          ? STATUS_COLOR[day.status] ?? "var(--primary)"
                          : "var(--primary)";
                        return (
                          <div
                            key={day.date}
                            className="flex items-center gap-3 text-xs py-0.5"
                            data-ocid={`usage.day.item.${idx + 1}`}
                          >
                            <span className="text-muted-foreground font-mono w-16 flex-shrink-0">
                              {(() => {
                                try {
                                  return new Date(`${day.date}T12:00:00`).toLocaleDateString(locale, {
                                    month: "short",
                                    day: "numeric",
                                  });
                                } catch {
                                  return day.date;
                                }
                              })()}
                            </span>
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${dailyLimit > 0 ? Math.min(100, Math.round((day.count / dailyLimit) * 100)) : 0}%`,
                                  backgroundColor: dot,
                                }}
                              />
                            </div>
                            <span className="font-mono text-foreground w-14 text-right flex-shrink-0">
                              {day.count.toLocaleString(locale)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </PageTransition>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
