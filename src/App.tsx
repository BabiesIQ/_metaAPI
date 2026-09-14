import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";
import { AnnouncementBar } from "@/components/AnnouncementBar";

import { CookieConsent } from "@/components/CookieConsent";
import { AdminProtectedRoute } from "@/pages/admin/AdminProtectedRoute";

import { AnimatePresence } from "motion/react";
import { applyDocumentDir } from "./lib/i18n";

// Keep the initial public bundle small. Auth, panel, admin, and documentation
// pages are only downloaded when a user navigates to them.
const ContactPage = lazy(() =>
  import("@/pages/Contact").then(({ ContactPage }) => ({ default: ContactPage })),
);
const DocsPage = lazy(() =>
  import("@/pages/Docs").then(({ DocsPage }) => ({ default: DocsPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("@/pages/ForgotPassword").then(({ ForgotPasswordPage }) => ({
    default: ForgotPasswordPage,
  })),
);
const HomePage = lazy(() =>
  import("@/pages/Home").then(({ HomePage }) => ({ default: HomePage })),
);
const LoginPage = lazy(() =>
  import("@/pages/Login").then(({ LoginPage }) => ({ default: LoginPage })),
);
const PricingPage = lazy(() =>
  import("@/pages/Pricing").then(({ PricingPage }) => ({ default: PricingPage })),
);
const PrivacyPage = lazy(() =>
  import("@/pages/Privacy").then(({ PrivacyPage }) => ({ default: PrivacyPage })),
);
const RefundPage = lazy(() =>
  import("@/pages/Refund").then(({ RefundPage }) => ({ default: RefundPage })),
);
const ResetPasswordPage = lazy(() =>
  import("@/pages/ResetPassword").then(({ ResetPasswordPage }) => ({
    default: ResetPasswordPage,
  })),
);
const SignupPage = lazy(() =>
  import("@/pages/Signup").then(({ SignupPage }) => ({ default: SignupPage })),
);
const TermsPage = lazy(() =>
  import("@/pages/Terms").then(({ TermsPage }) => ({ default: TermsPage })),
);
const BannedPage = lazy(() =>
  import("@/pages/BannedPage").then(({ BannedPage }) => ({ default: BannedPage })),
);
const CreatePasswordPage = lazy(() =>
  import("@/pages/auth/CreatePassword").then(({ CreatePasswordPage }) => ({
    default: CreatePasswordPage,
  })),
);
const OAuthCallbackPage = lazy(() =>
  import("@/pages/auth/OAuthCallback").then(({ OAuthCallbackPage }) => ({
    default: OAuthCallbackPage,
  })),
);
const PasswordSuccessPage = lazy(() =>
  import("@/pages/auth/PasswordSuccess").then(({ PasswordSuccessPage }) => ({
    default: PasswordSuccessPage,
  })),
);
const VerifyOtpPage = lazy(() =>
  import("@/pages/auth/VerifyOtp").then(({ VerifyOtpPage }) => ({
    default: VerifyOtpPage,
  })),
);
const TelegramConnectPage = lazy(() =>
  import("@/pages/TelegramConnect").then(({ TelegramConnectPage }) => ({
    default: TelegramConnectPage,
  })),
);
const ApiKeysPage = lazy(() =>
  import("@/pages/panel/ApiKeys").then(({ ApiKeysPage }) => ({ default: ApiKeysPage })),
);
const BillingPage = lazy(() =>
  import("@/pages/panel/Billing").then(({ default: BillingPage }) => ({
    default: BillingPage,
  })),
);
const DashboardPage = lazy(() =>
  import("@/pages/panel/Dashboard").then(({ DashboardPage }) => ({
    default: DashboardPage,
  })),
);
const InvoicesPage = lazy(() =>
  import("@/pages/panel/Invoices").then(({ InvoicesPage }) => ({
    default: InvoicesPage,
  })),
);
const NotificationsPage = lazy(() =>
  import("@/pages/panel/Notifications").then(({ NotificationsPage }) => ({
    default: NotificationsPage,
  })),
);
const ProfileSettingsPage = lazy(() =>
  import("@/pages/panel/ProfileSettings").then(({ ProfileSettingsPage }) => ({
    default: ProfileSettingsPage,
  })),
);
const UsagePage = lazy(() =>
  import("@/pages/panel/Usage").then(({ UsagePage }) => ({ default: UsagePage })),
);
const AdminLoginPage = lazy(() =>
  import("@/pages/admin/AdminLogin").then(({ AdminLoginPage }) => ({
    default: AdminLoginPage,
  })),
);
const AdminDashboardPage = lazy(() =>
  import("@/pages/admin/AdminDashboard").then(({ AdminDashboardPage }) => ({
    default: AdminDashboardPage,
  })),
);
const AdminUsersPage = lazy(() =>
  import("@/pages/admin/AdminUsers").then(({ AdminUsersPage }) => ({
    default: AdminUsersPage,
  })),
);
const AdminUserDetailPage = lazy(() =>
  import("@/pages/admin/AdminUserDetail").then(({ AdminUserDetailPage }) => ({
    default: AdminUserDetailPage,
  })),
);
const AdminSupportPage = lazy(() =>
  import("@/pages/admin/AdminSupport").then(({ AdminSupportPage }) => ({
    default: AdminSupportPage,
  })),
);
const AdminSupportDetailPage = lazy(() =>
  import("@/pages/admin/AdminSupportDetail").then(({ AdminSupportDetailPage }) => ({
    default: AdminSupportDetailPage,
  })),
);
const AdminManageAdminsPage = lazy(() =>
  import("@/pages/admin/AdminManageAdmins").then(({ AdminManageAdminsPage }) => ({
    default: AdminManageAdminsPage,
  })),
);
const AdminAnnouncementsPage = lazy(() =>
  import("@/pages/admin/AdminAnnouncements").then(({ AdminAnnouncementsPage }) => ({
    default: AdminAnnouncementsPage,
  })),
);
const AdminTrustedDomainsPage = lazy(() =>
  import("@/pages/admin/AdminTrustedDomains").then(({ AdminTrustedDomainsPage }) => ({
    default: AdminTrustedDomainsPage,
  })),
);

function RouteLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading page…</p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm uppercase tracking-[0.25em] text-primary">404</p>
      <h1 className="text-3xl font-display font-bold text-foreground">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        This page does not exist or may have moved.
      </p>
      <a className="text-primary hover:underline" href="/">
        Return home
      </a>
    </main>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

function RootComponent() {
  const { initialize } = useAuth();

  useEffect(() => {
    initialize();
    applyDocumentDir(localStorage.getItem("babiesiq-lang") || "en");
  }, [initialize]);

  return (
    <>
      <AnnouncementBar />
      <AnimatePresence mode="wait">
        <Suspense fallback={<RouteLoading />}>
          <Outlet />
        </Suspense>
      </AnimatePresence>
      <Toaster position="top-right" richColors />
      <CookieConsent />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});

// ── Public routes ─────────────────────────────────────────────────────────────
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomePage });
const pricingRoute = createRoute({ getParentRoute: () => rootRoute, path: "/pricing", component: PricingPage });
const docsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/docs", component: DocsPage });
const contactRoute = createRoute({ getParentRoute: () => rootRoute, path: "/contact", component: ContactPage });
const privacyRoute = createRoute({ getParentRoute: () => rootRoute, path: "/privacy", component: PrivacyPage });
const termsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/terms", component: TermsPage });
const refundRoute = createRoute({ getParentRoute: () => rootRoute, path: "/refund", component: RefundPage });

// ── Auth routes ───────────────────────────────────────────────────────────────
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginPage });
// Keep /login working for existing links while exposing the clearer sign-in URL.
const signinRoute = createRoute({ getParentRoute: () => rootRoute, path: "/signin", component: LoginPage });
const bannedRoute = createRoute({ getParentRoute: () => rootRoute, path: "/banned", component: BannedPage });
const signupRoute = createRoute({ getParentRoute: () => rootRoute, path: "/signup", component: SignupPage });
const forgotPasswordRoute = createRoute({ getParentRoute: () => rootRoute, path: "/forgot-password", component: ForgotPasswordPage });
const resetPasswordRoute = createRoute({ getParentRoute: () => rootRoute, path: "/reset-password", component: ResetPasswordPage });
const verifyOtpRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/verify-otp", component: VerifyOtpPage });
const createPasswordRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/create-password", component: CreatePasswordPage });
const passwordSuccessRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/password-success", component: PasswordSuccessPage });
// Partner OAuth callback — exchanges ?t=TOKEN for a session cookie via proxy XHR
const oauthCallbackRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/callback", component: OAuthCallbackPage });

