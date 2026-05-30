import { AdminLayout } from "@/components/AdminLayout";
import { listAdminUsers } from "@/lib/admin-api";
import { ROLE_COLORS, ROLE_LABELS, STATUS_COLORS, type AdminUserRow } from "@/types/admin";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, RefreshCw, Search, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", search, role, status, page],
    queryFn: () => listAdminUsers({ search, role, status, page, limit: 20 }),
  });

  const users: AdminUserRow[] = data?.data?.users ?? [];
  const total = data?.data?.total ?? 0;
  const pages = data?.data?.pages ?? 1;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{total} total users</p>
          </div>
          <button onClick={() => refetch()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by email or name..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none">
            <option value="">All Roles</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="pro_plus">Pro Plus</option>
            <option value="business">Business</option>
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="restricted">Restricted</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Usage Today</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-muted/40 animate-pulse" /></td>
                    ))}
                  </tr>
                ))}
                {!isLoading && users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {u.first_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", ROLE_COLORS[u.role])}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium capitalize", STATUS_COLORS[u.status])}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.daily_usage}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
                {!isLoading && users.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">Page {page} of {pages}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
