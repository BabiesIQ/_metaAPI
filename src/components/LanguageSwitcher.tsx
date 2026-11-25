import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { MetaIcon, MetaLogo } from "./MetaIcon";

export function LanguageSwitcher({ variant = "compact" }: { variant?: "compact" | "row" | "floating" }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const current = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
  const term = search.trim().toLocaleLowerCase();
  const choices = SUPPORTED_LANGUAGES.filter((lang) => [lang.code, lang.name, lang.nativeName].some(value => value.toLocaleLowerCase().includes(term)));
  const onOpenChange = (next: boolean) => { setOpen(next); if (!next) setSearch(""); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button type="button" aria-label={t("common.language")} title={t("common.language")} data-ocid="header.lang_switcher.button" className={variant === "row" ? "flex w-full items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm hover:bg-muted" : variant === "floating" ? "fixed bottom-4 left-4 z-30 flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 text-xs font-semibold shadow-elevated hover:bg-muted" : "flex h-10 shrink-0 items-center gap-1 rounded-xl border border-border px-2 text-xs font-semibold hover:bg-muted"}>
          <MetaIcon name="language" size={variant === "row" ? 30 : 24} />
          {variant === "row" && <span className="flex-1 text-start">{t("common.language")}</span>}
          <span>{current.toUpperCase()}</span><ChevronDown className="h-3.5 w-3.5"/>
        </button>
      </DialogTrigger>
      <DialogContent className="meta-language-sheet p-0 gap-0" onOpenAutoFocus={event => event.preventDefault()}>
        <div className="border-b border-border px-5 pb-5 pt-3 sm:px-8">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/40" aria-hidden="true"/>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"><MetaLogo size={30}/>BabiesIQ Music API</div>
          <DialogTitle className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t("common.choose_language")}</DialogTitle>
          <DialogDescription className="mt-2">{t("common.language_description")}</DialogDescription>
        </div>
        <div className="px-5 pt-4 sm:px-8">
          <label className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3"><Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground"/><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t("common.search_languages")} aria-label={t("common.search_languages")} className="min-w-0 flex-1 bg-transparent text-sm outline-none"/></label>
          <p className="py-3 text-xs text-muted-foreground">{t("common.language")} · {SUPPORTED_LANGUAGES.length}</p>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto overscroll-contain px-5 pb-6 sm:grid-cols-3 sm:px-8">
          {choices.map(lang => <button key={lang.code} type="button" aria-pressed={current === lang.code} data-ocid={`header.lang.${lang.code}.button`} onClick={async () => { await i18n.changeLanguage(lang.code); onOpenChange(false); }} className={`flex min-h-14 min-w-0 items-center gap-2 rounded-xl border p-3 text-start text-sm transition-colors hover:bg-muted ${current === lang.code ? "border-primary bg-primary/10" : "border-border"}`}><span aria-hidden="true" className="shrink-0 text-xl">{lang.flag}</span><span lang={lang.code} dir={lang.dir} className="min-w-0 flex-1 break-words">{lang.nativeName}</span>{current === lang.code && <Check className="h-4 w-4 shrink-0 text-primary"/>}</button>)}
          {choices.length === 0 && <p className="col-span-full py-8 text-center text-sm text-muted-foreground">{t("common.no_language_results")}</p>}
        </div>
        <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground sm:px-8">{t("common.language_saved")}</p>
      </DialogContent>
    </Dialog>
  );
}
