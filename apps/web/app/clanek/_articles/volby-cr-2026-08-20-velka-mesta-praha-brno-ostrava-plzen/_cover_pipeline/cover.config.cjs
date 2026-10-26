// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 1 volby 2026).
// Motiv: mapa obcí ČR ztlumeně, čtyři největší města zvýrazněná a pojmenovaná: Praha a Brno = nový primátor jistý
// (Svoboda ani Vaňková nekandidují), Ostrava a Plzeň = kandidátky vedou současní primátoři (Dohnal, Zarzycký).
const path = require('path');
const { obce, mapaObci } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-mapa-obci.cjs'));

const ORANZ = '#f76800'; // brandOrange.6
const TEAL = '#5fcce6'; // brandTeal.3
const TLUM = '#4c4f8e'; // brandNavy.7
const NAVY = '#101432';
const PRAHA = Math.sqrt(Math.max(...obce().map((o) => o.p)));
const k = (p) => Math.max(0.32, (Math.sqrt(p) / PRAHA) * 11);
const MESTA = { 'Praha hl.m.': ORANZ, Brno: ORANZ, Ostrava: TEAL, 'Plzeň': TEAL }; // jména podle dat poloh obcí
const vsechny = obce().map((o) => ({ ...o, k: k(o.p), barva: MESTA[o.n] ?? TLUM, op: MESTA[o.n] ? 1 : 0.85, obrys: MESTA[o.n] ? NAVY : undefined }));
const body = [...vsechny].sort((a, b) => Number(!!MESTA[a.n]) - Number(!!MESTA[b.n]) || a.k - b.k);
// popisek vedle kolečka (posun o jeho poloměr ve stupních délky); Plzeň a Ostrava doleva (u okraje mapy), Praha a Brno doprava
const popisky = vsechny.filter((o) => MESTA[o.n]).map((o) => {
  const strana = o.n === 'Plzeň' || o.n === 'Ostrava' ? 'vlevo' : 'vpravo';
  const d = 0.024 * o.k;
  return { lon: o.lon + (strana === 'vlevo' ? -d : d), lat: o.lat, text: o.n.replace(' hl.m.', ''), strana };
});

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Kontext', dal: 'Komunální volby 2026' },
  titulek: 'Praha a&nbsp;Brno<br>vymění primátora',
  pod: 'V&nbsp;Ostravě a&nbsp;Plzni vedou kandidátky<br>současní primátoři',
  legenda: [[ORANZ, 'nový primátor jistý'], [TEAL, 'kandidátku vede současný primátor']],
  legendaPodTextem: true, // dole vpravo leží Brno a Ostrava
  logo: 'vlevo',
  // brandOrange.8 / brandTeal.9 záře
  barvy: { glowA: '#994800', glowB: '#023440', kick: '#ffe0c7', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 0.35, svg: mapaObci({ body, popisky }) },
};
