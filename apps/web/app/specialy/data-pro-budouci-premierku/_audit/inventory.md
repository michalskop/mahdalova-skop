# DPBP Inventory Report (as of 2026-07-27)

---

## 1. Chapter + Article Inventory

**Summary:** 15 chapters, 151 articles (17 + 9×13 + 17 = 151).

| Chapter | Articles | Notes |
|---------|----------|-------|
| 01-demografie | 17 | Above norm (9) |
| 02-zdravotnictvi-a-pece | 9 | |
| 03-nedostupnost-bydleni | 9 | |
| 04-regionalni-propasti | 9 | |
| 05-uroven-vzdelavani | 9 | |
| 06-ekonomicka-nerovnost | 9 | |
| 07-ai-a-trh-prace | 9 | |
| 08-digitalizace-a-inovace | 9 | |
| 09-energie-a-energeticka-bezpecnost | 9 | |
| 10-klimaticka-zmena | 9 | |
| 11-bezpecnost-a-konflikty | 9 | |
| 12-informacni-manipulace | 9 | |
| 13-oligarchizace-a-korupce | 9 | |
| 14-verejne-finance-a-dane | 9 | |
| 15-efektivni-vladnuti | 17 | Above norm (9) |

**Chapters with above-norm article counts:**
- 01-demografie: 17 articles (01-proc-klesa-plodnost, 02-co-znamena-plodnost, 03-svet-populace, 04-skandinavska-past, 05-cas-rodicovstvi, 06-zeny-rozhodovani, 07-kohortni-plodnost, 08-politicke-sliby, 09-pary-a-partnerstvi, 10-data-porody, 11-vylidnovani-obci, 12-mezinarodni-srovnani, 13-generace-z, 14-vzdelanostni-propast, 15-volicska-zakladna, 16-starnuti-populace, 17-migrace-demografie)
- 15-efektivni-vladnuti: 17 articles (01-obstrukce, 02-dochazka, 03-hlasovani-rebelovani, 05-overili-480-hodin, 06-francie-programovany-cas, 07-obstrukce-2026, 08-prezidentske-cesty, 09-milosti, 10-prezidentska-veta, 11-duvera-stat-vs-politika, 12-duvera-samosprava, 13-duvera-svet, 14-duvera-spolecnost, evropa-europarlament, explainer-obstrukce, one-pager, svet-britanie-speaker)

---

## 2. ChapterRail Call Sites + Variants

### Call Sites

| File | Line | Variant | Props |
|------|------|---------|-------|
| `apps/web/app/specialy/data-pro-budouci-premierku/[chapter]/page.tsx` | 172 | `hero` | `chapterContents` |
| `apps/web/app/specialy/data-pro-budouci-premierku/[chapter]/[article]/page.tsx` | 140–146 | `hero` | `chapterContents`, `alwaysCompact=true`, `theme="light"` |

### Defined Variants (in ChapterRail.tsx)

| Variant | Type | Used? | CSS Class | Notes |
|---------|------|-------|-----------|-------|
| `hero` | ✓ Union type | **USED** (2 call sites) | (inline) | Default rendering path |
| `article` | ✓ Union type | **UNUSED** | `.stickyArticle` | Default value at line 22; never passed explicitly |
| `landing` | ✓ Union type | **UNUSED** | `.landing` | Never passed; variant branch at line 297 unreachable |

### Dead Code

- **Line 297** in ChapterRail.tsx: `className={...variant === 'landing' ? styles.landing : styles.article}` — the `.landing` CSS class is never applied (variant is always `'hero'`).
- **Line 471** in ChapterRail.tsx: `{variant === 'article' && ...}` — this entire block never renders.
- **ChapterRail.module.css**: `.stickyArticle`, `.stickyLanding`, and related CSS rules (lines ~924–941) are unreferenced.

---

## 3. _meta.json Reference Validation

**Validation script output:**
```
165 references checked, 0 missing.
```

All article slugs referenced in `_meta.json` files exist in their corresponding `articles/` directories. The validator now also covers `onePager.slug` and `postSupportTiles[].slug` (plus their `related[].slug`), previously ignored fields that are rendered by `[chapter]/page.tsx`.

