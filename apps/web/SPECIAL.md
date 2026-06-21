# SPECIAL.md — Data pro budoucí premiérku: ops guide

Operations guide for the `/specialy/data-pro-budouci-premierku` web section and the PDF book pipeline.

> **⚠ Pipeline direction changed 2026-06-21.** The `dpbp-config.json` → `sync-dpbp.mjs` flow described further below is **legacy**. As of this date, new chapter content (article text, `_meta.json`) is authored **directly in this repo** (`mahdalova-skop`), not generated from `data-pro-premierku` source files. `data-pro-premierku` remains the place where research/facts originate, but it is no longer the literal source of `.mdx` content. See "Current content pipeline" below before touching anything in `dpbp-config.json` or running `npm run sync:dpbp`.

---

## Current content pipeline (authoritative — read this first)

```
data-pro-premierku/                    ← research & fact-finding workspace
  XX_KAPITOLA/01_research_and_audit/   ← RESEARCH_AUDIT*.md, SOURCES_DIRECTORY*.md
  XX_KAPITOLA/03_primary_content/      ← DIST_ARTICLE_*.md (reference material, not copied verbatim)

apps/web/app/specialy/data-pro-budouci-premierku/
  _content/{chapter-slug}/
    _meta.json                         ← HAND-WRITTEN — see schema below
    articles/*.mdx                     ← HAND-WRITTEN — frontmatter + body
    cards/*.json                       ← ImpactCard data (still fine to hand-write or keep from a past sync)
```

**Workflow when adding or revising an article:**
1. Read the relevant research files in `data-pro-premierku` (`RESEARCH_AUDIT*`, `DIST_ARTICLE_*`, `SOURCES_DIRECTORY*`) to ground the claims — never invent statistics.
2. Write the `.mdx` file directly in `apps/web/.../_content/{chapter}/articles/`.
3. Register it in that chapter's `_meta.json` under `tiles` (or `onePager`/`introChart` if relevant) — see schema below.
4. Validate the JSON (`python3 -c "import json; json.load(open(path))"`), then sanity-check by running `npm run dev` and loading the chapter + article URL.
5. **Copy-back to `data-pro-premierku` is currently manual and deferred.** Once an article is finalized here, it should eventually be placed in a new subfolder of the matching chapter in `data-pro-premierku` for the editorial record / book pipeline — there is no script for this yet. Don't block on it.

**Writing guidelines** (tone, title patterns, tile taxonomy, sourcing rules) live in [`DPBP_WRITING_GUIDE.md`](./DPBP_WRITING_GUIDE.md) — read that before drafting new articles.

### `_meta.json` schema (current)

```json
{
  "id": "01",
  "slug": "01-energie-a-energeticka-bezpecnost",
  "title": "Energie a energetická bezpečnost",
  "accent": "#ffcf02",
  "author": "Kateřina Mahdalová & Michal Škop",
  "date": "2026-06-01",
  "cardOrder": ["SPINA", "REPKA", "JADRO"],
  "onePager": { "slug": "one-pager", "logo": "/dpbp/chapters/01.svg" },
  "introChart": "CHART_COAL_PRICE",
  "intro": {
    "title": "...",
    "textBefore": "...",
    "textAfter": "...",
    "textClosing": "..."
  },
  "tiles": [
    { "slug": "explainer-merit-order", "topic": "Explainer" },
    { "slug": "svet-nemecko-energiewende", "topic": "Svět" },
    { "slug": "04-evropske-cesty", "topic": "Evropa" },
    { "slug": "01-lipsko", "topic": "Analýza" },
    { "slug": "02-krajina", "topic": "Analýza" },
    { "slug": "03-mezera", "topic": "Analýza" },
    { "slug": "05-vypocet-350km2", "topic": "Investigace" },
    { "slug": "06-jak-rychle-oze", "topic": "Komparace" }
  ]
}
```

`tiles` renders as a 2-column grid of 4 pairs below the one-pager — see "Landing page structure" below for the fixed editorial order. `topic` is a single short word/concept; the chapter title is already prefixed by the card component (`DpbpArticleCard`), so don't repeat it in `topic`.

### Legacy sync pipeline (do not run on migrated chapters)

