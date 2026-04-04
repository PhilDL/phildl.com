import { getRelativeLocaleUrl } from "astro:i18n";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isSiteLocale, type SiteLocale } from "@/content/locale";

type LocaleInfo = {
  htmlLang: string;
  ogLocale: string;
  dateLocale: string;
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

type AboutPageCopy = {
  metaTitle: string;
  headline: string;
  locationPrefix: string;
  focusSentence: string;
  availabilityLabel: string;
  websiteLabel: string;
  emailLabel: string;
  focusAreasTitle: string;
  coreStackTitle: string;
  experienceTitle: string;
  selectedProjectsTitle: string;
  openSourceTitle: string;
  clientWorkTitle: string;
  educationTitle: string;
  languagesTitle: string;
  presentLabel: string;
  technologiesLabel: string;
  profileImageAlt: string;
  downloadPdfLabel: string;
};

type BlogIndexPageCopy = {
  metaTitle: string;
  metaDescription: string;
  pageTitle: string;
  tagsTitle: string;
  allTagsLabel: string;
  allTagsAriaLabel: string;
  tagAriaLabel: (tag: string) => string;
  previousPostsLabel: string;
  nextPostsLabel: string;
};

type TagsIndexPageCopy = {
  metaTitle: string;
  metaDescription: string;
  pageTitle: string;
  tagTitle: (tag: string) => string;
  countLabel: (count: number) => string;
};

type TagPageCopy = {
  metaTitle: (tag: string) => string;
  metaDescription: (tag: string) => string;
  tagsLabel: string;
  previousLabel: string;
  nextLabel: string;
};

type BlogPostCopy = {
  lastUpdatedLabel: string;
  tagAriaLabel: (tag: string) => string;
};

export const localeInfo: Record<SiteLocale, LocaleInfo> = {
  en: {
    htmlLang: "en-GB",
    ogLocale: "en_GB",
    dateLocale: "en-GB",
    label: "English",
    shortLabel: "EN",
  },
  fr: {
    htmlLang: "fr-FR",
    ogLocale: "fr_FR",
    dateLocale: "fr-FR",
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

export const aboutPageCopy: Record<SiteLocale, AboutPageCopy> = {
  en: {
    metaTitle: "About",
    headline: "About",
    locationPrefix: "Currently in",
    focusSentence:
      "I work remotely through Basaltbytes on SaaS, mobile, and product engineering engagements where architecture, delivery, and iteration all matter.",
    availabilityLabel: "Availability",
    websiteLabel: "Website",
    emailLabel: "Email",
    focusAreasTitle: "Core competencies",
    coreStackTitle: "Technical skills",
    experienceTitle: "Experience",
    selectedProjectsTitle: "Products",
    openSourceTitle: "Open source",
    clientWorkTitle: "Freelance",
    educationTitle: "Education",
    languagesTitle: "Languages",
    presentLabel: "Present",
    technologiesLabel: "Technologies",
    profileImageAlt: "Profile image for Philippe L'ATTENTION",
    downloadPdfLabel: "Download PDF resume",
  },
  fr: {
    metaTitle: "À propos",
    headline: "À propos",
    locationPrefix: "Actuellement en",
    focusSentence:
      "Je travaille à distance via Basaltbytes sur des produits SaaS et mobiles, ainsi que sur des missions logicielles où l'architecture, l'exécution et l'itération comptent tout autant.",
    availabilityLabel: "Disponibilité",
    websiteLabel: "Site web",
    emailLabel: "Email",
    focusAreasTitle: "Compétences clés",
    coreStackTitle: "Compétences techniques",
    experienceTitle: "Expérience",
    selectedProjectsTitle: "Produits",
    openSourceTitle: "Open source",
    clientWorkTitle: "Freelance",
    educationTitle: "Formation",
    languagesTitle: "Langues",
    presentLabel: "Aujourd'hui",
    technologiesLabel: "Technologies",
    profileImageAlt: "Photo de profil de Philippe L'ATTENTION",
    downloadPdfLabel: "Télécharger le CV PDF",
  },
};

export const blogIndexPageCopy: Record<SiteLocale, BlogIndexPageCopy> = {
  en: {
    metaTitle: "Posts",
    metaDescription: "Read my collection of posts and the things that interest me",
    pageTitle: "Posts",
    tagsTitle: "Tags",
    allTagsLabel: "View all →",
    allTagsAriaLabel: "View all blog categories",
    tagAriaLabel: (tag) => `View all posts with the tag: ${tag}`,
    previousPostsLabel: "← Previous Posts",
    nextPostsLabel: "Next Posts →",
  },
  fr: {
    metaTitle: "Articles",
    metaDescription: "Parcourez mes articles et les sujets qui m'intéressent",
    pageTitle: "Articles",
    tagsTitle: "Tags",
    allTagsLabel: "Voir tout →",
    allTagsAriaLabel: "Voir toutes les catégories du blog",
    tagAriaLabel: (tag) => `Voir tous les articles avec le tag : ${tag}`,
    previousPostsLabel: "← Articles précédents",
    nextPostsLabel: "Articles suivants →",
  },
};

export const tagsIndexPageCopy: Record<SiteLocale, TagsIndexPageCopy> = {
  en: {
    metaTitle: "All Tags",
    metaDescription: "A list of all the topics I've written about in my posts",
    pageTitle: "Tags",
    tagTitle: (tag) => `View posts with the tag: ${tag}`,
    countLabel: (count) => `${count} Post${count > 1 ? "s" : ""}`,
  },
  fr: {
    metaTitle: "Tous les tags",
    metaDescription: "Une liste de tous les sujets abordés dans mes articles",
    pageTitle: "Tags",
    tagTitle: (tag) => `Voir les articles avec le tag : ${tag}`,
    countLabel: (count) => `${count} article${count > 1 ? "s" : ""}`,
  },
};

export const tagPageCopy: Record<SiteLocale, TagPageCopy> = {
  en: {
    metaTitle: (tag) => `Tag: ${tag}`,
    metaDescription: (tag) => `View all posts with the tag - ${tag}`,
    tagsLabel: "Tags",
    previousLabel: "← Previous Tags",
    nextLabel: "Next Tags →",
  },
  fr: {
    metaTitle: (tag) => `Tag : ${tag}`,
    metaDescription: (tag) => `Voir tous les articles avec le tag - ${tag}`,
    tagsLabel: "Tags",
    previousLabel: "← Tags précédents",
    nextLabel: "Tags suivants →",
  },
};

export const blogPostCopy: Record<SiteLocale, BlogPostCopy> = {
  en: {
    lastUpdatedLabel: "Last Updated",
    tagAriaLabel: (tag) => `View more blogs with the tag ${tag}`,
  },
  fr: {
    lastUpdatedLabel: "Dernière mise à jour",
    tagAriaLabel: (tag) => `Voir plus d'articles avec le tag ${tag}`,
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

export function getPathnameWithoutLocale(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const [firstSegment, ...remainingSegments] = segments;

  if (firstSegment && isSiteLocale(firstSegment)) {
    return remainingSegments.join("/");
  }

  return segments.join("/");
}

export function getLocalizedUrl(locale: SiteLocale, path = "") {
  return getRelativeLocaleUrl(locale, path);
}

export function getLocalizedHomeUrl(locale: SiteLocale) {
  return getLocalizedUrl(locale, "");
}

export function getLocalizedPathname(pathname: string, locale: SiteLocale) {
  return getLocalizedUrl(locale, getPathnameWithoutLocale(pathname));
}

export function getAboutUrl(locale: SiteLocale) {
  return getLocalizedUrl(locale, "about");
}

export function getBlogUrl(locale: SiteLocale) {
  return getLocalizedUrl(locale, "blog");
}

export function getBlogPostUrl(locale: SiteLocale, slug: string) {
  return getLocalizedUrl(locale, `blog/${slug}`);
}

export function getTagsUrl(locale: SiteLocale) {
  return getLocalizedUrl(locale, "tags");
}

export function getTagUrl(locale: SiteLocale, tag: string) {
  return getLocalizedUrl(locale, `tags/${tag}`);
}

export function getNavigationLinks(locale: SiteLocale): Array<NavigationLink> {
  if (locale === "fr") {
    return [
      { title: "Accueil", path: getLocalizedHomeUrl("fr") },
      { title: "À propos", path: getAboutUrl("fr") },
      { title: "Articles", path: getBlogUrl("fr") },
    ];
  }

  return [
    { title: "Home", path: getLocalizedHomeUrl("en") },
    { title: "About", path: getAboutUrl("en") },
    { title: "Blog", path: getBlogUrl("en") },
  ];
}

export function getAlternateLinks(pathname: string): Array<AlternateLink> {
  const localizedDefaultPath = getLocalizedPathname(pathname, DEFAULT_LOCALE);
  return [
    ...SUPPORTED_LOCALES.map((locale) => ({
      href: getLocalizedPathname(pathname, locale),
      hrefLang: localeInfo[locale].htmlLang,
      locale,
    })),
    {
      href: localizedDefaultPath,
      hrefLang: "x-default",
      locale: "x-default",
    },
  ];
}

export function getLanguageSwitcherLinks(url: Pick<URL, "pathname" | "search">, currentLocale: SiteLocale) {
  return SUPPORTED_LOCALES.map((locale) => {
    return {
      href: `${getLocalizedPathname(url.pathname, locale)}${url.search}`,
      isCurrent: locale === currentLocale,
      label: localeInfo[locale].shortLabel,
      locale,
      title: localeInfo[locale].label,
    };
  });
}
