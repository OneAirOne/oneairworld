import i18n from "../i18n/i18n";

export function getCvFilename(): string {
  const lang = i18n.resolvedLanguage ?? i18n.language;
  return lang === "en" ? "cv-erwan-gilbert-en.pdf" : "cv-erwan-gilbert.pdf";
}

export function getCvUrl(): string {
  return `/assets/${getCvFilename()}`;
}
