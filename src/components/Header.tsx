import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Megaphone,
  ChevronDown,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n, { SUPPORTED_LANGUAGES, applyDocumentDir } from "../lib/i18n";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { UpdateChannel } from "./UpdateChannel";

const NAV_KEYS = [
  { key: "home", to: "/" },
  { key: "docs", to: "/docs" },
  { key: "pricing", to: "/pricing" },
  { key: "contact", to: "/contact" },
];

// ── Language Dropdown ─────────────────────────────────────────────────────────
function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLang = (i18n.language || "en").slice(0, 2);
  const currentLangData =
    SUPPORTED_LANGUAGES.find((l) => currentLang.startsWith(l.code)) ??
    SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-1.5 h-8 px-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/60 hover:text-white"
        aria-label="Change language"
        aria-expanded={open}
        data-ocid="header.lang_switcher.button"
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {currentLangData.flag}
        </span>
        <span className="hidden lg:inline text-xs font-medium">
          {currentLang.toUpperCase()}
        </span>
        <ChevronDown
          className={`h-3 w-3 opacity-50 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 backdrop-blur-xl bg-black/70 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
            data-ocid="header.lang_dropdown.popover"
          >
            <div className="p-1.5 max-h-72 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isActive = (i18n.language || "en").startsWith(lang.code);
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      applyDocumentDir(lang.code);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left ${
                      isActive
                        ? "bg-purple-500/20 text-purple-300 font-semibold"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                    data-ocid={`header.lang.${lang.code}.button`}
                  >
                    <span className="text-base leading-none w-5 shrink-0">
                      {lang.flag}
                    </span>
                    <span className="flex-1 truncate">{lang.nativeName}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [channelOpen, setChannelOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();

  const displayName =
    user?.user?.first_name || user?.user?.email?.split("@")[0] || "Account";
  const avatarUrl = user?.user?.avatar ?? null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/50 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
          : "border-b border-white/5 bg-white/5 backdrop-blur-md"
      }`}
      data-ocid="header"
    >
      {/* Scroll progress bar */}
      <div className="scroll-progress" id="scroll-progress" />

      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        {/* ── Logo & brand ─────────────────────────────────────────────── */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 group"
          data-ocid="header.logo.link"
        >
          {/* Music waveform icon in gradient circle */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, #a855f7 0%, #ec4899 60%, #3b82f6 100%)",
              boxShadow:
                "0 0 18px rgba(168,85,247,0.55), 0 0 6px rgba(168,85,247,0.3)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
              aria-hidden="true"
            >
              <rect
                x="0"
                y="6"
                width="2"
                height="2"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="3"
                y="4"
                width="2"
                height="6"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="6"
                y="1"
                width="2"
                height="12"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="9"
                y="4"
                width="2"
                height="6"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="12"
                y="6"
                width="2"
                height="2"
                rx="1"
                fill="currentColor"
              />
            </svg>
          </div>

          {/* Brand name + live dot */}
          <div className="flex items-center gap-1.5">
            <span
              className="font-display font-bold text-xl bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #c084fc 0%, #f472b6 50%, #60a5fa 100%)",
              }}
            >
              BabiesIQ
            </span>
            <span className="live-indicator" aria-hidden="true" />
          </div>
        </Link>

        {/* ── Desktop nav ──────────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1 mx-8">
          {NAV_KEYS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative px-3.5 py-1.5 text-sm font-medium text-white/65 hover:text-white transition-colors duration-200 rounded-md group"
              activeProps={{ className: "text-white" }}
              data-ocid={`nav.${link.key}.link`}
            >
              {t(`nav.${link.key}`)}
              {/* Animated underline */}
              <span
                className="absolute inset-x-3 -bottom-px h-[1.5px] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-250 origin-left"
                style={{
                  background: "linear-gradient(90deg, #a855f7, #ec4899)",
                }}
              />
            </Link>
          ))}
        </nav>

        {/* ── Desktop right controls ────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          <ThemeSwitcher />

          {/* BabiesIQ Update Channel button */}
          <button
            type="button"
            onClick={() => setChannelOpen(true)}
            className="relative flex items-center justify-center w-8 h-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="BabiesIQ Update Channel"
            title="BabiesIQ Update"
            data-ocid="header.channel.button"
          >
            <Megaphone className="w-4 h-4" />
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-black"
              style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
            />
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 pl-1">
              {/* Notification bell */}
              <Link
                to="/panel/notifications"
                className="relative flex items-center justify-center w-8 h-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-label="Notifications"
                data-ocid="header.notifications.link"
              >
                <Bell className="w-4 h-4" />
              </Link>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 h-8 pl-2 pr-3 rounded-lg border border-white/10 hover:border-purple-400/40 hover:bg-white/10 transition-all duration-200 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
                    data-ocid="header.user_menu.button"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #a855f7, #ec4899)",
                        }}
                      >
                        <span className="text-[9px] font-bold text-white">
                          {displayName.slice(0, 1).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-xs font-medium max-w-[100px] truncate text-white/80">
                      {displayName}
                    </span>
                    <ChevronDown className="w-3 h-3 opacity-50 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 border-white/10 bg-black/80 backdrop-blur-xl"
                >
                  <DropdownMenuLabel className="pb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #a855f7, #ec4899)",
                        }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {displayName.slice(0, 1).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {displayName}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {user?.user?.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/panel/dashboard"
                      className="flex items-center gap-2 cursor-pointer"
                      data-ocid="header.dashboard.link"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 opacity-60" />
                      {t("nav.dashboard")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/panel/profile-settings"
                      className="flex items-center gap-2 cursor-pointer"
                      data-ocid="header.profile.link"
                    >
                      <Settings className="w-3.5 h-3.5 opacity-60" />
                      {t("nav.settings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                    data-ocid="header.logout.button"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-1">
              <Link
                to="/login"
                className="h-8 px-4 flex items-center text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10"
                data-ocid="header.login.button"
              >
                {t("nav.login")}
              </Link>
              <Link
                to="/signup"
                className="h-8 px-4 flex items-center text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
                  boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
                }}
                data-ocid="header.signup.button"
              >
                {t("nav.signup")}
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile controls ───────────────────────────────────────── */}
        <div className="md:hidden flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <button
            type="button"
            onClick={() => setChannelOpen(true)}
            className="relative flex items-center justify-center w-8 h-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="BabiesIQ Update Channel"
            data-ocid="header.mobile_channel.button"
          >
            <Megaphone className="w-4 h-4" />
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-black"
              style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
            />
          </button>
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            data-ocid="header.mobile_menu.toggle"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-4 h-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Mobile nav drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden"
          >
            <div
              className="border-t border-white/10 px-4 pb-5 pt-3"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Nav links */}
              <nav className="flex flex-col gap-0.5 mb-4">
                {NAV_KEYS.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={link.to}
                      className="flex items-center text-sm font-medium py-2.5 px-3 rounded-lg text-white/65 hover:text-white hover:bg-white/10 transition-colors duration-200"
                      onClick={() => setMobileOpen(false)}
                      activeProps={{ className: "text-white bg-white/10" }}
                      data-ocid={`nav.mobile.${link.key}.link`}
                    >
                      {t(`nav.${link.key}`)}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Auth section */}
              <div className="pt-3 border-t border-white/10">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-1">
                    <Link
                      to="/panel/dashboard"
                      className="flex items-center gap-2 text-sm font-medium py-2.5 px-3 rounded-lg text-white/65 hover:text-white hover:bg-white/10 transition-colors duration-200"
                      onClick={() => setMobileOpen(false)}
                      data-ocid="header.mobile_dashboard.link"
                    >
                      <LayoutDashboard className="w-4 h-4 opacity-60" />
                      {t("nav.dashboard")}
                    </Link>
                    <Link
                      to="/panel/profile-settings"
                      className="flex items-center gap-2 text-sm font-medium py-2.5 px-3 rounded-lg text-white/65 hover:text-white hover:bg-white/10 transition-colors duration-200"
                      onClick={() => setMobileOpen(false)}
                      data-ocid="header.mobile_profile.link"
                    >
                      <User className="w-4 h-4 opacity-60" />
                      {t("nav.settings")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 text-sm font-medium py-2.5 px-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors duration-200 w-full text-left"
                      data-ocid="header.mobile_logout.button"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("nav.logout")}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="w-full flex items-center justify-center h-9 rounded-lg border border-white/15 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
                      data-ocid="header.mobile_login.button"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="w-full flex items-center justify-center h-9 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                      style={{
                        background:
                          "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
                        boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
                      }}
                      data-ocid="header.mobile_signup.button"
                    >
                      {t("nav.signup")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>

    {/* BabiesIQ Update Channel Panel */}
    <UpdateChannel open={channelOpen} onClose={() => setChannelOpen(false)} />
    </>
  );
}
