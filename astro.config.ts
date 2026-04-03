import { defineConfig } from "astro/config";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkShikiTwoslash from "remark-shiki-twoslash";
import { remarkReadingTime } from "./src/utils/remark-reading-time.mjs";
import react from "@astrojs/react";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://phildl.com",
  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    remarkPlugins: [
      // @ts-expect-error:next-line
      [remarkShikiTwoslash.default, { theme: "vitesse-dark" }],
      remarkReadingTime,
    ],
    rehypePlugins: [rehypeUnwrapImages],
    remarkRehype: {
      footnoteLabelProperties: {
        className: [""],
      },
    },
    shikiConfig: {
      theme: "vitesse-dark",
      wrap: true,
    },
  },
  integrations: [
    icon(),
    mdx({
      remarkPlugins: [
        // @ts-expect-error:next-line
        [remarkShikiTwoslash.default, { theme: "vitesse-dark" }],
        remarkReadingTime,
      ],
      rehypePlugins: [rehypeUnwrapImages],
    }),
    sitemap(),
    react(),
  ],
  prefetch: true,
  vite: {
    plugins: [tailwindcss() as never, rawFonts([".ttf"])],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});
function rawFonts(ext: Array<string>) {
  return {
    name: "vite-plugin-raw-fonts",
    transform(_: unknown, id: string) {
      if (ext.some((e) => id.endsWith(e))) {
        const buffer = fs.readFileSync(id);
        return {
          code: `export default ${JSON.stringify(buffer)}`,
          map: null,
        };
      }
      return undefined;
    },
  };
}
