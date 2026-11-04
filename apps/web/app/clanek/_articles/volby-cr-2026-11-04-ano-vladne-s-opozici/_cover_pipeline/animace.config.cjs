// Animace Sankey „kdo s kým“ (Kateřina 4. 11. 2026: animovat Sankey do carouselu). Vlákna narostou zleva doprava,
// pak se postupně zvýrazní ANO, ODS a STAN (jako klik v článku, u partnerů počet společných koalic), nakonec celý graf.
// instagram 1080×1350 = animovaný 2. slide carouselu (na Instagram nahrát místo 02.png, stejný titulek),
// square pro X/Bluesky, GIF ze čtverce (prvních 8 s: narůstání a ANO) pro newsletter.
// PW_PATH=<repo>/node_modules/playwright node tools/animation-generator.cjs <tento soubor> [formát…] [--nahledy <složka>]
const path = require('path');
const cover = require('./cover.config.cjs');
const { kresli } = require('./sankey.cjs');
const slide2 = require('./carousel.config.cjs').slidy[1];

const ROZ = { instagram: [1080, 1350], square: [1080, 1080] };
const BOX = { instagram: { x: 70, y: 470, w: 940, h: 760 }, square: { x: 150, y: 330, w: 780, h: 690, fs: 24 } };
const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

// časová osa (s): narůstání, pak tři strany po sobě, každá se rozsvítí a zhasne
const RUST = [0.3, 3.2];
const FOKUS = [['ANO', 4.0, 7.6], ['ODS', 8.2, 11.3], ['STAN', 11.9, 14.6]];
const PRECHOD = 0.6;

function snimek(t, klic) {
  const [w, h] = ROZ[klic];
  const rust = ease((t - RUST[0]) / (RUST[1] - RUST[0]));
  let fokus = null, sila = 0;
  for (const [n, a, b] of FOKUS) {
    if (t >= a && t <= b + PRECHOD) { fokus = n; sila = Math.min(ease((t - a) / PRECHOD), 1 - ease((t - b) / PRECHOD)); }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
    + kresli({ ...BOX[klic], rust, fokus, strana: 'L', sila }) + '</svg>';
}

const POD = 'Kdo s kým vládne ve 23 dohodnutých koalicích ve 26 statutárních městech a v Praze. Šířka pruhu = počet společných koalic.';
module.exports = {
  nazev: 'sankey-kdo-s-kym',
  cover,
  vystup: path.join(__dirname, '..', 'social', 'animace'),
  fps: 30,
  trvani: 16,
  formaty: ['instagram', 'square'],
  coverPro: {
    // stejný titulek jako statický 02.png (carousel-generator: velikost 66, podtitulek 32, štítek 24, logo nahoře)
    instagram: { titulek: slide2.titulek, pod: POD, legenda: null, ikona: null, logo: 'nahore', format: { instagram: { t: 66, sub: 32, kick: 24 } } },
    square: { titulek: 'S&#160;kým vládne ANO ve&#160;velkých městech', pod: 'Šířka pruhu = počet společných koalic, stav 4. 11. 2026', legenda: null, ikona: null, logo: 'nahore', format: { square: { t: 58, sub: 28, kick: 22 } } },
  },
  snimek,
  gif: { format: 'square', sirka: 800, fps: 15 },
  nahledy: [1.5, 3.5, 6, 10, 13.5],
};
