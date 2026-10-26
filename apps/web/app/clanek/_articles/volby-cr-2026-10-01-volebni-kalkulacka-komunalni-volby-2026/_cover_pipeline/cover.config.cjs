// POZOR (26. 10. 2026): publikovaná sada coverů NEpochází z tohoto configu, ale z puvodni.cjs (původní obálka s logem
// kalkulačky, Kateřina ji chce zachovat). Tento config (mapa měst) zůstává jen jako alternativa – nespouštět do images/.
// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 1 volby 2026).
// Série Volební kalkulačka: stejná ikona, záře a tečková mapa jako volby-cr-2026-10-10-volebni-kalkulacka-73-mest-a-senat;
// body = města, pro která kalkulačka vznikla (kalkulacky-mapa.json z toho článku), bez senátních obvodů.
const path = require('path');
const SERIE = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-volebni-kalkulacka-73-mest-a-senat');
const mapa = require(path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'senat-mapa.json'));
const { mesta } = require(path.join(SERIE, 'kalkulacky-mapa.json'));

const MODRA = '#697fe6'; // brandRoyalBlue.4
const BARVY = { glowA: '#07479d', glowPosA: '22% 30%', glowB: '#7a303d', glowPosB: '80% 72%', glowDosah: 48, kick: '#d2d8e9', sub: '#a9b5f0', stitek: '#de1743' };

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Volební kalkulačka', dal: 'Komunální volby 2026' },
  titulek: 'Volební kalkulačka<br>míří do obcí',
  pod: 'Pro komunální volby 2026 ji chystáme<br>pro desítky měst',
  ikona: path.join(SERIE, '_cover_pipeline', 'ikona-kalkulacka-20-let.png'),
  ikonaCtverec: [59, 41, 307],
  legenda: [[MODRA, 'města s kalkulačkou']],
  logo: 'vlevo',
  barvy: BARVY,
  motiv: { typ: 'tecky', dots: mapa.dots, vol: [], body: mesta, barvaObvod: '#de1743', barvaTecka: '#2f325c', barvaBod: MODRA, obrysBod: '#ffffff' },
};
