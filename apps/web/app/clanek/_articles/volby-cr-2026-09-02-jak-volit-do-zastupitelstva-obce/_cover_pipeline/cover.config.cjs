// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 1 volby 2026).
// Motiv: hlasovací lístek pražského voliče, 65 políček (tools/cover-tecky.cjs → listek) – Praha má 65 zastupitelů,
// volič tedy 65 hlasů. Ve třech políčkách křížek (Kateřina 26. 10.: „mají být opravdu křížky“), 62 políček zůstane prázdných.
const path = require('path');
const { vrstva, listek, zare } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-tecky.cjs'));

const ORANZ = '#f76800'; // brandOrange.6
const RING = '#8f9dc9'; // brandNavy.4
const SLOUPCU = 13, RADKU = 5; // 65 hlasů

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Explainer', dal: 'Komunální volby 2026' },
  titulek: 'Tři křížky<br>nestačí',
  pod: 'V&nbsp;Praze má volič 65 hlasů. Kdo dá jen tři,<br>nechá většinu z&nbsp;nich propadnout',
  legenda: [[ORANZ, '3 křížky'], [`transparent;border-radius:3px;box-shadow:inset 0 0 0 2px ${RING}`, 'nevyužité hlasy'], ['transparent', '1 políčko = 1 hlas (Praha)']],
  legendaPodTextem: true,
  logo: 'vlevo',
  // brandDeepRed.8 / brandNavy.8 záře, brandDeepRed.1 štítek coveru
  barvy: { glowA: '#621d30', glowB: '#2f325c', kick: '#f5c4c9', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: {
    typ: 'svg', opacityOg: 1,
    svg: vrstva((k, [cx, cy, R]) => {
      const krok = (2 * R) / SLOUPCU;
      const x = cx - R + krok / 2, y = cy - (RADKU * krok) / 2 + krok / 2;
      return zare(cx, cy, R, '#621d30') + listek({ x, y, sloupcu: SLOUPCU, n: SLOUPCU * RADKU, krok, krizku: 3, barva: ORANZ, ramecek: RING });
    }),
  },
};
