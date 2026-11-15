// Covery kapitoly Přehled speciálu „Jací jsme byli, jací jsme – 1989 × 2026“ (sourozenec coveru speciálu
// apps/web/app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_cover_pipeline/: trikolórové pozadí, karmínová jako „dnes“).
// node motiv.cjs, pak z kořene repa PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
// Motiv (motiv.cjs): „čára života“ ze svíček, dvě časové osy 0–85 let, 1 svíčka = 1 rok naděje dožití při narození (ženy 75 → 83, muži 68 → 77),
// čísla z _data_pipeline/vystup.txt.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: '1989 × 2026', dal: 'Přehled' },
  legenda: [[null, 'Naděje dožití, 1 svíčka = 1 rok'], ['#6267a3', 'v roce 1989'], ['#de1743', 'přibylo do dneška']],
  logo: 'vpravo',
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  og: 'siroky', ogScrim: false,
  rozlozeni: {
    homepage: [{ prvky: ['kicker', 'titulek', 'pod'], x: 180, y: 120 }, { prvky: ['legenda'], x: 1320, y: 1080, vpravo: true, dole: true }, { prvky: ['logo'], x: 180, y: 1080, dole: true }],
    og: [{ prvky: ['kicker', 'titulek'], x: 320, y: 48 }, { prvky: ['legenda'], x: 320, y: 584, dole: true }, { prvky: ['logo'], x: 880, y: 584, vpravo: true, dole: true }],
  },
  format: { homepage: { t: 86 }, og: { t: 50 } },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
