export const SUPPORTED_LOCALES = ["en", "fr"] as const;

export type SiteLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SiteLocale = "en";

export function isSiteLocale(value: string): value is SiteLocale {
  return SUPPORTED_LOCALES.includes(value as SiteLocale);
}

export function toLocalizedEntryId(locale: SiteLocale, slug: string) {
  return `${locale}/${slug}`;
}
