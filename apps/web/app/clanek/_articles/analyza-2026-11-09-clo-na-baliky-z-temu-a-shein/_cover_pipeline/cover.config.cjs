// Sada coverů – python -I -X utf8 ../_data_pipeline/grafy.py, node motiv.cjs, pak
// node tools/cover-generator.cjs <tento soubor>. Titulek a podtitulek z frontmatteru (coverTitulek / coverPodtitulek).
// Motiv (motiv.cjs): 136 balíčků = 13,6 mil. položek v červnu 2026, 26 karmínových = 2,6 mil. v září, zbytek obrysy.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Balíky z Číny', dal: 'Clo' },
  // brand.4 září, #6267a3 obrysy (stejně jako motiv.cjs)
  legenda: [[null, 'Položky v zásilkách do 150 eur,<br>1 balíček = 100 000 položek'], ['#ff1a4a', 'září 2026: 2,6 milionu'], ['#6267a3', 'ubylo od června: 11 milionů']],
  legendaPodTextem: true,
  // záře brand.9 × brandNavy.8, podtitulek brandNavy.1
  barvy: { glowA: '#8b0e2b', glowB: '#272a59', kick: '#f8f6f0', sub: '#d2d8e9', stitek: '#de1743' },
  logo: 'vlevo',
  og: 'siroky', ogScrim: false,
  // OG: texty nahoře a vlevo dole, motiv vpravo dole uvnitř středního čtverce
  rozlozeni: { og: [{ prvky: ['kicker', 'titulek', 'pod'], x: 320, y: 48 }, { prvky: ['legenda', 'logo'], x: 320, y: 584, dole: true }] },
  format: { og: { t: 50 }, homepage: { t: 76 }, story: { t: 92 } },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
