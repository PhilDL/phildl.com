import { getRelativeLocaleUrl } from "astro:i18n";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isSiteLocale, type SiteLocale } from "@/content/locale";

type LocaleInfo = {
  htmlLang: string;
  ogLocale: string;
  label: string;
  shortLabel: string;
};

type AlternateLink = {
  href: string;
  hrefLang: string;
  locale: SiteLocale | "x-default";
};

type NavigationLink = {
  title: string;
  path: string;
};

type HomePageCopy = {
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroIntro: string;
  projectsTitle: string;
  postsTitle: string;
};

const HOME_ROUTE_KEY = "home";

export const localeInfo: Record<SiteLocale, LocaleInfo> = {
  en: {
    htmlLang: "en-GB",
    ogLocale: "en_GB",
    label: "English",
    shortLabel: "EN",
  },
  fr: {
    htmlLang: "fr-FR",
    ogLocale: "fr_FR",
    label: "Français",
    shortLabel: "FR",
  },
};

export const homePageCopy: Record<SiteLocale, HomePageCopy> = {
  en: {
    metaTitle: "Home",
    metaDescription:
      "Personal website of Philippe L'ATTENTION with projects, CV, open-source work, SaaS experiments, and technical writing.",
    heroTitle: "My organized chaos.",
    heroIntro: "Hi, I'm Philippe L'ATTENTION, a senior software engineer from Reunion Island.",
    projectsTitle: "Projects and public work",
    postsTitle: "Latest posts",
  },
  fr: {
    metaTitle: "Accueil",
    metaDescription:
      "Site personnel de Philippe L'ATTENTION avec CV, projets, produits, travail open-source et articles techniques.",
    heroTitle: "Mon chaos organisé.",
    heroIntro: "Bonjour, je suis Philippe L'ATTENTION, ingénieur logiciel senior originaire de La Réunion.",
    projectsTitle: "Projets et travail public",
    postsTitle: "Derniers articles",
  },
};

export function resolveSiteLocale(value?: string | null): SiteLocale {
  if (value && isSiteLocale(value)) {
    return value;
  }

  return DEFAULT_LOCALE;
}

export function normalizePathname(pathname: string) {
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function getLocalizedHomeUrl(locale: SiteLocale) {
  return getRelativeLocaleUrl(locale, "");
}

export function getNavigationLinks(locale: SiteLocale): Array<NavigationLink> {
  if (locale === "fr") {
    return [
      { title: "Accueil", path: getLocalizedHomeUrl("fr") },
      { title: "About", path: "/about/" },
      { title: "Blog", path: "/blog/" },
    ];
  }

  return [
    { title: "Home", path: getLocalizedHomeUrl("en") },
    { title: "About", path: "/about/" },
    { title: "Blog", path: "/blog/" },
  ];
}

export function getAlternateLinks(routeKey?: "home"): Array<AlternateLink> {
  if (routeKey !== HOME_ROUTE_KEY) {
    return [];
  }

  return [
    {
      href: getLocalizedHomeUrl("en"),
      hrefLang: localeInfo.en.htmlLang,
      locale: "en",
    },
    {
      href: getLocalizedHomeUrl("fr"),
      hrefLang: localeInfo.fr.htmlLang,
      locale: "fr",
    },
    {
      href: getLocalizedHomeUrl(DEFAULT_LOCALE),
      hrefLang: "x-default",
      locale: "x-default",
    },
  ];
}

export function getLanguageSwitcherLinks(pathname: string, currentLocale: SiteLocale) {
  const normalizedPathname = normalizePathname(pathname);
  const localizedHomePaths = new Set(
    SUPPORTED_LOCALES.map((locale) => normalizePathname(getLocalizedHomeUrl(locale))),
  );

  return SUPPORTED_LOCALES.map((locale) => {
    const isCurrent = locale === currentLocale;
    const href =
      isCurrent && !localizedHomePaths.has(normalizedPathname) ? normalizedPathname : getLocalizedHomeUrl(locale);

    return {
      href,
      isCurrent,
      label: localeInfo[locale].shortLabel,
      locale,
      title: localeInfo[locale].label,
    };
  });
}
