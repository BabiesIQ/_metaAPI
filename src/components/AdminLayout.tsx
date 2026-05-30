import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  ChevronRight,
  Headphones,
  Key,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  perm?: string;
  ownerOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",    path: "/admin/dashboard",  icon: BarChart2  },
  { label: "Users",        path: "/admin/users",      icon: Users,     perm: "view_users"   },
  { label: "Support",      path: "/admin/support",    icon: Headphones, perm: "view_support" },
  { label: "Manage Admins",path: "/admin/admins",     icon: Shield,    ownerOnly: true      },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, logout } = useAdminAuth();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const canSee = (item: NavItem) => {
    if (!admin) return false;
    if (item.ownerOnly && !admin.is_owner) return false;
    if (item.perm && !admin.is_owner && !admin.permissions.includes(item.perm)) return false;
    return true;
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <Shield className="w-5 h-5 text-primary" />
            <span>Admin Panel</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.filter(canSee).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Admin info */}
        <div className="border-t border-border p-4 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {admin?.name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{admin?.name ?? "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{admin?.email}</p>
            </div>
            {admin?.is_owner && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Owner
              </span>
            )}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border flex items-center gap-4 px-4 lg:px-6 shrink-0 bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-sm text-muted-foreground">
              BabiesIQ Admin
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>{admin?.is_owner ? "Owner" : "Admin"}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
