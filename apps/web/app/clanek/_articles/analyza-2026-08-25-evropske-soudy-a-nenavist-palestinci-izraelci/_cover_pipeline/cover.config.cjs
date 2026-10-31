// Sada pěti coverů (27. 10. 2026) – původní cover článku (socha Iustitie vpravo, žlutý titulek
// „Nenávistné výroky“ a podtitulek beze změny, Kateřina: „perfektní fotka, krásný wording, dobrá kompozice“),
// jen převedený do formátů z tools/COVER-EDITOR.md. Obličej sochy nikdy pod textem ani logem.
// Zdroj: images/justice-datatimes-vyroky-z-nenavisti.jpg (Iustitia, Emanuel Pendl, Justizpalast Wien –
// foto Hubertl, CC BY-SA 4.0, Wikimedia Commons). Obličej v podkladu ≈ (880, 310) z 1800 × 1370.
// PW_PATH=<repo>/node_modules/playwright node _cover_pipeline/render.cjs
const path = require('path');
const vrstva = require('./foto.cjs');

const IMG = path.join(__dirname, '..', 'images');
const SOCHA = path.join(IMG, 'justice-datatimes-vyroky-z-nenavisti.jpg');
const zleva = { smer: 'h', body: [[0, 0.94], [0.36, 0.8], [0.6, 0]] };
const dole = { smer: 'v', body: [[0.8, 0], [1, 0.7]] };
const L = {
  homepage: { W: 1500, H: 1200, vyrez: [110, 0, 1100], prechody: [zleva, dole] },
  // čtverec a 4:5: socha víc vpravo, aby titulek nedosáhl na hlavu
  square: { W: 1080, H: 1080, vyrez: [-60, 0, 1300], prechody: [zleva, dole] },
  // 4:5: celá socha pod textem a nad logem (logo nikdy přes sochu), okraje měkce do navy
  instagram: { W: 1080, H: 1350, vyrez: [0, 150, 1800], oblast: [141, 620, 797, 540],
    prechody: [{ smer: 'h', body: [[0.13, 1], [0.19, 0], [0.81, 0], [0.87, 1]] },
      { smer: 'v', body: [[0.459, 1], [0.5, 0]] }, { smer: 'v', body: [[0.82, 0], [0.859, 1]] }] },
  // story: text nahoře, celá socha vycentrovaná pod ním na ink blue, logo pod sochou (Kateřina 27. 10.:
  // žádná „záclona“ přes nohy, nic pod rozhraním Instagramu); okraje fotky měkce mizí do navy
  // výřez začíná nad závojem (y 120), takže přechod nahoře ztmaví jen klenbu, nikdy hlavu; socha končí nad logem
  story: { W: 1080, H: 1920, vyrez: [97, 120, 1566], oblast: [30, 720, 1020, 790],
    prechody: [{ smer: 'h', body: [[0.028, 1], [0.1, 0], [0.9, 0], [0.972, 1]] },
      { smer: 'v', body: [[0.375, 1], [0.415, 0]] }, { smer: 'v', body: [[0.74, 0], [0.787, 1]] }] },
};
const svg = (k) => vrstva({ ...L[k], src: SOCHA, rozmer: [1800, 1370] });

module.exports = {
  vystup: IMG,
  kicker: { cervene: 'Analýza', dal: 'Svoboda projevu' },
  titulek: 'Nenávistné<br>výroky',
  pod: 'Soudy rozlišují,<br>komu jsou adresovány:<br>zda státům, nebo lidem',
  format: {
    homepage: { box: [180, 300, 1320, 1080], t: 120, sub: 42 },
    square: { t: 96, sub: 36 },
    instagram: { t: 104, sub: 38 },
    story: { t: 110, sub: 40 },
  },
  // brandYellow.6 titulek jako na původním coveru, brandNavy.1 podtitulek
  barvy: { glowA: '#2f325c', glowB: '#2f325c', sub: '#f8f6f0', titulek: '#ffcf02', stitek: '#de1743' },
  motiv: { typ: 'svg', svg: Object.fromEntries(Object.keys(L).map((k) => [k, svg(k)])) },
};
