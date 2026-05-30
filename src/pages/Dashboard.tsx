import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { getApiKeys, getMe } from "@/lib/api";
import type { MeResponse, PlanCode } from "@/types/index";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Activity, ArrowUpRight, BarChart2, Key, User } from "lucide-react";
import { useTranslation } from "react-i18next";

const PLAN_BADGE: Record<PlanCode, string> = {
  free: "bg-muted text-muted-foreground border-0",
  pro: "bg-primary/15 text-primary border-0",
  pro_plus: "bg-accent/20 text-accent-foreground border-0",
  business: "bg-yellow-500/15 text-yellow-400 border-0",
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
  sub?: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-body text-muted-foreground font-normal">
          {label}
        </CardTitle>
        <Icon className="w-4 h-4 text-primary" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-20 mb-1" />
            <Skeleton className="h-3 w-28" />
          </>
        ) : (
          <>
            <div className="text-2xl font-display font-bold text-foreground">
              {value}
            </div>
            {sub && (
              <p className="text-xs text-muted-foreground mt-1 font-body">
                {sub}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const { user: authUser } = useAuth();
  const { t } = useTranslation();

  const { data: meData, isLoading: meLoading } = useQuery<MeResponse | null>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await getMe();
      return res.success ? res.data : null;
    },
    initialData: authUser ?? undefined,
  });

  const { data: keys, isLoading: keysLoading } = useQuery({
    queryKey: ["apiKeys"],
    queryFn: async () => {
      const res = await getApiKeys();
      return res.success ? res.data : [];
    },
  });

  const isLoading = meLoading || keysLoading;
  const plan = meData?.plan;
  const usage = meData?.usage;
  const user = meData?.user;
  const displayName = user?.first_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-8" data-ocid="dashboard.overview.page">
      {/* Welcome Card */}
      <Card
        className="bg-card border-border"
        data-ocid="dashboard.welcome.card"
      >
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-display font-semibold text-foreground">
                  {isLoading ? (
                    <Skeleton className="h-5 w-40 inline-block" />
                  ) : (
                    `${t("dashboard.welcome")}, ${displayName}!`
                  )}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 font-body">
                  {isLoading ? "" : user?.email}
                </p>
              </div>
            </div>
            <div data-ocid="dashboard.tier.badge">
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <Badge
                  className={`px-3 py-1 text-xs font-body font-medium rounded-full ${PLAN_BADGE[(plan?.code as PlanCode) ?? "free"]}`}
                >
                  {plan?.name ?? "Free"} Plan
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        data-ocid="dashboard.stats.section"
      >
        <StatCard
          icon={Activity}
          label={t("dashboard.api_requests")}
          value={usage?.today?.toLocaleString() ?? "0"}
          sub={t("dashboard.api_requests")}
          isLoading={isLoading}
        />
        <StatCard
          icon={BarChart2}
          label={t("dashboard.remaining")}
          value={usage?.remaining?.toLocaleString() ?? "\u2014"}
          sub={t("dashboard.remaining")}
          isLoading={isLoading}
        />
        <StatCard
          icon={Key}
          label={t("dashboard.api_keys")}
          value={keys?.filter((k) => k.status === "active").length ?? 0}
          sub={t("dashboard.api_keys")}
          isLoading={keysLoading}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="bg-card border-border hover:border-primary/30 transition-smooth"
          data-ocid="dashboard.apikeys.quicklink"
        >
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Key className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-sm text-foreground">
                {t("dashboard.api_keys")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-body">
                {t("dashboard.get_api_key_desc")}
              </p>
              <Link
                to="/panel/api-keys"
                className="flex items-center gap-1 text-xs text-primary mt-2 font-body font-medium hover:underline"
                data-ocid="dashboard.apikeys.quicklink.link"
              >
                {t("common.manage")} <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-card border-border hover:border-primary/30 transition-smooth"
          data-ocid="dashboard.usage.quicklink"
        >
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <BarChart2 className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-sm text-foreground">
                {t("dashboard.usage")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-body">
                {t("dashboard.view_docs_desc")}
              </p>
              <Link
                to="/panel/usage"
                className="flex items-center gap-1 text-xs text-primary mt-2 font-body font-medium hover:underline"
                data-ocid="dashboard.usage.quicklink.link"
              >
                {t("dashboard.view_all")} <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade prompt if on free plan */}
      {!isLoading && plan?.code === "free" && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-display font-semibold text-foreground">
                {t("dashboard.upgrade_pro")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("dashboard.upgrade_desc")}
              </p>
            </div>
            <Button
              asChild
              className="gradient-primary text-white border-0"
              size="sm"
              data-ocid="dashboard.upgrade.button"
            >
              <Link to="/panel/billing">{t("billing.upgrade_now")}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
