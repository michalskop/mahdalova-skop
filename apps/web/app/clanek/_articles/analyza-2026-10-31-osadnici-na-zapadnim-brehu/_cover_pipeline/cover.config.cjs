// Sada coverů – python -I -X utf8 priprav_mapu.py <pse_admin1.geojson>, node motiv.cjs, pak
// node tools/cover-generator.cjs <tento soubor>. Titulek a podtitulek z frontmatteru (coverTitulek / coverPodtitulek).
// Motiv (motiv.cjs): Západní břeh, osady podle počtu obyvatel a outposty – karmínově ty založené od roku 2023.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Západní břeh' },
  // brand.4 nové outposty, brandNavy.5 starší, brandNavy.2 osady (stejně jako motiv.cjs)
  legenda: [['#ff1a4a', 'nelegální osady (outposty) od roku 2023'], ['#7889be', 'starší outposty'], ['#bcc4df', 'osady, plocha = počet obyvatel']],
  legendaPodTextem: true,
  // záře brand.9 × brandNavy.8, podtitulek brandNavy.1
  barvy: { glowA: '#8b0e2b', glowB: '#272a59', kick: '#f8f6f0', sub: '#d2d8e9', stitek: '#de1743' },
  logo: 'vlevo',
  format: { homepage: { t: 80 }, story: { t: 80 } }, // story: stejné zalomení titulku jako ostatní formáty
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
