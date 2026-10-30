// Animace homepage karty: medaile z 1 424 teček, ženy (237 světlých teček) pomalu problikávají.
// Kateřina 28. 10. 2026: nepravidelný výběr, ale během jednoho cyklu se vystřídají všechny ženy, žádná
// nevypadne; tempo pomalé až středně pomalé („ne rozbitý vánoční strom“). Cyklus se plynule opakuje.
// PW_PATH=<repo>/node_modules/playwright node tools/animation-generator.cjs <tento soubor> [--nahledy <složka> [--jen-nahledy]]
// → images/cover-homepage-animace.gif (frontmatter homepageImage), MP4 do social/animace/
const path = require('path');
const { zaznamy, medaile, f1 } = require('./motiv.cjs');
const cover = require('./cover.config.cjs');

const CYKLUS = 45;   // s – za tuto dobu blikne každá žena právě jednou
const ZABLESK = 2.6; // s – jeden záblesk: pomalé rozsvícení a pohasnutí
const ZLATA = '#ffcf02'; // brandYellow – stejná záře jako za medailí
const BILA = '#ffffff';  // background.0

// pořadí žen: pevně zamíchané (opakovatelně), starty rovnoměrně po cyklu s malým rozptylem → nepravidelné, bez shluků
const zeny = zaznamy.map((z, i) => (z[1] === 'Z' ? i : -1)).filter((i) => i >= 0);
let seed = 28102026;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const poradi = zeny.map((i) => [i, rnd()]).sort((a, b) => a[1] - b[1]).map(([i]) => i);
const krok = CYKLUS / poradi.length;
const start = new Map(poradi.map((i, k) => [i, k * krok + (rnd() - 0.5) * krok * 1.6]));

// intenzita záblesku 0–1 v čase t (plynulá smyčka přes konec cyklu)
function zablesk(i, t) {
  if (!start.has(i)) return 0;
  const u = ((((t - start.get(i)) % CYKLUS) + CYKLUS) % CYKLUS) / ZABLESK;
  return u < 1 ? Math.sin(Math.PI * u) ** 2 : 0;
}

function snimek(t, klic) {
  return medaile(klic, undefined, (i, x, y, r) => {
    const e = zablesk(i, t);
    if (e < 0.02) return '';
    return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * (1.6 + 2.2 * e))}" fill="${ZLATA}" opacity="${(0.28 * e).toFixed(3)}"/>`
      + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * (1 + 0.45 * e))}" fill="${BILA}"/>`;
  });
}

module.exports = {
  nazev: 'zeny-problikavaji',
  cover,
  vystup: path.join(__dirname, '..', 'social', 'animace'),
  fps: 12,
  trvani: CYKLUS,
  formaty: ['homepage'],
  snimek,
  gif: { format: 'homepage', sirka: 1000, fps: 12, delka: CYKLUS, cil: path.join(__dirname, '..', 'images', 'cover-homepage-animace.gif') },
  nahledy: [0, 5, 12.3],
};
