# Coding conventions

- Write all new or edited code comments and documentation comments in English.
- Keep user-facing content in its intended language; this rule does not require translating Czech website copy.

## Writing articles (hard rule)

- Before drafting or substantially editing any article text, READ `docs/redakcni-styl/REDAKCNI_MANUAL.md` in full (at minimum Parts II, III, VI and the Part VII checklist); for data articles also `docs/redakcni-styl/STYL_DATOVA_ZURNALISTIKA.md`. The manual is binding for every author and every AI tool.
- Recompute every number in text, tables and charts from primary data with a script kept in the article's `_data_pipeline/`. Never copy numbers from screenshots, working tools or AI summaries.
- Verify every named person's current party and function in the official registry (e.g. ČSÚ candidate lists) as of the publication date.
- The headline rests on the strongest hypothesis the data support, not the most attractive one; always test "the values are real" before calling something an error; explain the method in plain Czech; give affected parties a chance to respond.
- No screenshots of working tools as covers or in-text images; interactive embeds use the binding palette, no emoji, no working labels.
- `npm run check:articles --workspace=apps/web` must pass. It also runs in the pre-commit hook and in `prebuild`, so a failing article blocks the Cloudflare deploy. Never weaken or bypass the checker; fix the article or ask Kateřina.

## New articles and URLs (hard rule)

- Before creating or renaming any article folder, ASK the user for the URL slug and the rubric (`filter` + special). Never choose or "improve" a slug yourself.
- Slug format: `<rubrika>-<YYYY-MM-DD>-<popis>`, e.g. `kontext-2026-08-02-novinar-nema-vyvazovat-ale-overovat`. A slug without rubric and date is an error.
- Changing a published URL: add 301s to `apps/web/public/_redirects`, fix internal links, regenerate sitemap/llms.txt, and keep the old URL redirecting.
- Canonical rule: `docs/redakcni-styl/REDAKCNI_MANUAL.md` → *Před založením článku: URL a rubrika*.

## Article images

- Every new article gets the full cover set without being asked: `cover-homepage` 1500×1200 (`coverImage` + `homepageImage`), `cover-og.jpg` 1200×630 ≤ 300 kB (`ogImage`), `cover-square` 1080×1080 (`squareImage`), `cover-instagram` 1080×1350, `cover-story` 1080×1920. Show a crop contact sheet to the user before publishing. Cover headline lives in the frontmatter as `coverTitulek` (generator reads it); render only with `tools/cover-generator.cjs`, which checks composition and writes `<config>.razitko.json` (commit it) – `checkArticles.js` blocks stale or hand-edited covers (`tools/COVER-EDITOR.md` → *Automatické pojistky*).
- Fonts (hard rule since 2026-10-12): IBM Plex Serif Bold ONLY for the headline and the „DataTimes.cz“ logo text; everything else (cover tag, pre-title, subtitle, legend, icon labels) IBM Plex Sans.
- Cover tag: uppercase letter-spaced Plex Sans, first part crimson `#de1743` with an underline ending mid-last-letter, then „•“ and the rest white (e.g. `VOLEBNÍ KALKULAČKA • KOMUNÁLNÍ A SENÁTNÍ VOLBY 2026`); mirrored when right-aligned.
- Homepage cover anchors: text starts at x 180 / y 120, logo bottom-right of the safe zone (1320, 1080), the area x ≥ 950, y ≤ 280 stays EMPTY (the site overlays the rubric badge there). OG: motif in or near the centre, all text and the logo inside the central 630×630 square with a 35 px margin (x 320–880); full rules in `tools/COVER-EDITOR.md` → *Kompozice podle formátu*. Colours only exact values from the binding palette in `packages/ui/DESIGN.md`.
- Composition: the motif (map, photo) fills the cover – scale maps up from the bottom-right towards the top-left; text, legend and logo may sit on top of it (readability via the navy blurred `halo` under small text). A small map floating in empty space is a mistake. Put the DataTimes.cz logo in whichever bottom corner is calmer so it never gets lost (Czech map: bottom-left under Šumava, legend bottom-right; generator option `logo: 'vlevo'`); default bottom-right.
- Data/graphic covers: write `_cover_pipeline/cover.config.cjs` in the article and run `tools/cover-generator.cjs` (copy a model config: `volby-cr-2026-10-10-senat-komunalni-2026-predikce-vysledky`, `…-predikce`, `…-volebni-kalkulacka-73-mest-a-senat`, `volby-brazilie-2026-10-04-prvni-kolo-vyhrava-bolsonaro`). Do not write a new renderer.
- Photo covers: follow `tools/COVER-EDITOR.md` and reuse an existing `cover-project.json` when available; use the shared renderer (`tools/render-covers.py` or `npm run covers`). Keep the original image and editable project; publish the complete raster exports.
- Standard = an eye-catching, playful cover that looks like a sibling of our existing covers (elections: dot map of Czechia with city/district points, series icons). A bare bar chart or a lone number on an empty background is NOT acceptable as the motif. Mandatory: DataTimes.cz logo, cover tag (eyebrow), Plex Serif headline, Plex Sans subtitle/legend. If `tools/cover-generator.cjs` is missing in the branch, merge `origin/main` first – never improvise a cover with PIL/matplotlib/default fonts.
- Full brief with all rules: `tools/PROMPT-COVER.md`.
- Review the generated variants for readability and cropping. Make targeted project edits instead of creating a new renderer or rebuilding every variant manually.
