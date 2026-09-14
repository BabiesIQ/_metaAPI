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

import { AnimatePresence, motion } from "motion/react";
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
    <main className="relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6 py-16 text-center">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-20 top-1/3 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -right-24 bottom-1/4 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
        <span className="absolute left-[18%] top-1/4 h-2 w-2 rounded-full bg-primary/50 animate-pulse" />
        <span className="absolute right-[20%] top-1/3 h-1.5 w-1.5 rounded-full bg-accent/60 animate-pulse [animation-delay:700ms]" />
        <span className="absolute bottom-1/4 left-[27%] h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:1200ms]" />
      </div>

      <div className="flex w-full max-w-2xl flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          404 · Path not found
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.08 }}
          className="relative mb-3 h-64 w-64 sm:h-72 sm:w-72"
          aria-label="A crying baby illustration"
          role="img"
        >
          <div className="absolute inset-5 rounded-full bg-primary/10 blur-2xl" />
          <motion.div
            animate={{ y: [0, -4, 0], rotate: [0, -1.5, 1.5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-full w-full"
          >
            <svg
              viewBox="0 0 280 280"
              className="h-full w-full overflow-visible drop-shadow-[0_22px_24px_rgba(0,0,0,0.35)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="baby-skin" x1="82" y1="52" x2="204" y2="222" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFE1C2" />
                  <stop offset="1" stopColor="#F6B989" />
                </linearGradient>
                <linearGradient id="baby-onesie" x1="88" y1="180" x2="195" y2="267" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#5E9BFF" />
                  <stop offset="1" stopColor="#7652E8" />
                </linearGradient>
                <linearGradient id="baby-hair" x1="105" y1="38" x2="185" y2="93" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B2A55" />
                  <stop offset="1" stopColor="#171329" />
                </linearGradient>
                <filter id="baby-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" />
                </filter>
              </defs>

              <ellipse cx="140" cy="258" rx="76" ry="10" fill="black" fillOpacity="0.24" />

              <path
                d="M85 264C87 214 103 190 140 190C177 190 193 214 195 264H85Z"
                fill="url(#baby-onesie)"
                stroke="#A9C7FF"
                strokeOpacity="0.28"
                strokeWidth="3"
              />
              <path d="M120 196L140 216L160 196" stroke="#DCE8FF" strokeOpacity="0.55" strokeWidth="3" />
              <circle cx="140" cy="231" r="4" fill="#DCE8FF" fillOpacity="0.75" />
              <circle cx="140" cy="249" r="4" fill="#DCE8FF" fillOpacity="0.75" />

              <path d="M94 208C75 214 67 231 73 244C77 252 88 248 94 237" fill="url(#baby-skin)" stroke="#D99065" strokeWidth="3" />
              <path d="M186 208C205 214 213 231 207 244C203 252 192 248 186 237" fill="url(#baby-skin)" stroke="#D99065" strokeWidth="3" />

              <circle cx="140" cy="124" r="77" fill="url(#baby-skin)" stroke="#D99065" strokeWidth="3" />
              <path d="M69 119C60 109 63 94 76 91C66 76 77 62 92 66C92 45 111 37 124 49C135 31 158 35 162 53C179 40 199 50 195 69C214 66 224 85 211 99C225 108 221 127 205 132C198 87 177 73 140 74C103 73 81 87 69 119Z" fill="url(#baby-hair)" />
              <path d="M92 82C106 65 123 59 140 59C158 59 177 66 188 81" stroke="#76568E" strokeOpacity="0.65" strokeWidth="4" strokeLinecap="round" />

              <ellipse cx="65" cy="126" rx="13" ry="20" fill="#F6B989" stroke="#D99065" strokeWidth="3" />
              <ellipse cx="215" cy="126" rx="13" ry="20" fill="#F6B989" stroke="#D99065" strokeWidth="3" />

              <path d="M99 113C106 106 115 106 122 112" stroke="#3B2A55" strokeWidth="5" strokeLinecap="round" />
              <path d="M158 112C165 106 174 106 181 113" stroke="#3B2A55" strokeWidth="5" strokeLinecap="round" />
              <motion.path
                d="M104 126C109 121 117 121 121 127"
                stroke="#27203C"
                strokeWidth="5"
                strokeLinecap="round"
                animate={{ d: ["M104 126C109 121 117 121 121 127", "M104 128C109 133 117 133 121 127", "M104 126C109 121 117 121 121 127"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.path
                d="M159 127C163 121 171 121 176 126"
                stroke="#27203C"
                strokeWidth="5"
                strokeLinecap="round"
                animate={{ d: ["M159 127C163 121 171 121 176 126", "M159 127C163 133 171 133 176 128", "M159 127C163 121 171 121 176 126"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.path
                d="M107 142C110 154 119 159 129 151"
                stroke="#78B7FF"
                strokeWidth="5"
                strokeLinecap="round"
                animate={{ opacity: [0.3, 1, 0.3], pathLength: [0.65, 1, 0.65] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.path
                d="M173 142C170 154 161 159 151 151"
                stroke="#78B7FF"
                strokeWidth="5"
                strokeLinecap="round"
                animate={{ opacity: [0.3, 1, 0.3], pathLength: [0.65, 1, 0.65] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
              />
              <motion.path
                d="M140 146C126 146 122 164 140 174C158 164 154 146 140 146Z"
                fill="#5B214B"
                stroke="#421A3A"
                strokeWidth="3"
                animate={{ scaleY: [1, 1.16, 1], originY: "50%" }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <ellipse cx="140" cy="165" rx="6" ry="3" fill="#F384A6" fillOpacity="0.7" />

              <motion.path
                d="M104 145C96 158 98 170 108 178"
                stroke="#6BB7FF"
                strokeWidth="4"
                strokeLinecap="round"
                animate={{ opacity: [0, 1, 0], y: [0, 12, 23] }}
                transition={{ duration: 1.7, repeat: Infinity, ease: "easeIn" }}
              />
              <motion.path
                d="M176 145C184 158 182 170 172 178"
                stroke="#6BB7FF"
                strokeWidth="4"
                strokeLinecap="round"
                animate={{ opacity: [0, 1, 0], y: [0, 12, 23] }}
                transition={{ duration: 1.7, repeat: Infinity, ease: "easeIn", delay: 0.45 }}
              />
              <circle cx="102" cy="189" r="3" fill="#78B7FF" filter="url(#baby-glow)" />
              <circle cx="178" cy="189" r="3" fill="#78B7FF" filter="url(#baby-glow)" />
            </svg>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.45 }}
          className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground"
        >
          A tiny navigation boo-boo
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.45 }}
          className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
        >
          Oops, baby found nothing!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          className="mt-4 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg"
        >
          The path you requested was not found. The little one is crying, but
          we can get you safely back to BabiesIQ.
        </motion.p>
        <motion.a
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.45 }}
          href="/"
          className="group mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Go to home
          <span
            aria-hidden="true"
            className="text-lg transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </motion.a>
      </div>
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
