// Output size presets for social-cards.
//
// Sources for the numbers below are current (2026) third-party format guides,
// not official platform documentation — X, Meta and Bluesky don't publish
// exact pixel specs. Treat these as "safe, currently-recommended defaults",
// re-check before a redesign if a platform visibly changes its layout.
//
// - X: multi-image posts (up to 4) render in a fixed grid today; X has said
//   it is moving multi-image posts to a swipeable carousel, which is why we
//   render x-square at a plain 1:1 — it survives both layouts without
//   cropping surprises. X also crops from the *center*, so keep headline and
//   stat text inside the middle ~70% of the frame (the template already does
//   this by padding on all sides).
// - Bluesky: up to 4 images/post, no strict pixel enforcement but a 1MB
//   per-image budget — keep PNGs reasonably light (flat colors, no photos).
// - Instagram/Threads carousel: current guidance favors 4:5 portrait over
//   square (more vertical space in the feed); the *first* slide's aspect
//   ratio locks every other slide in the carousel, so never mix ratios
//   within one carousel set.
export const PRESETS = {
  og: {
    width: 1200,
    height: 630,
    label: 'OG / odkazový náhled (X reply, Bluesky link post, Threads, Facebook)',
  },
  'x-square': {
    width: 1200,
    height: 1200,
    label: 'X vícefoto set (max 4 v jednom příspěvku), 1:1',
  },
  'bluesky-landscape': {
    width: 1200,
    height: 675,
    label: 'Bluesky samostatný obrázek, 16:9',
  },
  'bluesky-square': {
    width: 1080,
    height: 1080,
    label: 'Bluesky vícefoto set (max 4), 1:1',
  },
  'ig-portrait': {
    width: 1080,
    height: 1350,
    label: 'Instagram/Threads carousel, 4:5 (doporučený poměr 2026)',
  },
  'ig-story': {
    width: 1080,
    height: 1920,
    label: 'Instagram/Threads Stories, 9:16',
  },
};

export function resolvePreset(name) {
  const preset = PRESETS[name];
  if (!preset) {
    const known = Object.keys(PRESETS).join(', ');
    throw new Error(`Neznámý formát "${name}". Známé formáty: ${known}`);
  }
  return preset;
}
