import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import { Bell, Menu, Megaphone } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { UpdateChannel } from "./UpdateChannel";
import { MetaIcon, MetaLogo } from "./MetaIcon";

const NAV_KEYS = [
  { key: "home", to: "/" }, { key: "docs", to: "/docs" },
  { key: "pricing", to: "/pricing" }, { key: "contact", to: "/contact" },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [channelOpen, setChannelOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const displayName = user?.user?.first_name || user?.user?.email?.split("@")[0] || t("nav.dashboard");
  const avatarUrl = user?.user?.avatar ?? null;
  const close = () => setMenuOpen(false);
  const linkClass = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors";
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur" data-ocid="header">
        <div className="scroll-progress" id="scroll-progress" />
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
              <DialogTrigger asChild>
                <button type="button" aria-label={t("common.menu")} aria-expanded={menuOpen} data-ocid="header.mobile_menu.toggle" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border hover:bg-muted">
                  <Menu className="h-5 w-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="meta-nav-drawer p-0 gap-0" aria-describedby="meta-nav-description">
                <div className="flex items-center gap-3 border-b border-border p-5 pr-12">
                  <MetaLogo size={44} />
                  <div className="min-w-0">
                    <DialogTitle className="truncate text-base">BabiesIQ Music API</DialogTitle>
                    <DialogDescription id="meta-nav-description" className="mt-1 truncate text-xs">{isAuthenticated ? user?.user?.email : t("footer.tagline")}</DialogDescription>
                  </div>
                </div>
                <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
                  {NAV_KEYS.map(({ key, to }) => <Link key={to} to={to} onClick={close} activeOptions={{ exact: to === "/" }} activeProps={{ className: "bg-muted text-foreground" }} className={linkClass} data-ocid={`nav.mobile.${key}.link`}><MetaIcon name={key} />{t(`nav.${key}`)}</Link>)}
                  {isAuthenticated && <>
                    <div className="my-3 border-t border-border" />
                    <Link to="/panel/dashboard" onClick={close} className={linkClass}><MetaIcon name="dashboard"/>{t("nav.dashboard")}</Link>
                    <Link to="/panel/notifications" onClick={close} className={linkClass}><MetaIcon name="notifications"/>{t("dashboard.notifications")}</Link>
                    <Link to="/panel/profile-settings" onClick={close} className={linkClass}><MetaIcon name="profile-settings"/>{t("nav.settings")}</Link>
                  </>}
                  <button type="button" onClick={() => { close(); setChannelOpen(true); }} className={`${linkClass} w-full text-start`}><MetaIcon name="updates"/>{t("channel.official_channel")}</button>
                </nav>
                <div className="space-y-2 border-t border-border p-3">
                  <LanguageSwitcher variant="row" />
                  {isAuthenticated ? <button type="button" onClick={() => { close(); logout(); }} data-ocid="header.mobile_logout.button" className={`${linkClass} w-full text-destructive`}><MetaIcon name="logout"/>{t("nav.logout")}</button> : <div className="grid grid-cols-2 gap-2"><Link to="/signin" onClick={close} className="rounded-xl border border-border px-3 py-3 text-center text-sm font-semibold hover:bg-muted">{t("nav.login")}</Link><Link to="/signup" onClick={close} className="rounded-xl bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground">{t("nav.signup")}</Link></div>}
                </div>
              </DialogContent>
            </Dialog>
            <Link to="/" data-ocid="header.logo.link" className="flex min-w-0 items-center gap-2"><MetaLogo size={38}/><span className="truncate text-sm font-semibold tracking-tight sm:text-lg">BabiesIQ<span className="hidden sm:inline"> Music API</span></span></Link>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={() => setChannelOpen(true)} aria-label={t("channel.official_channel")} title={t("channel.official_channel")} data-ocid="header.channel.button" className="hidden h-10 w-10 place-items-center rounded-xl border border-border hover:bg-muted sm:grid"><Megaphone className="h-[18px] w-[18px]"/></button>
            {isAuthenticated && <Link to="/panel/notifications" aria-label={t("dashboard.notifications")} className="grid h-10 w-10 place-items-center rounded-xl border border-border hover:bg-muted" data-ocid="header.notifications.link"><Bell className="h-[18px] w-[18px]"/></Link>}
            <ThemeSwitcher />
            {isAuthenticated ? <Link to="/panel/dashboard" aria-label={t("nav.dashboard")} title={t("nav.dashboard")} className="flex h-10 items-center gap-2 rounded-xl border border-border px-1.5 sm:px-3 hover:bg-muted" data-ocid="header.dashboard.link">{avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-7 w-7 rounded-full object-cover"/> : <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{displayName.slice(0,1).toUpperCase()}</span>}<span className="hidden max-w-24 truncate text-sm font-medium lg:inline">{t("nav.dashboard")}</span></Link> : <Link to="/signin" className="hidden rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted min-[380px]:inline-flex" data-ocid="header.login.button">{t("nav.login")}</Link>}
          </div>
        </div>
      </header>
      <UpdateChannel open={channelOpen} onClose={() => setChannelOpen(false)} />
    </>
  );
}
