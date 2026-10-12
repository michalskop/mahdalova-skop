# Coding conventions

- Write all new or edited code comments and documentation comments in English.
- Keep user-facing content in its intended language; this rule does not require translating Czech website copy.

## New articles and URLs (hard rule)

- Before creating or renaming any article folder, ASK the user for the URL slug and the rubric (`filter` + special). Never choose or "improve" a slug yourself.
- Slug format: `<rubrika>-<YYYY-MM-DD>-<popis>`, e.g. `kontext-2026-08-02-novinar-nema-vyvazovat-ale-overovat`. A slug without rubric and date is an error.
- Changing a published URL: add 301s to `apps/web/public/_redirects`, fix internal links, regenerate sitemap/llms.txt, and keep the old URL redirecting.
- Canonical rule: `docs/redakcni-styl/REDAKCNI_MANUAL.md` → *Před založením článku: URL a rubrika*.

## Article images

- Every new article gets the full cover set without being asked: `cover-homepage` 1500×1200 (`coverImage` + `homepageImage`), `cover-og.jpg` 1200×630 ≤ 300 kB (`ogImage`), `cover-square` 1080×1080 (`squareImage`), `cover-instagram` 1080×1350, `cover-story` 1080×1920. Show a crop contact sheet to the user before publishing.
- Fonts (hard rule since 2026-10-12): IBM Plex Serif Bold ONLY for the headline and the „DataTimes.cz“ logo text; everything else (cover tag, pre-title, subtitle, legend, icon labels) IBM Plex Sans.
- Cover tag: uppercase letter-spaced Plex Sans, first part crimson `#de1743` with an underline ending mid-last-letter, then „•“ and the rest white (e.g. `VOLEBNÍ KALKULAČKA • KOMUNÁLNÍ A SENÁTNÍ VOLBY 2026`); mirrored when right-aligned.
- Homepage cover anchors: text starts at x 180 / y 120, logo bottom-right of the safe zone (1320, 1080), the area x ≥ 950, y ≤ 280 stays EMPTY (the site overlays the rubric badge there). OG: headline and logo inside the central 630×630 square. Colours only exact values from the binding palette in `packages/ui/DESIGN.md`.
- Data/graphic covers: write `_cover_pipeline/cover.config.cjs` in the article and run `tools/cover-generator.cjs` (copy a model config: `volby-cr-2026-10-10-senat-komunalni-2026-predikce-vysledky`, `…-predikce`, `…-volebni-kalkulacka-73-mest-a-senat`, `volby-brazilie-2026-10-04-prvni-kolo-vyhrava-bolsonaro`). Do not write a new renderer.
- Photo covers: follow `tools/COVER-EDITOR.md` and reuse an existing `cover-project.json` when available; use the shared renderer (`tools/render-covers.py` or `npm run covers`). Keep the original image and editable project; publish the complete raster exports.
- Full brief with all rules: `tools/PROMPT-COVER-PRO-MICHALA.md`.
- Review the generated variants for readability and cropping. Make targeted project edits instead of creating a new renderer or rebuilding every variant manually.
