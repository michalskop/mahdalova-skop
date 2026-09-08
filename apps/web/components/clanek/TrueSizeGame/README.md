# Skutečná velikost

React client component embedded by `<TrueSizeGame />` in the existing Markdown article. The surrounding article copy is maintained separately.

- A new reload draws five anonymous countries from a 57-country pool. Each round uses the same rules: at least four continents for five pieces, at least five for 10/15, and no more than 20% repeated countries. The previous round is remembered in sessionStorage when available.
- Rounds of 10/15 include at least two Latin American countries (Mexico, Brazil, Argentina, Peru, Bolivia, Colombia, Chile). Five-piece rounds include at least one.
- Initial positions use randomized candidate locations and minimize bounding-box overlap. Larger shapes are placed first; subsequent shapes favour available space. Dense 15-piece rounds can still have some overlap.
- Search adds named countries to the current viewport. Dock selection, pointer dragging, keyboard movement, touch pinch zoom and the taller mobile viewport are preserved.
- Near-home dragging snaps and records a correct result. Manual verification reveals an incorrect answer in orange; correct answers are green.
- Six projections, Mercator by default. Full-width descriptions remain visible and type out in roughly one second, restarting with each projection. Reduced-motion preference shows the text immediately.
- Map sharing and hash state serialization have been removed.
- Crimea is dissolved into Ukraine with TopoJSON merge before projection, leaving no shared internal boundary in either basemap or draggable silhouettes.
- Country details use a consistent comparison: approximate area relative to Czechia and average population per km², alongside flag, capital and population. These comparisons derive from the same simplified map geometry and rounded population estimates in facts.ts; they are educational approximations, not official area/density statistics. Population distribution within a country is uneven.

## Local development

From the repository root:

```sh
npm ci
npm run dev --workspace=web
```

Use **http://localhost:3001/clanek/kontext-2026-09-05-skutecna-velikost-sveta**. Stop an existing development server before restarting or building in the same checkout. No other port is needed.

## Verification

```sh
npm run qa:true-size --workspace=web
npx tsc --noEmit -p apps/web/tsconfig.json
npm run lint --workspace=web -- --file components/clanek/TrueSizeGame/TrueSizeGame.tsx --file components/clanek/TrueSizeGame/geometry.ts
```

The geometry check covers all countries, spherical area preservation, exact home geometry, projection inverses, the antimeridian, equal-area projections, snap tolerance, the dissolved Ukraine geometry and 3,000 rounds with diversity, Latin America and repetition constraints. Browser checks must also cover both check outcomes, repeat checks, search, dock selection, drag, and mobile layout.
