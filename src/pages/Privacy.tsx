import { Layout } from "@/components/Layout";
import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { motion } from "motion/react";

const SECTIONS = [
  {
    id: "data-collection",
    title: "1. Data We Collect",
    content: [
      "When you register and use BabiesIQ, we collect:",
      "Account Information: Email address, hashed password, and display name provided during signup.",
      "Profile Data: Optional fields including first name, last name, and country.",
      "Usage Data: API call counts per day and associated status for rate limit enforcement.",
      "Session Data: Session tokens, IP address, and user agent stored server-side, mapped to an httpOnly cookie.",
      "Payment Data: Invoice records including plan, duration, amount, currency, and status. Payments are processed by Razorpay — we never store raw card numbers.",
      "API Keys: Prefix visible, full key shown only once. We do not store the raw key.",
    ],
  },
  {
    id: "data-usage",
    title: "2. How We Use Your Data",
    content: [
      "Service Delivery: To authenticate you, serve API requests, enforce plan-based rate limits, and provide the dashboard.",
      "Billing: To process payments via Razorpay, generate invoices, and manage subscription queues.",
      "Security: To detect abuse, enforce rate limits, and protect our infrastructure.",
      "Communications: To send OTP verification codes and important service notices via email.",
      "We do not sell, rent, or trade your personal information to third parties.",
    ],
  },
  {
    id: "cookies",
    title: "3. Cookies",
    content: [
      "BABYAPI_SESSION: An httpOnly, Secure, SameSite=Lax cookie used to maintain your authenticated session for 7 days. This is essential for the service.",
      "Theme Preference: A localStorage value (not a cookie) to remember your dark/light mode setting.",
      "We do not use advertising, tracking, or analytics cookies. You can clear the session cookie by logging out.",
    ],
  },
  {
    id: "third-party",
    title: "4. Third-Party Services",
    content: [
      "Razorpay: Payment processing for paid plan subscriptions. Payment data is handled under Razorpay's Privacy Policy.",
      "Google OAuth: If you sign in with Google, your Google profile email is used to create your account. We do not access other Google services.",
      "Brevo: Transactional email delivery for OTP codes and account notifications.",
      "YouTube: Our backend fetches content metadata from YouTube to serve API requests.",
    ],
  },
  {
    id: "security",
    title: "5. Data Security",
    content: [
      "Passwords are hashed using bcrypt — we never store plaintext passwords.",
      "All data is transmitted over HTTPS (TLS).",
      "Session tokens are cryptographically random and expire after 7 days.",
      "Database access is restricted to server-side application code only.",
      "No method of transmission or storage is 100% secure. Contact us immediately if you believe your account is compromised.",
    ],
  },
  {
    id: "retention",
    title: "6. Data Retention",
    content: [
      "Profile and authentication data: deleted within 30 days of account deletion request.",
      "Usage logs: retained in anonymized form for up to 90 days.",
      "Invoice records: retained for 7 years as required by Indian financial regulations.",
      "Session data: immediately invalidated upon logout or account deletion.",
    ],
  },
  {
    id: "contact",
    title: "7. Contact & Your Rights",
    content: [
      "For privacy questions, data access, correction, or deletion requests: support@babiesiq.com",
      "You have the right to request a copy of your data, correction of inaccurate data, and deletion of your data.",
      "We will respond to all legitimate requests within 30 days.",
    ],
  },
];

function PolicySection({
  id,
  title,
  content,
}: { id: string; title: string; content: string[] }) {
  return (
    <section
      id={id}
      className="mb-10 scroll-mt-24"
      data-ocid={`privacy.${id}.section`}
    >
      <h2 className="font-display font-bold text-lg text-foreground mb-3">
        {title}
      </h2>
      <div className="h-px bg-border mb-4" />
      <ul className="space-y-2">
        {content.map((line) => (
          <li
            key={line.slice(0, 40)}
            className="flex items-start gap-2.5 text-sm text-muted-foreground font-body leading-relaxed"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-2 flex-shrink-0" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PrivacyPage() {
  return (
    <Layout>
      <motion.div
        className="bg-background min-h-screen"
        data-ocid="privacy.page"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        <div className="bg-card border-b border-border px-4 py-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-mono text-primary uppercase tracking-widest">
                Legal
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground font-body">
              Last updated: January 2025 · Effective date: January 2025
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10 flex gap-10">
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-24">
              <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Contents
              </p>
              <nav className="flex flex-col gap-0.5">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-xs font-body text-muted-foreground hover:text-primary transition-colors py-1 px-2 rounded hover:bg-primary/5 truncate"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground font-body leading-relaxed mb-8 p-4 rounded-lg bg-card border border-border">
              This Privacy Policy describes how BabiesIQ collects, uses, and
              protects information when you use our API service at{" "}
              <a
                href="https://babiesiq.com"
                className="text-primary hover:underline"
              >
                babiesiq.com
              </a>
              . By using BabiesIQ, you agree to the practices described in this
              policy.
            </p>
            {SECTIONS.map((s) => (
              <PolicySection key={s.id} {...s} />
            ))}
            <p className="text-xs text-muted-foreground font-body mt-8 pt-6 border-t border-border">
              This policy may be updated periodically. For questions, visit our{" "}
              <Link to="/contact" className="text-primary hover:underline">
                contact page
              </Link>
              .
            </p>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