```
data-pro-premierku/          ← source project (content authoring, git repo) — OLD MODEL
  BOOK.md                    ← book manifest + impact cards (YAML front-matter)
  01_ENERGIE_A_BEZPECNOST/
    02_executive_briefs/PM_ONE_PAGER_v2.md
    03_primary_content/DIST_ARTICLE_01_LIPSKO.md
    _source_data/charts/CHART_COAL_PRICE_v1.json
  book/
    build.py                 ← PDF pipeline (still active, unaffected by this change)
    requirements.txt
    .venv-book/              ← Python venv (gitignored)

apps/web/                    ← web project (this repo)
  dpbp-config.json           ← OLD MODEL — only drives the legacy sync, not current authoring
  scripts/sync-dpbp.mjs      ← OLD MODEL sync engine
  scripts/setup-dpbp.mjs     ← one-time machine setup (for the legacy sync only)
  .env.local                 ← DPBP_SOURCE path (gitignored, per-machine)
```

**`npm run sync:dpbp` fully overwrites `_meta.json`** using a hardcoded field list (`id, slug, title, accent, author, date, cardOrder, onePager, articles[], intro{title,textBefore,textAfter}`) that does **not** know about `introChart`, `tiles`, or `intro.textClosing`. Running it on a chapter that has been migrated to the current pipeline will silently destroy those fields (the `.mdx` files themselves survive — the sync script never deletes unlisted files — but they'll be orphaned because `tiles` referencing them is gone). **Do not run this script** until/unless it's rewritten to match the current schema. The book PDF pipeline (`book/build.py`) is unaffected and still reads directly from `data-pro-premierku`.

---

## First-time setup on a new machine

### Web project

```bash
cd apps/web
npm install
npm run setup:dpbp
# → prompts for the path to your local data-pro-premierku checkout
# → writes DPBP_SOURCE=/your/path to .env.local (gitignored)
```

Or pass the path directly:

```bash
npm run setup:dpbp -- /home/you/dev/ms/dpbp/data-pro-premierku
```

Then pull generated content that was committed by the other developer:

```bash
git pull
# _content/ and public/dpbp/charts/ are in the repo, so you get them for free
```

After that, you can run the dev server immediately (`npm run dev`) without needing the source project at all — the generated content is already in the repo.

### Book pipeline (PDF)

Requires Python 3.11+ and Ghostscript.

```bash
cd data-pro-premierku

# Create and activate a virtual environment
python3 -m venv .venv-book
source .venv-book/bin/activate          # Linux/macOS
# .venv-book\Scripts\activate           # Windows

pip install -r book/requirements.txt

# Download fonts (once, stored locally in book/styles/fonts/)
python book/download_fonts.py

# Install Playwright browser (used for rendering impact cards)
playwright install chromium

# Install Ghostscript system package (for CMYK export)
# Ubuntu/Debian:  sudo apt install ghostscript
# macOS:          brew install ghostscript
```

---

## Day-to-day: syncing content updates

When the source project has new or revised content:

```bash
cd apps/web
npm run sync:dpbp
```

What the sync does:
- Reads `dpbp-config.json` to know which chapters and articles to include
- Reads `BOOK.md` YAML front-matter to extract impact cards (big-number stat cards)
- Transforms Markdown → MDX (extracts title/excerpt for card preview, strips book-only blocks, replaces chart placeholders with `<VegaChart>` components)
- Copies Vega-Lite chart JSON files to `public/dpbp/charts/`
- Writes `_content/{chapter-slug}/` with `_meta.json`, `articles/*.mdx`, `cards/*.json`

Missing files are reported as warnings — a chapter with one missing article still syncs the rest.

After sync, commit the generated files and push:

```bash
git add app/specialy/data-pro-budouci-premierku/_content public/dpbp/charts
git commit -m "DPBP: sync chapter 03 after one-pager v2 update"
git push
```

The other developer runs `git pull` and gets the updated content without needing the source project.

For a one-off run without changing `.env.local`:

```bash
DPBP_SOURCE=/path/to/source npm run sync:dpbp
```

---

## Common update tasks

### Update an article to a new version

In `dpbp-config.json`, change `sourceFile` for the article:

```json
{ "slug": "01-lipsko", "sourceFile": "DIST_ARTICLE_01_LIPSKO_v2.md", ... }
```

Then re-run `npm run sync:dpbp`.

### Update a one-pager

Same pattern — change `onePager.sourceFile`:

```json
"onePager": { "slug": "one-pager", "sourceFile": "PM_ONE_PAGER_v3.md", "logo": "..." }
```

### Add a new chart to an article

In `dpbp-config.json`, add the chart filename (with version suffix) to `articles[].charts`:

```json
{ "slug": "01-lipsko", "charts": ["CHART_COAL_PRICE_v1", "CHART_NEW_v1"] }
```

The public name strips the `_v1` suffix: `CHART_NEW_v1.json` → `public/dpbp/charts/CHART_NEW.json`.

To use the chart in the article, add `<VegaChart chartId="CHART_NEW" />` in the source Markdown.

### Update impact cards (big-number stat cards)

Cards are defined in `BOOK.md` YAML front-matter, under `chapters[].impact_cards`. Edit them there and re-run `npm run sync:dpbp` — the sync reads BOOK.md and regenerates all `cards/*.json` files automatically. No separate JSON files to maintain.

### Add a new chapter to the web

1. Add an entry to `dpbp-config.json` (see Config reference below).
2. Add the chapter's impact cards to `BOOK.md` under that chapter's `impact_cards:` key.
3. Create `public/dpbp/chapters/{id}.svg` (dot-pattern isotype, see Logo convention).
4. Update the `CHAPTERS` array in `app/specialy/data-pro-budouci-premierku/page.tsx`: set `available: true` and the correct `href`.
5. Run `npm run sync:dpbp`.

---

## Generating the PDF book

All commands run from `data-pro-premierku/`, with `.venv-book` activated.

```bash
source .venv-book/bin/activate

# Full book (all chapters) — produces RGB and CMYK PDF
python book/build.py

# Single chapter — fast preview
python book/build.py --chapter 01

# Multiple specific chapters
python book/build.py --chapter 01 03 08

# Skip re-rendering charts (reuse cached PNGs from previous run)
python book/build.py --skip-charts

# Skip CMYK conversion (faster, no Ghostscript needed)
python book/build.py --no-cmyk
```

Output files appear in `book/output/`:
- `book_v{version}.pdf` — RGB (screen/web)
- `book_v{version}_CMYK.pdf` — CMYK (print-ready)

The version string comes from `book.version` in `BOOK.md`.

### What the build pipeline does

| Step | Tool | Input | Output |
|------|------|-------|--------|
| A | vl-convert-python | Vega-Lite JSON specs from `BOOK.md` | `book/output/assets/charts/*.png` |
| B | Jinja2 | `book/templates/impact_card.html` + card data from `BOOK.md` | HTML snippets |
| C | markdown-it-py | `DIST_ARTICLE_*.md` files | Chapter HTML |
| D | Jinja2 | `book/templates/base.html` + all chapter HTML | Master HTML |
| E | WeasyPrint | Master HTML + CSS | `book_vX.Y.pdf` |
| F | Ghostscript | RGB PDF | `book_vX.Y_CMYK.pdf` |

### Relationship to the web sync

The web sync and the book build are **independent** — they both read the same source Markdown and chart files, but transform them differently. The web sync produces MDX + JSON for Next.js; the book build produces a print PDF. You can update one without affecting the other.

---

## Config reference: `dpbp-config.json`

| Field | Description |
|-------|-------------|
| `id` | Two-digit chapter number (`"01"`) — used in headers and to match BOOK.md |
| `slug` | URL path segment (`/specialy/data-pro-budouci-premierku/{slug}`) |
| `title` | Chapter title in the web header |
| `accent` | Brand color for this chapter (hex) |
| `sourceDir` | Top-level directory name in the source project |
| `author` | Default author string for all articles |
| `date` | Default publication date (`YYYY-MM-DD`) |
| `onePager.sourceFile` | Filename inside `02_executive_briefs/` — pin to a specific version |
| `onePager.logo` | Public path to the chapter SVG logo |
| `articles[].slug` | URL segment for the article page |
| `articles[].sourceFile` | Filename inside `03_primary_content/` |
| `articles[].primaryChart` | Chart ID shown as the article card thumbnail (pubName, no `_v1`) |
| `articles[].charts` | Source chart filenames to copy (include version suffix, e.g. `CHART_X_v1`) |
| `intro.title` | Headline for the chapter intro block (see "Landing page structure" below) |
| `intro.textBefore` | Intro paragraph #1 — frames the common/political assumption |
| `intro.textAfter` | Intro paragraph #2 — the actual finding, reframing `textBefore` against the number/chart |

**Impact cards** (`cardOrder`) are no longer in `dpbp-config.json` — they come from `BOOK.md` automatically.

**`intro` is optional.** Omit it for a chapter and the intro block simply doesn't render — the page falls back to just the one-pager card + article pairs.

**Pinning versions:** Update `sourceFile` here when you want to publish a new version. The source project can have newer drafts that are not yet published on the web.

---

## Landing page structure

Every chapter landing page (`/specialy/data-pro-budouci-premierku/{chapter}`, rendered by `[chapter]/page.tsx`) follows the same fixed structure top to bottom. This applies uniformly across all chapters — when adding a new chapter, replicate this exact order rather than improvising a new layout.

1. **Header (banner)** — full-bleed navy (`#101432`) box. Breadcrumb "Data pro budoucí premiérku · Kapitola {id}" (crimson `#de1743` link, inverts to navy-on-crimson on hover/focus), chapter title in `#f8f6f0` (`Roboto Slab`, `2rem`, `800`), and a 48×3px accent rule in the chapter's brand color.
2. **Titulek** — `intro.title` in `_meta.json`. A hook specific to the chapter's central tension — not the chapter name again. See [`DPBP_WRITING_GUIDE.md`](./DPBP_WRITING_GUIDE.md) for title patterns and why not to force the same formula every time.
3. **Text (problem framing)** — `intro.textBefore`. One paragraph, narrative, grounded in a real quote/promise/common assumption. A flowing scene or argument, not a bullet list, that sets up what people *think* is going on.
4. **Číslo v boxu (number box)** — the chapter's first `ImpactCard` (`cardOrder[0]`), reused as-is — no separate component needed; its big-number layout already matches this slot.
5. **Text (reframe)** — `intro.textAfter`. The actual finding: takes the number from step 4 and uses it to overturn or complicate the framing from step 3.
6. **První graf (first chart)** — `introChart` from `_meta.json`, rendered full-size via `<VegaChart spec={...} />` (not `mini`).
7. **Text (closing)** — `intro.textClosing`. Wraps up the intro and bridges into the tiles below — often a one-sentence preview of what the international-comparison tiles cover.

After step 7: a full-width "Shrnutí" tile (the one-pager), then 4 pairs of tiles (8 total) in a 2-column grid, driven by `tiles` in `_meta.json` — see schema above for the fixed editorial order (Explainer/Svět, mezinárodní kontext/Analýza, Analýza/Analýza, Investigace/Komparace).

**Writing intro and tile text:** Don't invent new claims — ground them in `RESEARCH_AUDIT*.md` / `DIST_ARTICLE_*.md` in `data-pro-premierku`, or in verifiable institutional sources (OECD, Eurostat, NATO, national statistical offices) when covering a foreign comparison not in the source project. See [`DPBP_WRITING_GUIDE.md`](./DPBP_WRITING_GUIDE.md).

**Chapter 02 (Demografie) is the one exception**: it predates this system and lives as a standalone article (`app/clanek/_articles/data-pro-budouci-premierku-02-demografie/demografie-hub.html`) with `htmlInclude`, not in `_content/`. It replicates the same visual structure (steps 1–7) by hand in raw HTML/CSS — keep both in sync manually if the shared styling (header colors, hover states, card transitions) changes.

---

## Routing

| URL | File |
|-----|------|
| `/specialy/data-pro-budouci-premierku` | `app/specialy/data-pro-budouci-premierku/page.tsx` |
| `/specialy/data-pro-budouci-premierku/{chapter}` | `app/specialy/data-pro-budouci-premierku/[chapter]/page.tsx` |
| `/specialy/data-pro-budouci-premierku/{chapter}/{article}` | `app/specialy/data-pro-budouci-premierku/[chapter]/[article]/page.tsx` |

## Key components

| Component | Purpose |
|-----------|---------|
| `components/dpbp/ImpactCard` | Big-number stat card (data from `_content/{ch}/cards/*.json`) |
| `components/dpbp/DpbpArticleCard` | Article preview card with chart or logo thumbnail |
| `components/dpbp/VegaChart` | Lazy-loaded Vega-Lite chart (SSR-safe client component) |
| `components/dpbp/VegaChartImpl` | Vega-embed wrapper; handles concat spec sizing and title rendering |

## Chapter logo convention

SVG files in `public/dpbp/chapters/` are dot-pattern isotypes. Each uses:
- `viewBox="-10 -10 220 220"`
- `<rect x="-10" y="-10" width="220" height="220" fill="#101432"/>` as background
- Colored `<circle r="4.5"/>` elements on a 15px grid (cx/cy multiples of 15 + offset)

The same patterns are also defined as inline JSX in the landing page (`page.tsx`). When updating a logo, change both files.
