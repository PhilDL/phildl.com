# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website and blog (phildl.com) built with **Astro 4** + React + TypeScript + Tailwind CSS 3. Based on the Cactus theme. Static site generation only (no SSR).

## Commands

```bash
pnpm dev        # Dev server at localhost:4321
pnpm build      # Production build to /dist + Pagefind search indexing
pnpm preview    # Preview production build
pnpm format     # Prettier (119 char width, includes .astro files)
```

No test framework is configured. No CI/CD pipeline. Package manager is **pnpm 8.6.1**.

## Architecture

- **`src/pages/`** — File-based routing. Blog posts at `/blog/[slug]`, paginated index at `/blog/[...page]`, tags at `/tags/[tag]/[...page]`
- **`src/content/post/`** — Blog post collection (`.md`/`.mdx`). Schema in `src/content/config.ts`: title (max 65 chars), description (50-160 chars), publishDate (required), tags (auto-lowercased), draft flag
- **`src/layouts/`** — `Base.astro` (root layout with ViewTransitions), `BlogPost.astro` (post layout with TOC)
- **`src/components/`** — Astro components mostly. `ThemeToggle` and `Search` are web components (custom elements). React used only for `CodeSandbox.tsx`
- **`src/utils/`** — Post helpers (`getAllPosts`, `sortMDByDate`, `getUniqueTags`), date formatting, TOC generation
- **`src/site.config.ts`** — Site metadata, menu links, date locale. Central config that feeds Header/Footer
- **`src/utils/remark-reading-time.mjs`** — Custom remark plugin injecting `minutesRead` into frontmatter

## Key Conventions

- **Path aliases**: `@/components/*`, `@/layouts/*`, `@/utils`, `@/types`, `@/site-config`, `@/assets/*` (defined in `tsconfig.json`)
- **TypeScript**: Extends `astro/tsconfigs/strictest`
- **Dark mode**: Class-based (`darkMode: "class"` in Tailwind). Theme colors use CSS variables (HSL) defined in Tailwind config
- **Styling**: Tailwind utility classes + `@tailwindcss/typography` with custom "cactus" prose theme. Custom `.cactus-link` animated underline component
- **Markdown pipeline**: remarkUnwrapImages → remarkShikiTwoslash (vitesse-dark theme) → remarkReadingTime. Same plugins configured for both `.md` and `.mdx` in `astro.config.ts`
- **Draft posts**: Filtered out in production by `getAllPosts()`, visible in dev
- **OG images**: Dynamically generated per post via satori at `/og-image/[slug].png`
- **Search**: Pagefind — production-only (runs post-build). Keyboard shortcut `/` opens search
- **Pagination**: 10 posts per page using Astro's `paginate()`

## Blog Post Frontmatter

```yaml
title: "Post Title"           # Required, max 65 chars
description: "Description"    # Required, 50-160 chars
publishDate: "02 Oct 2024"    # Required
updatedDate: "03 Oct 2024"    # Optional
tags: ["tag1", "tag2"]        # Auto-lowercased, deduplicated
draft: true                   # Default false
coverImage:                   # Optional
  src: "./image.png"
  alt: "Alt text"
ogImage: "/custom-og.png"     # Optional, overrides generated OG
```
