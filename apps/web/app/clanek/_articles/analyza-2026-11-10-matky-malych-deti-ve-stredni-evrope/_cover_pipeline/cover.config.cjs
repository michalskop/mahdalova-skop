// Sada coverů – python -I -X utf8 ../_data_pipeline/grafy.py, node motiv.cjs, pak
// node tools/cover-generator.cjs <tento soubor>. Titulek a podtitulek z frontmatteru (coverTitulek / coverPodtitulek).
// Motiv (motiv.cjs, zadání Xenie 9. 11. 2026): tři tečkové sloupce Česko / Slovensko / Maďarsko, 1 tečka = 1 % matek
// dětí do tří let; plné tečky skutečně pracují, šrafované jsou na rodičovské a statistika je vede jako zaměstnané.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Matky a práce', dal: 'Střední Evropa' },
  // brand.4 pracuje, brandNavy.4 šrafované (stejně jako motiv.cjs)
  legenda: [[null, '1 tečka = 1 % matek s dítětem do 3 let'], ['#ff1a4a', 'skutečně pracuje'], ['#8f9dc9', 'na rodičovské,<br>vedená jako zaměstnaná']],
  legendaPodTextem: true,
  // záře brand.9 × brandNavy.8, podtitulek brandNavy.1
  barvy: { glowA: '#8b0e2b', glowB: '#272a59', kick: '#f8f6f0', sub: '#d2d8e9', stitek: '#de1743' },
  logo: 'vlevo',
  og: 'siroky', ogScrim: false,
  rozlozeni: { og: [{ prvky: ['kicker', 'titulek', 'pod'], x: 320, y: 48 }, { prvky: ['legenda', 'logo'], x: 320, y: 584, dole: true }] }, // motiv vpravo dole uvnitř středního čtverce
  format: { og: { t: 50 }, homepage: { t: 80 }, story: { t: 92 } }, // homepage: titulek jinak sahá do rohu štítku rubriky
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
