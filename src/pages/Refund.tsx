import { Layout } from "@/components/Layout";
import { Link } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { motion } from "motion/react";

const SECTIONS = [
  {
    id: "overview",
    title: "1. Refund Policy Overview",
    content: [
      "BabiesIQ offers a 7-day refund policy for paid plan purchases (Pro and Pro Plus).",
      "Business plan purchases are subject to custom terms agreed upon at the time of purchase.",
      "Refunds are processed back to the original payment method used during purchase.",
      "We do not offer refunds for the Free plan (as it is free).",
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: [
      "To be eligible for a refund, your refund request must be submitted within 7 days of the original payment date.",
      "You must not have exceeded 50% of your plan's daily API limit on more than 3 days during the refund period.",
      "Your account must be in good standing (not suspended or banned for policy violations).",
      "Refunds are available only for the first purchase of a plan — repeat purchases of the same plan within 60 days are not eligible.",
    ],
  },
  {
    id: "conditions",
    title: "3. Non-Refundable Conditions",
    content: [
      "Refunds will not be issued if the account was suspended or terminated due to policy violations.",
      "Refunds will not be issued after 7 days from the purchase date, regardless of usage.",
      "Partial refunds for unused months in multi-month plans are not available (e.g., buying 12 months and requesting a refund after 3 months is not eligible after the 7-day window).",
      "Processing fees charged by Razorpay (typically 2-3%) are non-refundable.",
    ],
  },
  {
    id: "how-to-request",
    title: "4. How to Request a Refund",
    content: [
      "Step 1: Email support@babiesiq.com with the subject 'Refund Request'.",
      "Step 2: Include your registered email address and invoice number (found in Panel → Invoices).",
      "Step 3: Briefly describe the reason for your refund request.",
      "Step 4: Our team will review your request within 2 business days.",
      "Step 5: If approved, refund initiation will be confirmed via email.",
    ],
  },
  {
    id: "processing",
    title: "5. Processing Time",
    content: [
      "Refund requests are reviewed within 2 business days of submission.",
      "Approved refunds are initiated within 5 business days.",
      "Credit to your bank account or card may take an additional 5-10 business days depending on your bank or card issuer.",
      "Razorpay processing fees (if any) are deducted from the refund amount.",
      "You will receive a confirmation email once the refund has been initiated.",
    ],
  },
  {
    id: "plan-downgrade",
    title: "6. Plan Downgrade",
    content: [
      "If you do not wish to request a refund but want to stop using a paid plan, you can let your subscription expire naturally.",
      "Your plan will not auto-renew — each purchase is a one-time transaction for the selected duration.",
      "After expiry, your account automatically downgrades to the Free plan (500 req/day).",
      "Your data, API key history, and invoices are retained on the Free plan.",
    ],
  },
  {
    id: "contact",
    title: "7. Contact for Refunds",
    content: [
      "Email: support@babiesiq.com",
      "Subject: Refund Request",
      "Include: Your account email and invoice number",
      "Response time: Within 2 business days",
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
      data-ocid={`refund.${id}.section`}
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

export function RefundPage() {
  return (
    <Layout>
      <motion.div
        className="bg-background min-h-screen"
        data-ocid="refund.page"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        <div className="bg-card border-b border-border px-4 py-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-mono text-primary uppercase tracking-widest">
                Legal
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
              Refund Policy
            </h1>
            <p className="text-sm text-muted-foreground font-body">
              Last updated: January 2025 · 7-day refund window
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
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20 mb-8">
              <RefreshCw className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground font-body leading-relaxed">
                <strong className="font-display font-semibold">
                  7-Day Refund Window:
                </strong>{" "}
                If you are not satisfied with your purchase, contact us within 7
                days of payment for a full refund (subject to conditions below).
              </p>
            </div>
            {SECTIONS.map((s) => (
              <PolicySection key={s.id} {...s} />
            ))}
            <p className="text-xs text-muted-foreground font-body mt-8 pt-6 border-t border-border">
              For refund requests, email support@babiesiq.com or visit our{" "}
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
