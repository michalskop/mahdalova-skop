# Skutečná velikost

React client component embedded by `<TrueSizeGame />` in the existing Markdown article. The surrounding article copy is maintained separately.

- One board, five anonymous outlines spread across the map; the first round includes Greenland.
- Search adds named countries to the same board; the silhouette dock selects and drags individual pieces.
- Dragging near home aligns the original geometry. Only **✓ Ověřit** records an attempt.
- A correct check locks the country at home in brand forest green (`#639e0a`). An incorrect check reveals its name and locks it at home in brand orange (`#f76800`).
- Score is correct checks / all checks. Each piece can be checked once. Removing pieces does not rewrite past attempts; a new game resets the score.
- Restart offers 5, 10, or 15 countries. At most 20% of the new round repeats the previous round, including countries removed from the board. Search additions do not change the previous-round record.
- Rounds represent at least four continents for five countries, or five continents for larger rounds. Latin America contributes at least one country, or two in larger rounds. These constraints are checked together with the repetition limit.
- Six projections; Mercator by default. Projection changes keep geographic positions.
- Original Natural Earth boundaries are rotated rigidly on the sphere and then projected. Areas in the optional country detail are approximate spherical calculations, not official statistics.

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

The geometry check covers all countries, spherical area preservation, exact home geometry, projection inverses, the antimeridian, equal-area projections, snap tolerance, and balanced country selection. Browser checks must also cover both check outcomes, repeat checks, search, dock selection, drag, and mobile layout.
