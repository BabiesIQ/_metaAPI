import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { getNotifications } from "@/lib/api";
import { BASE_URL } from "@/lib/api";
import type { Notification, PlanCode } from "@/types/index";
import { PLAN_LABELS } from "@/types/index";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileText,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ThemeSwitcher } from "./ThemeSwitcher";

// ── Nav link definitions ───────────────────────────────────────────────────────
const sidebarLinks = [
  {
    labelKey: "nav.dashboard",
    to: "/panel/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    labelKey: "dashboard.api_keys",
    label: "API Keys",
    to: "/panel/api-keys",
    icon: Key,
  },
  {
    labelKey: "dashboard.usage",
    label: "Usage",
    to: "/panel/usage",
    icon: BarChart2,
  },
  {
    labelKey: "dashboard.billing",
    label: "Billing",
    to: "/panel/billing",
    icon: CreditCard,
  },
  {
    labelKey: "dashboard.invoices",
    label: "Invoices",
    to: "/panel/invoices",
    icon: FileText,
  },
  {
    labelKey: "dashboard.notifications",
    label: "Notifications",
    to: "/panel/notifications",
    icon: Bell,
  },
  { labelKey: "nav.settings", to: "/panel/profile-settings", icon: User },
];

const PAGE_TITLE_KEYS: Record<string, string> = {
  "/panel/dashboard": "nav.dashboard",
  "/panel/api-keys": "dashboard.api_keys",
  "/panel/usage": "dashboard.usage",
  "/panel/billing": "dashboard.billing",
  "/panel/invoices": "dashboard.invoices",
  "/panel/notifications": "dashboard.notifications",
  "/panel/profile-settings": "nav.settings",
};

const PAGE_TITLE_FALLBACK: Record<string, string> = {
  "/panel/dashboard": "Dashboard",
  "/panel/api-keys": "API Keys",
  "/panel/usage": "Usage",
  "/panel/billing": "Billing",
  "/panel/invoices": "Invoices",
  "/panel/notifications": "Notifications",
  "/panel/profile-settings": "Profile Settings",
};

