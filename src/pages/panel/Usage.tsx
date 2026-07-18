import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMe, getUsage } from "@/lib/api";
import { countdownToReset, IST_RESET_TIME_LABEL } from "@/types/index";
import type { MeResponse, UsageDay } from "@/types/index";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  Activity,
  BarChart2,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_COLOR: Record<string, string> = {
  safe: "#22c55e",
  restricted: "#eab308",
  banned: "#ef4444",
};

const STATUS_BANNER: Record<string, { bg: string; text: string; key: string }> =
  {
    safe: {
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-400",
      key: "usage.status_safe",
    },
    restricted: {
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-400",
      key: "usage.status_restricted",
    },
    banned: {
      bg: "bg-destructive/10 border-destructive/20",
      text: "text-destructive",
      key: "usage.status_banned",
    },
  };

interface ChartEntry {
  label: string;
  count: number;
  status: string;
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
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  t: (key: string) => string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-xl px-4 py-3 shadow-elevated text-xs font-body">
      <p className="text-foreground font-semibold mb-1">{d.date}</p>
      <p className="text-muted-foreground">
        {d.count.toLocaleString()} {t("usage.requests")}
      </p>
      <p
        className="capitalize mt-1 font-medium"
        style={{ color: STATUS_COLOR[d.status] ?? "#94a3b8" }}
      >
        {d.status}
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
) => [
  {
    icon: BarChart2,
    label: t("usage.today"),
    value: today.toLocaleString(),
    sub: t("usage.api_calls_today"),
    iconClass: "bg-primary/10 text-primary",
    tint: "from-primary/5 to-transparent",
  },
  {
    icon: CheckCircle,
    label: t("usage.remaining"),
    value: remaining.toLocaleString(),
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
    value: lifetime.toLocaleString(),
    sub: t("usage.total_all_time"),
    iconClass: "bg-accent/10 text-accent",
    tint: "from-accent/5 to-transparent",
  },
  {
    icon: Zap,
    label: t("usage.daily_limit"),
    value:
      dailyLimit === -1 ? t("usage.unlimited") : dailyLimit.toLocaleString(),
    sub: t("usage.per_day"),
    iconClass: "bg-amber-500/10 text-amber-400",
    tint: "from-amber-500/5 to-transparent",
  },
];

