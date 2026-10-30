// English cover set (datatimes.org) – node tools/cover-generator.cjs <this file>
// Motif: dot hemicycle of the Knesset according to the prediction, 1 dot = 1 seat. The motiv-*.svg files are copied
// from the Czech article (volby-izrael-2026-10-27-netanjahu-bez-vetsiny-ukazuje-predikce, generated there by motiv.cjs)
// with the label "většina 61" replaced by "majority 61". Headline and dek come from the frontmatter (coverTitulek / coverPodtitulek).
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Prediction', dal: 'Israel&nbsp;election' },
  // party colours (Likud blue, Yashar light blue, Ra'am green), shades for dark background; charts in the article use the same scales
  legenda: [['#5e66d5', 'Netanyahu bloc 53'], ['#8cdfef', 'Eisenkot opposition 48'], ['#8dd265', 'Arab parties 19']],
  legendaPodTextem: true,
  barvy: { glowA: '#044d5e', glowB: '#272a59', kick: '#f8f6f0', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
