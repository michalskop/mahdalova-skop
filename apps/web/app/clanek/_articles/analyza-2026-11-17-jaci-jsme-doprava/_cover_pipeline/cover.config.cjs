// Sada coverů kapitoly Doprava (speciál Jací jsme byli, jací jsme – 1989 × 2026).
// node motiv.cjs, pak z kořene repa: PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
// Motiv (motiv.cjs): dvě parkoviště po 100 místech, 1 autíčko = 10 aut na 1 000 obyvatel; 1990: 23 (234), dnes: 62 (621).
// Pozadí a barvy štítku jako cover speciálu (specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_cover_pipeline/cover.config.cjs).
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: '1989 × 2026', dal: 'Doprava' },
  legenda: [[null, '1 autíčko = 10 aut na 1 000 obyvatel']],
  logo: 'vpravo',
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  og: 'siroky', ogScrim: false,
  format: { homepage: { t: 70 }, og: { t: 38, leg: 16 }, square: { t: 64 }, instagram: { t: 66 }, story: { t: 70 } },
  pro: Object.fromEntries(['square', 'instagram', 'story'].map((k) => [k, { pod: 'Na tisíc obyvatel připadalo<br>v roce 1990 234 aut, dnes 621' }])),
  rozlozeni: {
    homepage: [{ prvky: ['kicker', 'titulek', 'pod'], x: 180, y: 124 }, { prvky: ['legenda'], x: 180, y: 1078, dole: true }, { prvky: ['logo'], x: 1320, y: 1078, vpravo: true, dole: true }],
    og: [{ prvky: ['kicker', 'titulek'], x: 320, y: 48 }, { prvky: ['legenda'], x: 320, y: 584, dole: true }, { prvky: ['logo'], x: 880, y: 584, vpravo: true, dole: true }],
  },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