**Details:**
- 15 `_meta.json` files scanned.
- 165 unique article references (openerArticle, tiles + related, onePager, postSupportTiles + related).
- 0 missing files.
- Status: ✅ PASS

---

## 4. Placeholders / TODO / "Coming Later"

### Audio Placeholder
- **File:** `apps/web/components/dpbp/ArticleByline.tsx:108`
- **Text:** `<div className={styles.lbl}><b>Poslechnout článek</b><br />audio doplníme</div>`
- **Status:** Placeholder active on all articles.

### Maps Promise
- **File:** `apps/web/app/specialy/data-pro-budouci-premierku/_content/01-demografie/articles/11-vylidnovani-obci.mdx:38`
- **Text:** "Datové řady 1869–2021 aktualizujeme o poslední roky bilance obyvatelstva ČSÚ; nové interaktivní mapy Česka a Rakouska pro tento speciál připravujeme a doplníme je sem po dokončení."
- **Status:** Placeholder — maps not yet delivered.

### TODOs / FIXMEs
- None found.

### Other Placeholders
- None found in article content (checked for "coming", "to be added", "bude přidáno", "připravujeme", "brzy" — only legitimate uses in context found, e.g. "brzy oslaví padesátiny").

---

## 5. Duplicate Detection

### Duplicate Titles
- None found.

### Duplicate Slugs
- `03-odolnost` — appears in chapters 11-bezpecnost-a-konflikty, 12-informacni-manipulace (expected: same article name in different chapters).
- `one-pager` — appears in all 15 chapters (expected: standard naming convention for single-pager articles).

**Status:** No problematic duplicates.

---

## 6. Chart File Inventory

Charts are loaded from `/specialy/dpbp/charts/${chartId}.json` (per VegaChartImpl.tsx:169), which resolves to the static directory `apps/web/public/specialy/dpbp/charts/`. The previous version of this section claimed that directory did not exist — that was wrong; the earlier check searched the repo root instead of `apps/web/`.

**Directory:** `apps/web/public/specialy/dpbp/charts/` — 42 spec files.

**References collected from:** `chartId="..."` in `.mdx`, `primaryChart:` in article frontmatter, and `"introChart"` in `_meta.json`.

| Prefix | Spec files |
|--------|-----------:|
| `CHART_` | 24 |
| `GRAF_` | 12 |
| `DIGI_` | 3 |
| `G09_` | 3 |
| **Total** | **42** |

**Validation result:** 41 referenced, 0 dangling, 1 orphan.

- Dangling (referenced, no spec file): none.
- Orphan (spec file, referenced by nobody): `CHART_MILOSTI_KUMULATIVNE.json`.

Note: `GRAF_07_LOBBY_FLOW` and `GRAF_15_SNEMOVNA_TEMPO`, flagged as "not found" in the previous version of this section, are in fact referenced (via `chartId`/`primaryChart` and `introChart` respectively) — that earlier check only grepped article bodies and missed frontmatter and `_meta.json`.

---

## 7. DPBP Component List

Removed — the call-site attributions in the previous version were not derived from grep and were partly incorrect. Component call-site mapping is part of task T3.

---

## Summary

| Metric | Count | Status |
|--------|-------|--------|
| **Chapters** | 15 | ✅ Complete |
| **Articles** | 151 | ✅ Complete |
| **_meta.json references** | 165 | ✅ All valid |
| **Missing references** | 0 | ✅ None |
| **ChapterRail variants defined** | 3 (`hero`, `article`, `landing`) | ⚠️ 2 unused |
| **ChapterRail variants used** | 1 (`hero` only) | ⚠️ Dead code |
| **Dead CSS classes** | 3+ (`stickyArticle`, `stickyLanding`, etc.) | ⚠️ Orphaned |
| **Placeholders** | 2 (audio + maps) | ⚠️ In content |
| **Chart specs / referenced / dangling / orphan** | 42 / 41 / 0 / 1 | ⚠️ 1 orphan (`CHART_MILOSTI_KUMULATIVNE`) |
| **Duplicate slugs (expected)** | 2 | ✅ OK |
| **Duplicate titles** | 0 | ✅ None |
| **TODOs / FIXMEs** | 0 | ✅ None |

---

**Report generated:** 2026-07-27 (Haiku, T0 inventory task)
