# Public media carousel

Ten portrait slides, including the shared generator's automatic support slide.
Four timeline slides group 1994/2009, the two 2017 proposals, the 2018/2025 commitments,
and the 2026 government proposal and first reading. The fee chart uses the article's
Vega-Lite specification without changing its data or line geometry.

Run from the repository root with the shared generator's Playwright/Edge setup:

```bash
ARTICLE=apps/web/app/clanek/_articles/kontext-2026-11-03-doba-35-let-politickych-pokusu-ochocit-media
node "$ARTICLE/_cover_pipeline/motiv.cjs"
node "$ARTICLE/_cover_pipeline/carousel-chart.cjs"
node tools/carousel-generator.cjs "$ARTICLE/_cover_pipeline/carousel.config.cjs"
cp "$ARTICLE/_cover_pipeline/carousel-caption.txt" "$ARTICLE/social/carousel/caption.txt"
```

`carousel-caption.txt` is the Instagram caption. `carousel-assets.json` records
the uploaded files, their CDN addresses, dimensions, content types and SHA-256 hashes.
The ZIP contains `01.png` through `10.png` and `caption.txt` in upload order.
Generated raster files remain in the ignored `social/` directory.

Funding amounts are checked by `_data_pipeline/verify_facts.py` against bill 231/0
and the broadcasters' planned 2026 fee revenues. The comparison is approximately
15.19% less than planned fee revenues, not total budgets. The radio contribution
rounds to CZK 2.066 billion. The first reading slide deliberately avoids 04:36:
that timestamp marked the end of the debate, before the subsequent votes.

All ten exports were checked at 1080 × 1350, the brand fonts loaded successfully,
the generator reported no text collisions, and the final support QR decoded to
the URL in `SupportBanner.tsx`. Uploaded files were downloaded again and their
content hashes compared with the local originals.
