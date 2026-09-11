import * as React from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../i18n/i18n";

const FLAGS: Record<SupportedLanguage, string> = { fr: "🇫🇷", en: "🇬🇧" };

interface Props {
  /** Render inline within a header instead of as a fixed top-right overlay */
  inline?: boolean;
}

export function LanguageSwitcher({ inline = false }: Props) {
  const { t, i18n } = useTranslation();
  const current = (i18n.resolvedLanguage ?? i18n.language) as SupportedLanguage;

  const switchTo = (lng: SupportedLanguage) => {
    if (lng === current) return;
    i18n.changeLanguage(lng);
    // Phaser scenes (dialogues, POI hints, interior labels) resolve their
    // text once at creation time from the same i18n resources — a full
    // reload keeps the canvas and the React UI in sync on the new language.
    window.location.reload();
  };

  return (
    <div
      className={`${inline ? "relative" : "fixed top-5 right-5 z-20"} flex items-center gap-1 p-1 rounded-full bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm pointer-events-auto`}
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          onClick={() => switchTo(lng)}
          aria-label={t("language.switchTo", { language: t(`language.${lng}`) })}
          title={t(`language.${lng}`)}
          className={`flex items-center justify-center w-8 h-8 rounded-full text-lg leading-none transition-all duration-200 ${
            current === lng
              ? "bg-brand-primary/20 ring-1 ring-brand-primary scale-105"
              : "opacity-50 hover:opacity-90 hover:bg-slate-800"
          }`}
        >
          <span role="img" aria-hidden="true">{FLAGS[lng]}</span>
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
