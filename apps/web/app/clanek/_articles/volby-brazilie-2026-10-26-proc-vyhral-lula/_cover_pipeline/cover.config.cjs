// Sada coverů – node motiv.cjs, pak node tools/cover-generator.cjs <tento soubor>
// Motiv (motiv.cjs): bublinová mapa obcí Brazílie, kolečko = obec (plocha ∝ voliči), barva = vítěz 2. kola.
// Oranžový severovýchod proti zelenému jihu a středozápadu = mapa výsledku; titulek nese příčinu (účast).
const path = require('path');
const MAPA = require('./mapa-pozice.json');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Volby v&nbsp;Brazílii' },
  titulek: 'Proč vyhrál<br>Lula',
  pod: 'K&nbsp;volbám přišly tři miliony lidí navíc<br>a rozhodly druhé kolo',
  legenda: [['#f76800', 'obec vyhrál Lula'], ['#12b886', 'obec vyhrál Flávio Bolsonaro']],
  // brandOrange.8 / brandEmeraldMint.8 záře, background.2 a brandNavy.1 texty, brand.6 štítek
  barvy: { glowA: '#994800', glowB: '#084533', kick: '#f8f6f0', sub: '#d2d8e9', stitek: '#de1743' },
  mapaPozice: Object.fromEntries(Object.entries(MAPA).map(([k, [x0, y0, x1, y1]]) => [k, [x0, y0, x1, y1]])),
  motiv: { typ: 'svg', opacityOg: 0.4, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