// ── Plan badge color ────────────────────────────────────────────────────────
const planBadgeClass: Record<string, string> = {
  free: "bg-muted text-muted-foreground border-border",
  pro: "bg-primary/15 text-primary border-primary/30",
  pro_plus: "bg-accent/15 text-accent border-accent/30",
  business: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

function getInitials(name: string, email: string): string {
  if (name?.trim()) {
    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email.slice(0, 2) ?? "??").toUpperCase();
}

// ── Sidebar content (shared between desktop + mobile drawer) ──────────────────
interface SidebarContentProps {
  currentPath: string;
  displayName: string;
  displayEmail: string;
  planCode: string;
  avatarUrl: string | null;
  collapsed?: boolean;
  onNavigate?: () => void;
  onLogout: () => void;
}

function SidebarContent({
  currentPath,
  displayName,
  displayEmail,
  planCode,
  avatarUrl,
  collapsed = false,
  onNavigate,
  onLogout,
}: SidebarContentProps) {
  const { t } = useTranslation();
  const initials = getInitials(displayName, displayEmail);
  const planLabel = PLAN_LABELS[planCode as PlanCode] ?? planCode;
  const badgeCls = planBadgeClass[planCode] ?? planBadgeClass.free;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`h-16 flex items-center border-b border-border shrink-0 ${
          collapsed ? "justify-center px-2" : "px-5"
        }`}
      >
        {collapsed ? (
          <Link
            to="/"
            className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center"
            onClick={onNavigate}
            aria-label="BabiesIQ Home"
          >
            <span className="text-xs font-bold text-white">B</span>
          </Link>
        ) : (
          <Link
            to="/"
            className="font-display font-bold text-xl tracking-tight flex items-center gap-0.5"
            onClick={onNavigate}
          >
            <span className="text-gradient">Babies</span>
            <span className="text-foreground">IQ</span>
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav
        className={`flex-1 overflow-y-auto ${
          collapsed ? "p-2 space-y-1" : "p-3 space-y-0.5"
        }`}
        data-ocid="dashboard.sidebar.nav"
      >
        {sidebarLinks.map(({ labelKey, label, to, icon: Icon, exact }) => {
          const isActive = exact
            ? currentPath === to
            : currentPath.startsWith(to);
          const displayLabel =
            t(labelKey) !== labelKey
              ? t(labelKey)
              : (label ?? labelKey.split(".").pop() ?? "");

          if (collapsed) {
            return (
              <Link
                key={to}
                to={to}
                onClick={onNavigate}
                title={displayLabel}
                className={`group flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                }`}
                data-ocid={`dashboard.sidebar.${to.split("/").pop()}.link`}
              >
                <Icon className="w-4 h-4 shrink-0" />
              </Link>
            );
          }

          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_16px_oklch(var(--primary)/0.08)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
              }`}
              data-ocid={`dashboard.sidebar.${to.split("/").pop()}.link`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                  isActive ? "text-primary" : "group-hover:text-foreground"
                }`}
              />
              <span className="flex-1 min-w-0 truncate">{displayLabel}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-0" />

      {/* User section */}
      {collapsed ? (
        <div className="p-2 shrink-0 flex flex-col items-center gap-2">
          <Avatar className="w-8 h-8">
            {avatarUrl && (
              <AvatarImage src={`${BASE_URL}/${avatarUrl}`} alt={displayName} />
            )}
            <AvatarFallback className="text-xs font-semibold gradient-primary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={onLogout}
            title={t("nav.logout")}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            data-ocid="dashboard.sidebar.logout.button"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-3 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/50 border border-border mb-2">
            <Avatar className="w-8 h-8 shrink-0">
              {avatarUrl && (
                <AvatarImage
                  src={`${BASE_URL}/${avatarUrl}`}
                  alt={displayName}
                />
              )}
              <AvatarFallback className="text-xs font-semibold gradient-primary text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {displayName}
              </p>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 h-4 font-medium border mt-0.5 ${
                  badgeCls
                }`}
              >
                {planLabel}
              </Badge>
            </div>
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Go to site"
            >
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 border border-transparent hover:border-destructive/20"
            data-ocid="dashboard.sidebar.logout.button"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{t("nav.logout")}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main layout ────────────────────────────────────────────────────────────────
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { data: notifData } = useQuery<
    ReturnType<typeof getNotifications> extends Promise<{ data: infer D }>
      ? D
      : never
  >({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await getNotifications();
      return res.data;
    },
    staleTime: 30_000,
  });

  const notifications = (notifData as Notification[] | null) ?? [];
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const displayEmail = user?.user?.email ?? "";
  const displayName = user?.user?.first_name
    ? `${user.user.first_name}${user.user.last_name ? ` ${user.user.last_name}` : ""}`
    : displayEmail.split("@")[0] || "Account";
  const planCode = user?.plan?.code ?? "free";
  const avatarUrl = user?.user?.avatar ?? null;
  const initials = getInitials(displayName, displayEmail);
  const planLabel = PLAN_LABELS[planCode as PlanCode] ?? planCode;
  const badgeCls = planBadgeClass[planCode] ?? planBadgeClass.free;

  const pageTitleKey = PAGE_TITLE_KEYS[currentPath];
  const pageTitle = pageTitleKey
    ? t(pageTitleKey) !== pageTitleKey
      ? t(pageTitleKey)
      : (PAGE_TITLE_FALLBACK[currentPath] ?? "Panel")
    : "Panel";

  const handleLogout = async () => {
    setSidebarOpen(false);
    await logout();
  };

  const sidebarWidth = collapsed ? "w-[64px]" : "w-[240px]";
  const contentMargin = collapsed ? "md:ml-[64px]" : "md:ml-[240px]";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* ── Desktop sidebar ───────────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col ${sidebarWidth} shrink-0 border-r border-border bg-card/80 backdrop-blur-xl fixed inset-y-0 left-0 z-30 transition-all duration-300`}
        data-ocid="dashboard.sidebar"
      >
        <SidebarContent
          currentPath={currentPath}
          displayName={displayName}
          displayEmail={displayEmail}
          planCode={planCode}
          avatarUrl={avatarUrl}
          collapsed={collapsed}
          onLogout={handleLogout}
        />
        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200 z-10"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          data-ocid="dashboard.sidebar_collapse.button"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* ── Mobile drawer ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
              data-ocid="dashboard.sidebar_backdrop"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-[240px] bg-card border-r border-border shadow-2xl md:hidden"
              data-ocid="dashboard.sidebar_mobile"
            >
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close sidebar"
                data-ocid="dashboard.sidebar_close.button"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent
                currentPath={currentPath}
                displayName={displayName}
                displayEmail={displayEmail}
                planCode={planCode}
                avatarUrl={avatarUrl}
                onNavigate={() => setSidebarOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Content area ─────────────────────────────────────────────────────── */}
      <div
        className={`flex flex-col flex-1 min-w-0 ${contentMargin} transition-all duration-300`}
      >
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 h-14 shrink-0 flex items-center gap-3 px-4 bg-card/80 backdrop-blur-xl border-b border-border"
          data-ocid="dashboard.topbar"
        >
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Open menu"
            data-ocid="dashboard.topbar.menu.button"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb / page title */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              BabiesIQ
            </span>
            <ChevronRight className="w-3 h-3 text-muted-foreground/50 hidden sm:inline" />
            <h1
              className="text-sm font-semibold text-foreground truncate"
              data-ocid="dashboard.topbar.title"
            >
              {pageTitle}
            </h1>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            <ThemeSwitcher />

            {/* Notification bell */}
            <Link
              to="/panel/notifications"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={`Notifications${
                unreadCount > 0 ? ` (${unreadCount} unread)` : ""
              }`}
              data-ocid="dashboard.topbar.notifications.link"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="ml-0.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center w-9 h-9"
                  aria-label="User menu"
                  data-ocid="dashboard.topbar.user_menu.button"
                >
                  <Avatar className="w-8 h-8 border-2 border-border hover:border-primary/40 transition-colors duration-200">
                    {avatarUrl && (
                      <AvatarImage
                        src={`${BASE_URL}/${avatarUrl}`}
                        alt={displayName}
                      />
                    )}
                    <AvatarFallback className="text-xs font-semibold gradient-primary text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56"
                data-ocid="dashboard.user_dropdown.popover"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-foreground truncate">
                        {displayName}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 h-4 font-medium border shrink-0 ${badgeCls}`}
                      >
                        {planLabel}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground font-normal truncate">
                      {displayEmail}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/panel/profile-settings"
                    className="flex items-center gap-2 cursor-pointer"
                    data-ocid="dashboard.user_dropdown.profile.link"
                  >
                    <Settings className="w-3.5 h-3.5 opacity-60" />
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2"
                  data-ocid="dashboard.user_dropdown.logout.button"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background"
          data-ocid="dashboard.main"
        >
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
