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
  legenda: [['#ffcf02', 'obec vyhrál Lula'], ['#12b886', 'obec vyhrál Flávio Bolsonaro']],
  // brandYellow.8 / brandEmeraldMint.8 záře (zelená, žlutá, modrá = vlajka), background.2 a brandNavy.1 texty, brand.6 štítek
  barvy: { glowA: '#bd9103', glowB: '#084533', kick: '#f8f6f0', sub: '#d2d8e9', stitek: '#de1743' },
  mapaPozice: Object.fromEntries(Object.entries(MAPA).map(([k, [x0, y0, x1, y1]]) => [k, [x0, y0, x1, y1]])),
  // OG: text vlevo (ale uvnitř středního čtverce 630 px kvůli ořezu v messengerech), mapa vpravo – Kateřina 26. 10.
  // podtitulek o řádky níž a legenda o řádky výš, ať vyplní volnou plochu vlevo (Kateřina 26. 10.)
  format: {
    og: { stred: false, box: [285, 50, 915, 580], podDolu: 1 },
    square: { podDolu: 2, legNahoru: 2 },
    homepage: { podDolu: 2, legNahoru: 1 },
    instagram: { podDolu: 2, legNahoru: 2 },
    // story: text o 3 řádky výš (podtitulek na severu mapy), spodek loga = jižní cíp Brazílie (y 1668), legenda na původním místě (legNahoru vyrovnává posun spodku boxu o 98 px)
    story: { podDolu: 2, legNahoru: 2 + 98 / (26 * 1.6), box: [80, 95, 1000, 1668] },
  },
  // logo vlevo dole, legenda o dva řádky výš nad ním – vpravo dole by logo zakrývalo jih mapy (Kateřina 26. 10.)
  logoPodLegendou: true,
  motiv: { typ: 'svg', opacityOg: 0.4, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
