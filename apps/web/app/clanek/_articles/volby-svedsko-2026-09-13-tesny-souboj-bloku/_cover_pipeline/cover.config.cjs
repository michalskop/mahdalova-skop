// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 2 volby v zahraničí).
// Motiv: Riksdag jako půlkruh 349 křesel (tools/cover-tecky.cjs → parlament), nejtěsnější odhad 175 : 174
// (Ipsos 7.–10. 9., key-stats.yaml). Vlevo červeno-zelený blok (brand.6), vpravo blok Tidö (brandRoyalBlue.4) –
// karmínová × modrá, žádná červená × zelená.
const path = require('path');
const { vrstva, parlament, zare } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-tecky.cjs'));

const LEVY = '#de1743'; // brand.6 – červeno-zelený blok
const PRAVY = '#697fe6'; // brandRoyalBlue.4 – blok Tidö
const LEVI = 175, CELKEM = 349;

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Volby', dal: 'Švédsko 2026' },
  titulek: 'Bloky dělí<br>jediný mandát',
  pod: 'Nejtěsnější odhad švédských voleb:<br>175 ku 174 křeslům v&nbsp;Riksdagu',
  legenda: [[LEVY, 'červeno-zelený blok (Anderssonová)'], [PRAVY, 'blok Tidö (Kristersson)']],
  legendaPodTextem: true,
  logo: 'vlevo',
  // brand.9 / brandRoyalBlue.8 záře
  barvy: { glowA: '#8b0e2b', glowB: '#272a59', kick: '#ffb3c0', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: {
    typ: 'svg', opacityOg: 1,
    svg: vrstva((k, [cx, cy, R]) => zare(cx, cy, R, '#621d30')
      + parlament({ cx, cy: cy + R * 0.45, R: R * 0.95, n: CELKEM, styl: (i) => ({ fill: i < LEVI ? LEVY : PRAVY }) })),
  },
};
