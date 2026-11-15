// Sada coverů kapitoly Vzdělávání – node motiv.cjs, pak z kořene repa
// PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
// Motiv (motiv.cjs): postavy s akademickým čepcem, 1 postava = 20 000 lidí 15+ s VŠ podle sčítání 1991 a 2021,
// ženy (#f76800) a muži (#06677d) zvlášť: 1991 11 a 18, 2021 41 a 36 (_data_pipeline/cisla.json).
// Pozadí a štítek jako cover speciálu (specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_cover_pipeline/cover.config.cjs).
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: '1989 × 2026', dal: 'Vzdělávání' },
  legenda: [['#f76800', 'ženy s VŠ'], ['#06677d', 'muži s VŠ'], [null, '1 postava = 20 000 lidí (sčítání)']],
  logo: 'vlevo',
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  og: 'siroky', ogScrim: false,
  rozlozeni: {
    homepage: [{ prvky: ['kicker', 'titulek', 'pod'], x: 180, y: 120 }, { prvky: ['legenda'], x: 1320, y: 1080, vpravo: true, dole: true }, { prvky: ['logo'], x: 180, y: 1080, dole: true }],
    og: [{ prvky: ['kicker', 'titulek', 'pod'], x: 320, y: 48 }, { prvky: ['legenda'], x: 880, y: 584, vpravo: true, dole: true }, { prvky: ['logo'], x: 320, y: 584, dole: true }],
    square: [{ prvky: ['kicker', 'titulek', 'pod'], x: 70, y: 70 }, { prvky: ['legenda'], x: 1010, y: 1010, vpravo: true, dole: true }, { prvky: ['logo'], x: 70, y: 1010, dole: true }],
  },
  format: { homepage: { t: 80 }, og: { t: 36, sub: 18, leg: 15 }, square: { t: 76 }, instagram: { t: 80 }, story: { t: 84 } },
  pro: {
    og: { pod: 'Vysokoškoláků dvakrát' },
    story: { pod: 'Vysokoškoláků dvakrát.<br>V roce 1991 měly diplom 218 tisíc žen,<br>v roce 2021 už 823 tisíc' },
  },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
