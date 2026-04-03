import type { SiteLocale } from "@/content/locale";
import { DEFAULT_LOCALE } from "@/content/locale";
import { localeInfo, resolveSiteLocale } from "@/i18n/utils";
import { siteConfig } from "@/site-config";

function getDateLocale(locale: SiteLocale) {
  return localeInfo[locale].dateLocale;
}

export function getFormattedDate(
  date: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
  locale: SiteLocale = DEFAULT_LOCALE,
) {
  const normalizedLocale = resolveSiteLocale(locale);
  const dateLocale = getDateLocale(normalizedLocale);

  if (typeof options !== "undefined") {
    return new Date(date).toLocaleDateString(dateLocale, {
      ...(siteConfig.date.options as Intl.DateTimeFormatOptions),
      ...options,
    });
  }

  return new Intl.DateTimeFormat(dateLocale, siteConfig.date.options).format(new Date(date));
}
