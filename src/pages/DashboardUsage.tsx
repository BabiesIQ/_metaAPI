import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsage } from "@/lib/api";
import type { UsageDay, UsageStatus } from "@/types/index";
import { useQuery } from "@tanstack/react-query";
import { Activity, BarChart2, Zap } from "lucide-react";

const STATUS_BADGE: Record<UsageStatus, string> = {
  safe: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  restricted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  banned: "bg-destructive/10 text-destructive border-destructive/20",
};

function UsageBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-8 text-right">
        {pct}%
      </span>
    </div>
  );
}

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
            <Skeleton className="h-3 w-24" />
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

function DashboardUsageContent() {
  const { data, isLoading } = useQuery<UsageDay[]>({
    queryKey: ["usage", 30],
    queryFn: async () => {
      const res = await getUsage(30);
      return res.success ? res.data : [];
    },
  });

  const sortedDays = [...(data ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  const totalRequests = sortedDays.reduce((sum, d) => sum + d.count, 0);
  const maxCount = sortedDays.reduce((max, d) => Math.max(max, d.count), 0);
  const todayEntry = sortedDays[0];

  return (
    <div className="space-y-6" data-ocid="usage.page">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Usage Analytics
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Daily API usage breakdown — last 30 days
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Activity}
          label="Today's Calls"
          value={(todayEntry?.count ?? 0).toLocaleString()}
          sub="API calls today"
          isLoading={isLoading}
        />
        <StatCard
          icon={BarChart2}
          label="Total (30 days)"
          value={totalRequests.toLocaleString()}
          sub="Last 30 days"
          isLoading={isLoading}
        />
        <StatCard
          icon={Zap}
          label="Active Days"
          value={sortedDays.filter((d) => d.count > 0).length}
          sub="Days with activity"
          isLoading={isLoading}
        />
      </div>

      <Card className="bg-card border-border" data-ocid="usage.daily.card">
        <CardHeader>
          <CardTitle className="text-base font-display">
            Daily Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="usage.loading_state">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : sortedDays.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="font-body text-muted-foreground w-36">
                      Date
                    </TableHead>
                    <TableHead className="font-body text-muted-foreground text-right w-28">
                      Requests
                    </TableHead>
                    <TableHead className="font-body text-muted-foreground w-24">
                      Status
                    </TableHead>
                    <TableHead className="font-body text-muted-foreground">
                      Distribution
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDays.map((day, i) => (
                    <TableRow
                      key={day.date}
                      className="border-border hover:bg-muted/30 transition-colors"
                      data-ocid={`usage.daily.item.${i + 1}`}
                    >
                      <TableCell className="font-mono text-sm text-foreground">
                        {day.date}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-foreground text-right font-semibold">
                        {day.count.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${STATUS_BADGE[day.status]}`}
                        >
                          {day.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <UsageBar value={day.count} max={maxCount} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div
              className="text-center py-12"
              data-ocid="usage.daily.empty_state"
            >
              <BarChart2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-body text-muted-foreground">
                No usage data yet. Start making API calls to see analytics here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardUsagePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardUsageContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
