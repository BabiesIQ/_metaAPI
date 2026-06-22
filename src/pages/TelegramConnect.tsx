import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, XCircle, Loader2, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/hooks/useAuth";
import { checkTelegramToken, linkTelegramAuth } from "@/lib/api";

type Stage = "loading" | "success" | "error" | "expired";

export function TelegramConnectPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, initialize } = useAuth();
  const [stage, setStage] = useState<Stage>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [botUrl, setBotUrl] = useState("https://t.me/BabyAPIBot");
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (authLoading) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setErrorMsg("No authentication token found in the URL.");
      setStage("error");
      return;
    }

    if (!user) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate({ to: `/login?redirect=${returnUrl}` });
      return;
    }

    const doConnect = async () => {
      const check = await checkTelegramToken(token);
      if (check.data?.status !== "ok") {
        setErrorMsg("This link has expired or is invalid. Please generate a new one from the bot.");
        setStage("expired");
        return;
      }

      const link = await linkTelegramAuth(token);
      if (link.data?.status === "connected") {
        if (link.data.bot_url) setBotUrl(link.data.bot_url);
        setStage("success");
      } else {
        setErrorMsg("Failed to connect your account. Please try again.");
        setStage("error");
      }
    };

    doConnect().catch(() => {
      setErrorMsg("Something went wrong. Please try again.");
      setStage("error");
    });
  }, [authLoading, user, navigate, initialize]);

  useEffect(() => {
    if (stage !== "success") return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          window.location.href = botUrl;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, botUrl]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {stage === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4 text-center max-w-sm"
          >
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-elevated">
              <Send className="w-8 h-8 text-white" />
            </div>
            <Loader2 className="w-6 h-6 text-primary animate-spin mt-2" />
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground">Connecting Telegram</h2>
              <p className="text-sm text-muted-foreground mt-1">Verifying your account…</p>
            </div>
          </motion.div>
        )}

        {stage === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="flex flex-col items-center gap-6 text-center max-w-sm w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </motion.div>

            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Account Connected!</h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Your Telegram account is now linked to <span className="text-foreground font-medium">BabyAPI</span>.
                You can use all bot commands like <code className="text-xs bg-muted px-1 py-0.5 rounded">/key</code>,{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">/status</code>, and more.
              </p>
            </div>

            <div className="w-full rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Telegram successfully linked
              </div>
              <div className="h-px bg-border" />
              <p className="text-xs text-muted-foreground">
                Returning to bot in <span className="font-semibold text-foreground">{countdown}s</span>…
              </p>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 4, ease: "linear" }}
                />
              </div>
            </div>

            <a
              href={botUrl}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-elevated"
            >
              <Send className="w-4 h-4" />
              Open Telegram Bot Now
            </a>
          </motion.div>
        )}

        {(stage === "error" || stage === "expired") && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="flex flex-col items-center gap-6 text-center max-w-sm w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center"
            >
              <XCircle className="w-10 h-10 text-destructive" />
            </motion.div>

            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {stage === "expired" ? "Link Expired" : "Connection Failed"}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{errorMsg}</p>
            </div>

            <div className="w-full rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                To get a new link, open the Telegram bot and tap{" "}
                <span className="font-medium text-foreground">◈ Automated Login</span> after using{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">/login</code>.
              </p>
            </div>

            <a
              href={botUrl}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-medium text-sm hover:border-primary/40 transition-colors"
            >
              <Send className="w-4 h-4" />
              Open Telegram Bot
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
