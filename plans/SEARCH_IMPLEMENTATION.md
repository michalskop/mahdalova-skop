# Full-Text Search — mahdalova-skop & datajournalism.studio

Implementation of client-side full-text search using [Pagefind](https://pagefind.app/).

---

## datatimes.cz (`apps/web`) ✅ DONE

### Problem: articles are CSR-rendered

`ArticleRenderer` uses `'use client'` + `next-mdx-remote/rsc` (`MDXRemote`). In Next.js static export, this produces `<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">` in the HTML — no article text for Pagefind to index.

### Solution: custom build-time indexer

`apps/web/scripts/buildSearchIndex.js`:
1. Reads every `app/clanek/_articles/[slug]/index.md` directly
2. Parses frontmatter with `gray-matter` (title, excerpt)
3. Strips markdown/MDX syntax (fenced code blocks, HTML tags, headings, bold, links, etc.)
4. Generates temporary HTML in `out/_search_temp/clanek/[slug].html` with `data-pagefind-body`
5. Runs `npx pagefind --site out/_search_temp --output-path out/pagefind`
6. Deletes the temp directory

Package.json build script:
```json
"build": "next build && node scripts/buildSearchIndex.js"
```

### Files

| File | Purpose |
|------|---------|
| `apps/web/scripts/buildSearchIndex.js` | Custom indexer — reads MDX, generates temp HTML, runs pagefind |
| `apps/web/app/search/page.tsx` | Search UI: Mantine components, countdown loading, results |
| `apps/web/app/search/search.module.css` | `.result` hover styles, `.excerpt mark` highlight |
| `apps/web/app/clanek/[slug]/page.tsx` | `<div data-pagefind-body>` wrapper around `ArticleRenderer` (future-proof if CSR changes) |
| `apps/web/components/header/HeaderSimple.tsx` | "Hledat" nav link added to `links` array |

### Search page notes

- **Mantine components** — project uses Mantine UI (not Tailwind); uses `Container`, `TextInput`, `Paper`, `Title`, `Text`, `Stack`
- **Countdown loading:** 10 s countdown while pagefind initialises; "Vyhledávání není k dispozici." on timeout
- **Excerpts:** `dangerouslySetInnerHTML` on excerpts (pagefind wraps matches in `<mark>` tags); `.excerpt mark` in CSS module handles highlight styling
- **No basePath:** datatimes.cz is served at root, no prefix stripping needed
- **Unescaped quotes:** Czech quote chars use `&bdquo;` / `&ldquo;` HTML entities (ESLint `react/no-unescaped-entities`)
- **TypeScript:** uses `// @ts-ignore` (not `@typescript-eslint/ban-ts-comment` — not in this project's ESLint config)

### Deployment

Cloudflare Pages — Build command: `cd apps/web && npm install && npm run build`, output: `apps/web/out`.

Pagefind runs as part of the build; `out/pagefind/` is included in the static output automatically. No special configuration needed on Cloudflare.

---

## datajournalism.studio (`apps/datajournalism.studio`) ⬜ TODO

### Plan

Same approach as datatimes.cz — custom `buildSearchIndex.js` reading source MDX from `app/blog/` (or wherever articles live), generating temp HTML, running pagefind.

### Steps to implement

1. **Identify article source directory** — check `app/` structure for where MDX/MD files live
2. **Copy `buildSearchIndex.js`** from `apps/web/scripts/` and adapt paths:
   - Source dir: `app/[articles-dir]/`
   - Temp output: `out/_search_temp/`
   - Pagefind output: `out/pagefind/`
3. **Update `package.json`** build script:
   ```json
   "build": "next build && node scripts/buildSearchIndex.js"
   ```
4. **Create `app/search/page.tsx`** — adapt from `apps/web/app/search/page.tsx` (check which UI library is used: Mantine, Tailwind, or plain CSS)
5. **Add nav link** to the header component
6. **Test locally:** `npm run build` then `npx serve out` and check `/search`

### Key differences from datatimes.cz to check

- UI framework (Mantine vs Tailwind vs other)
- Article directory structure and frontmatter fields (`title`, `excerpt`/`description`)
- Whether basePath is set (check `next.config.*`)
- ESLint config (which ts-ignore style to use)