// ── Panel routes ──────────────────────────────────────────────────────────────
const panelDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: "/panel/dashboard", component: DashboardPage });
const panelApiKeysRoute = createRoute({ getParentRoute: () => rootRoute, path: "/panel/api-keys", component: ApiKeysPage });
const panelUsageRoute = createRoute({ getParentRoute: () => rootRoute, path: "/panel/usage", component: UsagePage });
const panelBillingRoute = createRoute({ getParentRoute: () => rootRoute, path: "/panel/billing", component: BillingPage });
const panelInvoicesRoute = createRoute({ getParentRoute: () => rootRoute, path: "/panel/invoices", component: InvoicesPage });
const panelNotificationsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/panel/notifications", component: NotificationsPage });
const panelProfileRoute = createRoute({ getParentRoute: () => rootRoute, path: "/panel/profile-settings", component: ProfileSettingsPage });
const telegramConnectRoute = createRoute({ getParentRoute: () => rootRoute, path: "/connect/telegram", component: TelegramConnectPage });

// ── Admin routes ──────────────────────────────────────────────────────────────
const adminLoginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin/login", component: AdminLoginPage });
const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute, path: "/admin/dashboard",
  component: () => <AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>,
});
const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute, path: "/admin/users",
  component: () => <AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>,
});
const adminUserDetailRoute = createRoute({
  getParentRoute: () => rootRoute, path: "/admin/users/$id",
  component: () => <AdminProtectedRoute><AdminUserDetailPage /></AdminProtectedRoute>,
});
const adminSupportRoute = createRoute({
  getParentRoute: () => rootRoute, path: "/admin/support",
  component: () => <AdminProtectedRoute><AdminSupportPage /></AdminProtectedRoute>,
});
const adminSupportDetailRoute = createRoute({
  getParentRoute: () => rootRoute, path: "/admin/support/$id",
  component: () => <AdminProtectedRoute><AdminSupportDetailPage /></AdminProtectedRoute>,
});
const adminManageAdminsRoute = createRoute({
  getParentRoute: () => rootRoute, path: "/admin/admins",
  component: () => <AdminProtectedRoute><AdminManageAdminsPage /></AdminProtectedRoute>,
});
const adminAnnouncementsRoute = createRoute({
  getParentRoute: () => rootRoute, path: "/admin/announcements",
  component: () => <AdminProtectedRoute><AdminAnnouncementsPage /></AdminProtectedRoute>,
});
const adminTrustedDomainsRoute = createRoute({
  getParentRoute: () => rootRoute, path: "/admin/domains",
  component: () => <AdminProtectedRoute><AdminTrustedDomainsPage /></AdminProtectedRoute>,
});

// ── Router ────────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  pricingRoute,
  docsRoute,
  contactRoute,
  privacyRoute,
  termsRoute,
  refundRoute,
  loginRoute,
  signinRoute,
  signupRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  verifyOtpRoute,
  createPasswordRoute,
  oauthCallbackRoute,
  bannedRoute,
  passwordSuccessRoute,
  panelDashboardRoute,
  panelApiKeysRoute,
  panelUsageRoute,
  panelBillingRoute,
  panelInvoicesRoute,
  panelNotificationsRoute,
  panelProfileRoute,
  telegramConnectRoute,
  adminLoginRoute,
  adminDashboardRoute,
  adminUsersRoute,
  adminUserDetailRoute,
  adminSupportRoute,
  adminSupportDetailRoute,
  adminManageAdminsRoute,
  adminAnnouncementsRoute,
  adminTrustedDomainsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const GITHUB_URL = "https://github.com/BabiesIQ/web";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      {/* GitHub link */}
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View source on GitHub"
        className="fixed bottom-5 right-5 z-[9999] flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
        style={{ background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)" }}
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </a>
    </>
  );
}
