# Coding conventions

- Write all new or edited code comments and documentation comments in English.
- Keep user-facing content in its intended language; this rule does not require translating Czech website copy.

## New articles and URLs (hard rule)

- Before creating or renaming any article folder, ASK the user for the URL slug and the rubric (`filter` + special). Never choose or "improve" a slug yourself.
- Slug format: `<rubrika>-<YYYY-MM-DD>-<popis>`, e.g. `kontext-2026-08-02-novinar-nema-vyvazovat-ale-overovat`. A slug without rubric and date is an error.
- Changing a published URL: add 301s to `apps/web/public/_redirects`, fix internal links, regenerate sitemap/llms.txt, and keep the old URL redirecting.
- Canonical rule: `docs/redakcni-styl/REDAKCNI_MANUAL.md` → *Před založením článku: URL a rubrika*.

## Article images

- Cover headlines, subtitles and claims use IBM Plex Serif; kickers/top tags use IBM Plex Sans. Preserve the existing wordmark typography.

- For cover creation or editing, follow `tools/COVER-EDITOR.md` and reuse an existing `cover-project.json` when available.
- Use the shared renderer (`tools/render-covers.py` or `npm run covers`) for homepage, OG, square and Instagram exports. Keep the original image and editable project; publish the complete raster exports.
- Review the generated variants for readability and cropping. Make targeted project edits instead of creating a new renderer or rebuilding every variant manually.
