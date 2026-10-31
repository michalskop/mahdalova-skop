// English cover set (datatimes.org) – node tools/cover-generator.cjs <this file>
// Motif: bubble map of Serbian municipalities, circle = municipality (area ∝ voters), colour = who leads according to the prediction.
// The motiv-*.svg files are drawn by ../../elections-serbia-2026-10-26-why-vucic-lost/_cover_pipeline/motiv.cjs (same map as the
// analysis, copied from the Czech article volby-srbsko-2026-10-25-predikce; only the label "Kosovo" is in the motif, same in English).
// Kosovo: own dashed border, no Serbian shadow, semi-transparent circles (convention of the Czech article, Kateřina 29 Oct 2026).
// Headline and dek come from the frontmatter (coverTitulek / coverPodtitulek).
const path = require('path');
const MAPA = require('./mapa-pozice.json');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  logoText: 'DataTimes.org', // anglický web datajournalism.studio
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Prediction', dal: 'Serbia&nbsp;election' },
  // grey = another list leads: Albanians (Preševo, Bujanovac), Bosniaks (Tutin), Hungarians (Kanjiža), in Kosovo Peć the Socialists
  legenda: [['#d85a74', 'students lead'], ['#697fe6', 'Vučić’s SNS leads'], ['#bcbcb0', 'minority list or SPS leads']],
  // brandDeepRed.7 / brandRoyalBlue.8 glow (colours of the two camps from the palette), background.2 and brandNavy.1 texts, brand.6 label
  barvy: { glowA: '#812840', glowB: '#272a59', kick: '#f8f6f0', sub: '#d2d8e9', stitek: '#de1743' },
  mapaPozice: MAPA,
  format: {
    og: { stred: false, box: [285, 50, 915, 580] },
  },
  logoPodLegendou: true,
  motiv: { typ: 'svg', opacityOg: 0.55, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
