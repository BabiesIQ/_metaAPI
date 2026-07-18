import { motion } from "motion/react";
import { LogOut, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { logout as apiLogout } from "@/lib/api";

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName || lastName) {
    return `${(firstName?.[0] ?? "").toUpperCase()}${(lastName?.[0] ?? "").toUpperCase()}`;
  }
  return (email?.[0] ?? "?").toUpperCase();
}

export function BannedPage() {
  const { bannedUser, setBannedUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // best effort
    }
    setBannedUser(null);
    window.location.href = "/login";
  };

  const displayName =
    bannedUser?.first_name || bannedUser?.last_name
      ? `${bannedUser.first_name ?? ""} ${bannedUser.last_name ?? ""}`.trim()
      : bannedUser?.email ?? "User";

  const initials = getInitials(
    bannedUser?.first_name,
    bannedUser?.last_name,
    bannedUser?.email,
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar with user info and logout */}
      <header className="w-full border-b border-border/50 bg-card/60 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {bannedUser?.avatar ? (
            <img
              src={bannedUser.avatar}
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary select-none">
              {initials}
            </div>
          )}
          <div className="leading-none">
            <p className="text-sm font-semibold text-foreground">{displayName}</p>
            {bannedUser?.email && (
              <p className="text-xs text-muted-foreground mt-0.5">{bannedUser.email}</p>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </header>

      {/* Banned content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          className="max-w-md w-full text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive/20 flex items-center justify-center"
          >
            <ShieldX className="w-9 h-9 text-destructive" strokeWidth={1.5} />
          </motion.div>

          {/* Heading */}
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Account Banned
          </h1>

          {/* Message */}
          <p className="text-muted-foreground text-sm leading-relaxed mb-2">
            Your account has been banned due to a violation of our community
            rules.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Please review our{" "}
            <a
              href="/terms"
              className="text-primary underline underline-offset-2 hover:text-primary/70 transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/contact"
              className="text-primary underline underline-offset-2 hover:text-primary/70 transition-colors"
            >
              contact support
            </a>{" "}
            if you believe this is a mistake.
          </p>

          {/* Rule reminder card */}
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 mb-8 text-left">
            <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">
              Why accounts get banned
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Abusing or sharing API keys</li>
              <li>Automated scraping beyond plan limits</li>
              <li>Violating content or usage policies</li>
              <li>Fraudulent payment or chargebacks</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => (window.location.href = "/contact")}
            >
              Contact Support
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
