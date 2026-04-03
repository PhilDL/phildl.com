import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import typography from "@tailwindcss/typography";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bgColor: "hsl(var(--theme-bg) / <alpha-value>)",
        textColor: "hsl(var(--theme-text) / <alpha-value>)",
        link: "hsl(var(--theme-link) / <alpha-value>)",
        accent: "hsl(var(--theme-accent) / <alpha-value>)",
        "accent-2": "hsl(var(--theme-accent-2) / <alpha-value>)",
        quote: "hsl(var(--theme-quote) / <alpha-value>)",
      },
      fontFamily: {
        // Add any custom fonts here
        sans: ["Space Grotesk", ...fontFamily.sans],
        serif: ["Alice", ...fontFamily.serif],
      },
      transitionProperty: {
        height: "height",
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // Remove above once tailwindcss exposes theme type
      typography: (theme) => ({
        cactus: {
          css: {
            "--tw-prose-body": theme("colors.textColor / 1"),
            "--tw-prose-headings": theme("colors.accent-2 / 1"),
            "--tw-prose-links": theme("colors.textColor / 1"),
            "--tw-prose-bold": theme("colors.textColor / 1"),
            "--tw-prose-bullets": theme("colors.textColor / 1"),
            "--tw-prose-quotes": theme("colors.quote / 1"),
            "--tw-prose-code": theme("colors.textColor / 1"),
            "--tw-prose-hr": "0.5px dashed #666",
            "--tw-prose-th-borders": "#666",
          },
        },
        DEFAULT: {
          css: {
            a: {
              textDecoration: "none",
              backgroundSize: "100% 6px",
              backgroundPosition: "bottom",
              backgroundRepeat: "repeat-x",
              backgroundImage:
                "linear-gradient(transparent,transparent 5px,hsl(var(--theme-text)) 5px,hsl(var(--theme-text)))",
              "&:hover": {
                backgroundImage:
                  "linear-gradient(transparent,transparent 4px,hsl(var(--theme-link)) 4px,hsl(var(--theme-link)))",
              },
            },
            strong: {
              fontWeight: "700",
            },
            code: {
              border: "1px dotted #666",
              borderRadius: "2px",
              textWrap: "nowrap",
            },
            blockquote: {
              borderLeftWidth: "0",
            },
            hr: {
              borderTopStyle: "dashed",
            },
            thead: {
              borderBottomWidth: "none",
            },
            "thead th": {
              fontWeight: "700",
              borderBottom: "1px dashed #666",
            },
            "tbody tr": {
              borderBottomWidth: "none",
            },
            tfoot: {
              borderTop: "1px dashed #666",
            },
            sup: {
              marginInlineStart: "0.125rem",
              a: {
                backgroundImage: "none",
                "&:hover": {
                  color: theme("colors.link / 1"),
                  textDecoration: "none",
                  backgroundImage: "none",
                },
                "&:before": {
                  content: "'['",
                },
                "&:after": {
                  content: "']'",
                },
              },
            },
          },
        },
        sm: {
          css: {
            code: {
              fontSize: theme("fontSize.sm")[0],
              fontWeight: "400",
            },
          },
        },
      }),
    },
  },
  plugins: [
    typography,
    plugin(function ({ addComponents }) {
      addComponents({
        ".cactus-link": {
          "@apply bg-[size:100%_6px] bg-bottom bg-repeat-x": {},
          backgroundImage:
            "linear-gradient(transparent,transparent 5px,hsl(var(--theme-text)) 5px,hsl(var(--theme-text)))",
          "&:hover": {
            backgroundImage:
              "linear-gradient(transparent,transparent 4px,hsl(var(--theme-link)) 4px,hsl(var(--theme-link)))",
          },
        },
        ".title": {
          "@apply text-2xl font-semibold text-accent-2": {},
        },
      });
    }),
  ],
} satisfies Config;
