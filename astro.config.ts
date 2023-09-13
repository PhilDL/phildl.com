import { defineConfig } from "astro/config";
import fs from "fs";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";
import remarkUnwrapImages from "remark-unwrap-images";
// @ts-expect-error:next-line
import { remarkReadingTime } from "./src/utils/remark-reading-time.mjs";

export default defineConfig({
  site: "https://phildl.com",
  markdown: {
    remarkPlugins: [remarkUnwrapImages, remarkReadingTime],
    remarkRehype: { footnoteLabelProperties: { className: [""] } },
    shikiConfig: {
      theme: "dracula",
      wrap: true,
    },
  },
  integrations: [
    mdx({}),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    prefetch(),
  ],
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
