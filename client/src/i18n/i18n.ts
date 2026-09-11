import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonFr from "./locales/fr/common.json";
import gameFr from "./locales/fr/game.json";
import projectsFr from "./locales/fr/projects.json";
import dialoguesFr from "./locales/fr/dialogues.json";

import commonEn from "./locales/en/common.json";
import gameEn from "./locales/en/game.json";
import projectsEn from "./locales/en/projects.json";
import dialoguesEn from "./locales/en/dialogues.json";

export const SUPPORTED_LANGUAGES = ["fr", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Only the game/dialogue text lives in i18next resources — the site's default
// language mirrors the browser's locale (see LanguageDetector below), falling
// back to English for any locale that isn't French.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: commonFr, game: gameFr, projects: projectsFr, dialogues: dialoguesFr },
      en: { common: commonEn, game: gameEn, projects: projectsEn, dialogues: dialoguesEn },
    },
    supportedLngs: [...SUPPORTED_LANGUAGES],
    fallbackLng: "en",
    load: "languageOnly", // "fr-FR" -> "fr", "en-US" -> "en"
    ns: ["common", "game", "projects", "dialogues"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "oneairworld_lang",
    },
  });

export default i18n;
