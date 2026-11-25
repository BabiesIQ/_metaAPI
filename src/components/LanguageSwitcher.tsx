import { useState } from "react";
import { Check, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" aria-label={t("common.language")} title={t("common.language")} data-ocid="header.lang_switcher.button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-foreground hover:bg-muted transition-colors">
          <Globe className="h-[18px] w-[18px]" />
        </button>
      </DialogTrigger>
      <DialogContent className="meta-language-sheet max-h-[86dvh] overflow-y-auto p-5 sm:p-7 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl tracking-tight">{t("common.choose_language")}</DialogTitle>
          <DialogDescription>{t("common.language_description")}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button key={lang.code} type="button" aria-pressed={current === lang.code} data-ocid={`header.lang.${lang.code}.button`} onClick={async () => { await i18n.changeLanguage(lang.code); setOpen(false); }} className={`flex items-center gap-2 min-w-0 rounded-xl border p-3 text-left text-sm hover:bg-muted transition-colors ${current === lang.code ? "border-primary bg-primary/10" : "border-border"}`}>
              <span aria-hidden="true" className="text-xl shrink-0">{lang.flag}</span>
              <span className="min-w-0 flex-1 break-words" dir={lang.dir}>{lang.nativeName}</span>
              {current === lang.code && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
