import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  author: "Philippe L'ATTENTION",
  title: "Organized Chaos",
  // Meta property used as the default description meta property
  description:
    "I am Philippe L'ATTENTION, Senior Software Engineer born in Réunion Island 🇷🇪. Here you will find technical gibberish, thoughts, discoveries.",
  // HTML lang property, found in src/layouts/Base.astro L:18
  lang: "en-GB",
  // Meta property, found in src/components/BaseHead.astro L:42
  ogLocale: "en_GB",
  // Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
  date: {
    locale: "en-GB",
    options: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  },
};

// Used to generate links in both the Header & Footer.
export const menuLinks: Array<{ title: string; path: string }> = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "About",
    path: "/about/",
  },
  {
    title: "Blog",
    path: "/blog/",
  },
];
