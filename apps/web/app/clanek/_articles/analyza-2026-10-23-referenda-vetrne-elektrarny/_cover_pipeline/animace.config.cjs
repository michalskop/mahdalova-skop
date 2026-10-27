// Animace „turbíny“: na tečkové mapě ČR vyrostou postupně od západu na východ turbíny ve 21 obcích, kde se
// 9.–10. 10. 2026 hlasovalo o větrnících (zlatá = odmítly, tyrkysová = Dětřichov, který výstavbu podpořil),
// a točí se. Data z obce.json (../_data_pipeline/build.py), kreslení z motiv.cjs, štítek a pozadí z cover.config.cjs.
// Začíná i končí plnou mapou (první snímek = náhled videa i GIFu, smyčka navazuje).
// PW_PATH=<repo>/node_modules/playwright node tools/animation-generator.cjs <tento soubor> [--nahledy <složka> [--jen-nahledy]]
// → social/animace/turbiny-{story,instagram,square}.mp4 + turbiny.gif
const path = require('path');
const { kresli, poradi } = require('./motiv.cjs');
const cover = require('./cover.config.cjs');

const DRZ = 0.8, SBAL = 0.4, PAUZA = 0.3, KROK = 0.12, RUST = 0.35, KONEC = 2.6;
const START = DRZ + SBAL + PAUZA;
// pořadí vyrůstání: od západu na východ, Dětřichov (jediné „ano“) jako poslední
const fronta = [...poradi].sort((a, b) => (a.vysledek === 'pro výstavbu') - (b.vysledek === 'pro výstavbu') || a.lon - b.lon);
const kdy = new Map(fronta.map((o, j) => [o.obec, START + j * KROK + (o.vysledek === 'pro výstavbu' ? 0.4 : 0)]));
const TRVANI = +(Math.max(...kdy.values()) + RUST + KONEC).toFixed(2);
const OTACKA = TRVANI / 4; // čtyři otáčky za celou smyčku, aby navazovala

const easeOutBack = (x) => 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;
function stav(o, t) {
  if (t < DRZ) return 1;
  if (t < DRZ + SBAL) return 1 - (t - DRZ) / SBAL;
  const x = (t - kdy.get(o.obec)) / RUST;
  return x <= 0 ? 0 : x >= 1 ? 1 : easeOutBack(x);
}

const snimek = (t, klic) => kresli(klic, { stav: (o) => stav(o, t), otoceni: (360 * t) / OTACKA });

module.exports = {
  nazev: 'turbiny',
  cover: { ...cover, logo: 'nahore' }, // dole by logo překrylo ovládání Instagramu a Reels
  vystup: path.join(__dirname, '..', 'social', 'animace'),
  fps: 30,
  trvani: TRVANI,
  formaty: ['story', 'instagram', 'square'],
  snimek,
  gif: { format: 'square', sirka: 800, fps: 15 },
  nahledy: [0, DRZ + SBAL, START + 1, TRVANI - 0.05],
};
