import { defineConfig } from "astro/config";
import fs from "fs";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import remarkUnwrapImages from "remark-unwrap-images";
import remarkShikiTwoslash from "remark-shiki-twoslash";
// @ts-expect-error:next-line
import { remarkReadingTime } from "./src/utils/remark-reading-time.mjs";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://phildl.com",
  markdown: {
    remarkPlugins: [
      remarkUnwrapImages,
      // @ts-expect-error:next-line
      [remarkShikiTwoslash.default, { theme: "vitesse-dark" }],
      remarkReadingTime,
    ],
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
    mdx({
      remarkPlugins: [
        remarkUnwrapImages,
        // @ts-expect-error:next-line
        [remarkShikiTwoslash.default, { theme: "vitesse-dark" }],
        remarkReadingTime,
      ],
    }),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    react(),
  ],
  prefetch: true,
  vite: {
    plugins: [rawFonts([".ttf"])],
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