export function UsagePage() {
  const { t } = useTranslation();
  const [selectedDays, setSelectedDays] = useState(7);
  const [resetCountdown, setResetCountdown] = useState(() => countdownToReset());

  useEffect(() => {
    const id = setInterval(() => setResetCountdown(countdownToReset()), 60_000);
    return () => clearInterval(id);
  }, []);


  const {
    data: me,
    isLoading: meLoading,
    refetch: refetchMe,
  } = useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await getMe();
      if (!res.success || !res.data) throw new Error(res.error ?? "Failed");
      return res.data;
    },
  });

  const {
    data: days,
    isLoading: usageLoading,
    refetch: refetchUsage,
    isError: usageError,
  } = useQuery<UsageDay[]>({
    queryKey: ["usage", selectedDays],
    queryFn: async () => {
      const res = await getUsage(selectedDays);
      return res.success && res.data ? res.data : [];
    },
  });

  const isLoading = meLoading || usageLoading;

  const dailyLimit = me?.plan?.daily_limit ?? 500;
  const today = me?.usage?.today ?? 0;
  const remaining = me?.usage?.remaining ?? 0;
  const lifetime = me?.usage?.lifetime ?? 0;

  const todayEntry = days?.find(
    (d) => d.date === new Date().toISOString().split("T")[0],
  );
  const usageStatus = todayEntry?.status ?? "safe";

  const chartData: ChartEntry[] = (days ?? []).map((d) => ({
    label: (() => {
      try {
        return format(parseISO(d.date), "EEE");
      } catch {
        return d.date;
      }
    })(),
    count: d.count,
    status: d.status,
    date: (() => {
      try {
        return format(parseISO(d.date), "MMM d");
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
    void refetchMe();
    void refetchUsage();
  };

  const bannerInfo = STATUS_BANNER[usageStatus] ?? STATUS_BANNER.safe;
  const stats = STAT_CARDS(today, remaining, lifetime, dailyLimit, t);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageTransition>
          <div className="space-y-6" data-ocid="usage.page">
            {/* Page header */}
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {t("usage.title")}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("usage.subtitle")}
                </p>
              </div>
              <div className="flex items-center gap-3">
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
                  <Card className="bg-card/50 backdrop-blur-sm border-border/60 hover:border-primary/25 hover:shadow-md transition-smooth overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${s.tint} pointer-events-none`}
                    />
                    <CardContent className="p-5 relative">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bannerInfo.bg}`}
                  data-ocid="usage.status.banner"
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      usageStatus === "safe"
                        ? "bg-emerald-400"
                        : usageStatus === "restricted"
                          ? "bg-amber-400"
                          : "bg-destructive"
                    }`}
                  />
                  <p className={`text-sm font-medium ${bannerInfo.text}`}>
                    {t(bannerInfo.key)}
                  </p>
                </motion.div>

                {/* Reset time chip */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1" data-ocid="usage.reset_time">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span>Daily quota resets in <span className="font-semibold text-foreground">{resetCountdown}</span> ({IST_RESET_TIME_LABEL})</span>
                </div>
              </>
            )}

            {/* Period selector */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border w-fit"
              data-ocid="usage.period.tabs"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setSelectedDays(opt.days)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-smooth ${
                    selectedDays === opt.days
                      ? "bg-card text-foreground shadow-sm"
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
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    icon: BarChart2,
                    label: t("usage.total_requests"),
                    value: totalReqs.toLocaleString(),
                    iconClass: "text-primary",
                  },
                  {
                    icon: TrendingUp,
                    label: t("usage.avg_per_day"),
                    value: avgPerDay.toLocaleString(),
                    iconClass: "text-accent",
                  },
                  {
                    icon: Zap,
                    label: t("usage.peak_day"),
                    value: peakDay ? peakDay.count.toLocaleString() : "0",
                    iconClass: "text-amber-400",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border/60 rounded-xl px-4 py-3"
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
                className="bg-card/50 backdrop-blur-sm border-border/60"
                data-ocid="usage.chart.section"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    {t("usage.chart_title")} —{" "}
                    {t("usage.last_days", { days: selectedDays })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {usageLoading ? (
                    <div className="h-64 flex items-end gap-2 px-2 pb-2">
                      {[40, 65, 50, 80, 55, 70, 45].map((h) => (
                        <Skeleton
                          key={`skel-bar-height-${h}`}
                          className="flex-1 rounded-t-md"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  ) : usageError ? (
                    <div
                      className="py-12 text-center"
                      data-ocid="usage.chart.error_state"
                    >
                      <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {t("usage.failed_load")}
                      </p>
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
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={chartData}
                        margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(148,163,184,0.07)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip t={t} />} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${entry.status}-${index}`}
                              fill={
                                STATUS_COLOR[entry.status] ?? "var(--primary)"
                              }
                              fillOpacity={0.85}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {/* Per-day breakdown */}
                  {!usageLoading && days && days.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-border/50 pt-4">
                      {days.map((day, idx) => {
                        const dot = STATUS_COLOR[day.status] ?? "#94a3b8";
                        return (
                          <div
                            key={day.date}
                            className="flex items-center gap-3 text-xs py-0.5"
                            data-ocid={`usage.day.item.${idx + 1}`}
                          >
                            <span className="text-muted-foreground font-mono w-16 flex-shrink-0">
                              {(() => {
                                try {
                                  return format(parseISO(day.date), "MMM d");
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
                              {day.count.toLocaleString()}
                            </span>
                            <span
                              className="capitalize w-20 flex-shrink-0"
                              style={{ color: dot }}
                            >
                              {day.status}
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
