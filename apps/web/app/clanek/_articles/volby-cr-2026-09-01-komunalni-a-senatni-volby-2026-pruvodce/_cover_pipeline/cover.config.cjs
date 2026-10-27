// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 1 volby 2026).
// Motiv: plný tečkový kruh ze 100 teček (slunečnice, tools/cover-tecky.cjs), 1 tečka = 1 % voličů. Tyrkysově každá
// druhá tečka – 46 % voličů, kteří přišli ke komunálním volbám 2022 (46,07 % podle článku); čtyři sudé tečky rovnoměrně
// vynechané, ať je jich přesně 46 (Kateřina 26. 10.: celý kruh, každá druhá tečka; prstenec = „kormidlo“ se nehodí).
const path = require('path');
const { vrstva, slunecnice, zare } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-tecky.cjs'));

const PRISLI = '#5fcce6'; // brandTeal.3
const RING = '#8f9dc9'; // brandNavy.4
const UCAST = 46; // KV 2022: 46,07 %
const BEZ = new Set([20, 44, 68, 92]); // 50 sudých − 4 = 46 zvýrazněných
if (50 - BEZ.size !== UCAST) throw new Error('nesedí počet zvýrazněných teček');

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Explainer', dal: 'Komunální a senátní volby 2026' },
  titulek: 'K&nbsp;obecním volbám<br>chodí každý druhý',
  pod: 'Přitom rozhodují o&nbsp;půl bilionu korun ročně.<br>Volí se 9. a&nbsp;10. října',
  legenda: [[PRISLI, 'přišli k volbám 2022 (46 %)'], [`transparent;box-shadow:inset 0 0 0 2px ${RING}`, 'nepřišli'], ['transparent', '1 tečka = 1 % voličů']],
  legendaPodTextem: true,
  logo: 'vlevo',
  // brandTeal.8 / brandRoyalBlue.8 záře, brandTeal.1 štítek coveru
  barvy: { glowA: '#044d5e', glowB: '#272a59', kick: '#b8eff6', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: {
    typ: 'svg', opacityOg: 1,
    svg: vrstva((k, [cx, cy, R]) => zare(cx, cy, R, '#044d5e') + slunecnice({ cx, cy, R: R * 0.86, n: 100, styl: (i) => (i % 2 === 0 && !BEZ.has(i) ? { fill: PRISLI } : { ring: RING }) })),
  },
};
