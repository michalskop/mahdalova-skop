# Coding conventions

- Write all new or edited code comments and documentation comments in English.
- Keep user-facing content in its intended language; this rule does not require translating Czech website copy.

## Article images

- Cover headlines, subtitles and claims use IBM Plex Serif; kickers/top tags use IBM Plex Sans. Preserve the existing wordmark typography.

- For cover creation or editing, follow `tools/COVER-EDITOR.md` and reuse an existing `cover-project.json` when available.
- Use the shared renderer (`tools/render-covers.py` or `npm run covers`) for homepage, OG, square and Instagram exports. Keep the original image and editable project; publish the complete raster exports.
- Review the generated variants for readability and cropping. Make targeted project edits instead of creating a new renderer or rebuilding every variant manually.
