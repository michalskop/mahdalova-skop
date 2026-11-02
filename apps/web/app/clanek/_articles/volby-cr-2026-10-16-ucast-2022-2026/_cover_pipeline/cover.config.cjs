// Sada coverů – node _cover_pipeline/motiv.cjs, pak PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv: tečková mapa ČR, v každém okrese šipka změny účasti 2022 → 2026 (motiv.cjs, hodnoty z _data_pipeline/vystup.json).
const path = require('path');
const UP = '#6ec53f'; // brandForestGreen.4
const DOWN = '#ff1a4a'; // brand.4
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Komunální volby 2026' },
  titulek: 'Účast stoupla, ale ne všude',
  pod: 'Ve městech s&nbsp;nejnižší účastí přišlo k&nbsp;volbám ještě méně lidí než v&nbsp;roce&nbsp;2022',
  mapaPozice: { homepage: [140, 470, 1500, 1170] },
  legenda: [[UP, 'účast v okrese vzrostla'], [DOWN, 'účast v okrese klesla']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  // brandForestGreen.9 / brand.9 záře, brandForestGreen.2 podtitulek
  barvy: { glowA: '#172002', glowB: '#8b0e2b', sub: '#acde8b', stitek: '#ff1a4a' },
  motiv: { typ: 'svg', opacityOg: 0.45, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
