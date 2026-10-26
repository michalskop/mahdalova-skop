// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 1 volby 2026); starší návrh = cover.html.
// Motiv: tečkové sloupce (tools/cover-tecky.cjs), 1 tečka = 5 000 kandidátů do obcí, sloupec = jedny volby 2002–2026;
// oranžově 2026, nejnižší sloupec od roku 2002. Čísla z data/muni_pocet.json.
const path = require('path');
const { vrstva, sloupce, zare } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-tecky.cjs'));
const pocet = Object.fromEntries(require(path.join(__dirname, '..', 'data', 'muni_pocet.json')).data.values.map((r) => [r.year, r.v]));

const ORANZ = '#f76800'; // brandOrange.6
const DRIV = '#8f9dc9'; // brandNavy.4
const ROKY = Object.keys(pocet).map(Number).sort();
const cislo = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '&nbsp;');

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Komunální a senátní volby 2026' },
  titulek: 'Nejméně kandidátů<br>za dvacet let',
  pod: `Do obcí kandiduje ${cislo(pocet[2026])} lidí,<br>o&nbsp;${cislo(pocet[2014] - pocet[2026])} méně než v&nbsp;roce 2014`,
  legenda: [[ORANZ, 'kandidáti 2026'], [DRIV, 'dřívější komunální volby'], ['transparent', '1 tečka = 5&nbsp;000 kandidátů']],
  legendaPodTextem: true,
  logo: 'vlevo',
  // brandAmethyst.9 / brandRoyalBlue.8 záře
  barvy: { glowA: '#351040', glowB: '#272a59', kick: '#ffe0c7', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: {
    typ: 'svg', opacityOg: 1,
    svg: vrstva((k, [cx, cy, R]) => zare(cx, cy, R, '#522a7a') + sloupce({
      x: cx - R, y: cy + R * 0.82, w: 2 * R, h: R * 1.7, hodnoty: ROKY.map((r) => pocet[r]), jednotka: 5000,
      popisky: ROKY.map((r) => (k === 'og' ? String(r).slice(2) : r)), styl: (c) => ({ fill: c === ROKY.length - 1 ? ORANZ : DRIV }),
    })),
  },
};
