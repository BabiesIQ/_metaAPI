import { AdminLayout } from "@/components/AdminLayout";
import { getAdminStats } from "@/lib/admin-api";
import type { AdminStats } from "@/types/admin";
import { useQuery } from "@tanstack/react-query";
import { Activity, Ban, BarChart2, Bell, Crown, HeadphonesIcon, TrendingUp, UserCheck, UserPlus, Users } from "lucide-react";
import { motion } from "motion/react";

function StatCard({ icon: Icon, label, value, color, delay = 0 }: {
  icon: React.ElementType; label: string; value: number | string; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

export function AdminDashboardPage() {
  const { data: statsRes, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getAdminStats(),
    refetchInterval: 30000,
  });
  const stats: AdminStats | undefined = statsRes?.data ?? undefined;

  const cards = stats ? [
    { icon: Users,         label: "Total Users",     value: stats.total_users,     color: "bg-primary/10 text-primary",           delay: 0.05 },
    { icon: UserCheck,     label: "Active Users",    value: stats.active_users,    color: "bg-emerald-500/10 text-emerald-400",   delay: 0.1 },
    { icon: Crown,         label: "Pro Users",       value: stats.pro_users,       color: "bg-amber-500/10 text-amber-400",       delay: 0.15 },
    { icon: UserPlus,      label: "Today Signups",   value: stats.today_signups,   color: "bg-blue-500/10 text-blue-400",         delay: 0.2 },
    { icon: Ban,           label: "Banned Users",    value: stats.banned_users,    color: "bg-red-500/10 text-red-400",           delay: 0.25 },
    { icon: Activity,      label: "Suspended",       value: stats.suspended_users, color: "bg-orange-500/10 text-orange-400",     delay: 0.3 },
    { icon: HeadphonesIcon,label: "Open Tickets",    value: stats.open_tickets,    color: "bg-purple-500/10 text-purple-400",     delay: 0.35 },
    { icon: BarChart2,     label: "Total Admins",    value: stats.total_admins,    color: "bg-cyan-500/10 text-cyan-400",         delay: 0.4 },
  ] : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of your platform</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => <StatCard key={c.label} {...c} />)}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "View All Users",      href: "/admin/users",   color: "bg-primary/10 hover:bg-primary/20 text-primary" },
              { label: "Open Tickets",        href: "/admin/support?status=open", color: "bg-red-500/10 hover:bg-red-500/20 text-red-400" },
              { label: "Manage Admins",       href: "/admin/admins",  color: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400" },
              { label: "Pro Users",           href: "/admin/users?role=pro", color: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className={`px-4 py-3 rounded-lg text-sm font-medium text-center transition-colors ${action.color}`}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
