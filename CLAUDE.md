# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# From repo root — run both apps + packages in parallel
npm run dev

# Run a single app only
npm run dev --workspace=apps/web           # → http://localhost:3001
npm run dev --workspace=apps/datajournalism.studio  # → http://localhost:3002

# Build all
npm run build

# Lint all
npm run lint

# Format all TS/TSX/MD files
npm run format
```

There are no automated tests. No test runner is configured.

The `dev` script runs `node scripts/copyImages.js` before starting Next.js. This copies article images from `app/clanek/_articles/*/images/` (and JSON data files) into `public/` for static serving — it runs automatically on `dev` and `build`.

## Architecture

This is a Turborepo monorepo with **npm workspaces** (not pnpm, despite the presence of `pnpm-workspace.yaml`).

```
apps/
  web/                    — Czech journalism site (mahdalova-skop.cz), port 3001
  datajournalism.studio/  — English data journalism site, port 3002
packages/
  ui/                     — Shared React components and utilities (@repo/ui)
  eslint-config/
  typescript-config/
stripe-api-worker/        — Standalone Cloudflare Worker (not part of Turbo pipeline)
```

Both apps use **Next.js 14 with `output: 'export'`** (static HTML export). There is no server runtime — everything is statically generated at build time. Dynamic routes use `generateStaticParams`.

### Shared UI Package (`packages/ui`)

Components live in `packages/ui/src/components/` and utilities in `packages/ui/src/lib/`. Both apps import them as `@repo/ui/components/Name` and `@repo/ui/lib/name`. Both `next.config.mjs` files include `transpilePackages: ['@repo/ui']`.

**App-local wrappers** in `apps/*/components/common/` are thin re-export stubs that call the shared implementation with app-specific config (e.g. `getArticles.ts` passes the local `articlesDir` path and `coverImageBase`).

The design system is documented in `packages/ui/DESIGN.md` — consult it for colour tokens, spacing, and component usage rules.

### Article Pipeline

Articles are Markdown files (not MDX files — they use `next-mdx-remote` serialisation):

```
apps/web/app/clanek/_articles/
  <slug>/
    index.md          # frontmatter + markdown body
    images/           # images copied to public/ at build time
    scrollytelling.yaml   # optional — enables <ScrollyTelling />
    <timeline>.yaml       # optional — referenced by <Timeline yamlFile="..." />
    <data>.json           # optional — referenced by <MotionsStancesTable dataFile="..." />
    <embed>.html          # optional — referenced by frontmatter `htmlInclude`
```

DJS uses the same structure at `apps/datajournalism.studio/app/a/_articles/`.

**Frontmatter fields:** `title`, `date`, `author`, `translator` (optional), `excerpt`, `coverImage`, `tags` (array), `filter` (string or array — used by `getArticles` to categorise), `promoted` (number — controls ordering), `htmlInclude` (filename of raw HTML embed).

**Remark plugins** run in `lib/articles.ts` during serialisation:
- `remarkBoxPlugin` — converts ` ```box `, ` ```mediabox [float]`, and ` ```infobox [type] [float]` fences into `<MediaBox>` / `<InfoBox>` MDX elements
- `remarkFlourishPlugin` — converts `<div class="flourish-embed ...">` blocks into `<FlourishEmbed>` elements

**MDX components** available in article markdown (registered in `ArticleRenderer`): `MediaBox`, `InfoBox`, `FlourishEmbed`, `ScrollyTelling`, `Timeline`, `RelatedArticles`, `PartyFace`, `MotionsStancesTable`.

Data for `ScrollyTelling`, `Timeline`, `MotionsStancesTable`, and `RelatedArticles` is loaded server-side in `lib/articles.ts` and injected via `mdxSource.scope`.

### Component Pattern

- `apps/*/components/clanek/ArticleRenderer.tsx` (or `a/` in DJS) — client component that renders the serialised MDX, defines all MDX component mappings and custom renderers for standard HTML elements
- `apps/*/app/clanek/[slug]/page.tsx` — server component that calls `getArticleBySlug()`, generates metadata, and renders `<ArticleRenderer>`
- `apps/*/app/providers/ThemeProvider.tsx` — sets up `MantineProvider` with the app-specific font (Roboto Slab for web, Work Sans for DJS) and the full colour token palette

### Key app differences

| | `apps/web` | `apps/datajournalism.studio` |
|-|------------|------------------------------|
| Article path | `/clanek/[slug]` | `/a/[slug]` |
| Articles dir | `app/clanek/_articles/` | `app/a/_articles/` |
| Font | Roboto Slab (serif) | Work Sans (sans-serif) |
| Date locale | `cs-CZ` | `en-US` |
| Matomo siteId | `4` | `5` |
| Base URL env | `NEXT_PUBLIC_BASE_URL` defaults to `https://www.mahdalova-skop.cz` | defaults to `https://www.datajournalism.studio` |

### `gh` CLI

Run `gh` commands with `GIT_CONFIG_NOSYSTEM=1` prefix (installed via snap):
```bash
GIT_CONFIG_NOSYSTEM=1 gh pr create ...
```
