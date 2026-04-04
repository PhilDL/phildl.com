# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Personal website and blog (phildl.com) built with **Astro 6** + React + TypeScript + Tailwind CSS 4. Based on the Cactus theme. Static site generation only (no SSR).

## Commands

```bash
pnpm dev        # Dev server at localhost:4321
pnpm build      # Production build to /dist + Pagefind search indexing
pnpm preview    # Preview production build
pnpm format     # Prettier (119 char width, includes .astro files)
pnpm lint       # ESLint
pnpm typecheck  # Astro + TypeScript diagnostics
```

No test framework is configured. No CI/CD pipeline. Package manager is **pnpm 8.6.1**.
Requires **Node 22+** for local development and builds.

## Architecture

- **`src/pages/`** — File-based routing. Blog posts at `/blog/[slug]`, paginated index at `/blog/[...page]`, tags at `/tags/[tag]/[...page]`
- **`src/content/post/`** — Blog post collection (`.md`/`.mdx`). Content layer schema in `src/content.config.ts`, loaded via `glob()` from `astro/loaders`
- **`src/layouts/`** — `Base.astro` (root layout with `ClientRouter`), `BlogPost.astro` (post layout with TOC)
- **`src/components/`** — Astro components mostly. `ThemeToggle` and `Search` are web components (custom elements). React used only for `CodeSandbox.tsx`
- **`src/utils/`** — Post helpers (`getAllPosts`, `sortMDByDate`, `getUniqueTags`), date formatting, TOC generation
- **`src/site.config.ts`** — Site metadata, menu links, date locale. Central config that feeds Header/Footer
- **`src/utils/remark-reading-time.mjs`** — Custom remark plugin injecting `minutesRead` into frontmatter

## Key Conventions

- **Path aliases**: `@/components/*`, `@/layouts/*`, `@/utils`, `@/types`, `@/site-config`, `@/assets/*` (defined in `tsconfig.json`)
- **TypeScript**: Extends `astro/tsconfigs/strictest`
- **i18n routing**: Astro i18n is configured with English as the default locale and French under the `/fr` prefix. Locale-aware URLs must be generated through the helpers in `src/i18n/utils.ts` and not by hard-coding `/fr/...` or unprefixed internal paths.
- **Localized pages**: If a page should exist in both languages, the localized route must actually exist in `src/pages/fr/...`. The language switcher is expected to keep the visitor on the equivalent page when switching locale, not send them back to the homepage.
- **Localized content**: User-facing copy is expected to exist in both English and French. Do not leave raw strings in pages or components unless they are intentionally language-neutral; move copy into localized content files or the i18n copy maps so `/` and `/fr` can diverge cleanly.
- **Dark mode**: Class-based (`darkMode: "class"` in Tailwind). Theme colors use CSS variables (HSL) defined in Tailwind config
- **Styling**: Tailwind 4 via `@tailwindcss/vite` and `@import "tailwindcss"` in `src/styles/global.css`. Tailwind config is loaded explicitly with `@config "../../tailwind.config.ts"`. Custom "cactus" prose theme and `.cactus-link` live in `tailwind.config.ts`
- **Markdown pipeline**: `remarkShikiTwoslash` (vitesse-dark theme) → `remarkReadingTime`, plus `rehypeUnwrapImages`. Same plugins configured for both `.md` and `.mdx` in `astro.config.ts`
- **Draft posts**: Filtered out in production by `getAllPosts()`, visible in dev
- **Content layer**: Post routes and OG image paths are derived from `entry.id` in Astro 6. Use `render(entry)` from `astro:content`, not `entry.render()`
- **Client-side imports**: Do not import the `@/utils` barrel from browser scripts or custom elements. It re-exports server-only content helpers. Import leaf modules such as `@/utils/domElement` directly
- **OG images**: Dynamically generated per post via satori at `/og-image/[slug].png`
- **Search**: Pagefind — production-only (runs post-build). Keyboard shortcut `/` opens search
- **Pagination**: 10 posts per page using Astro's `paginate()`
- **Task completion**: Finish every coding task by running formatting, linting, typechecking, and a production build (`pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm build`) and report any failures

## Blog Post Frontmatter

```yaml
title: "Post Title" # Required, max 65 chars
description: "Description" # Required, 50-160 chars
publishDate: "02 Oct 2024" # Required
updatedDate: "03 Oct 2024" # Optional
tags: ["tag1", "tag2"] # Auto-lowercased, deduplicated
draft: true # Default false
coverImage: # Optional
  src: "./image.png"
  alt: "Alt text"
ogImage: "/custom-og.png" # Optional, overrides generated OG
```
