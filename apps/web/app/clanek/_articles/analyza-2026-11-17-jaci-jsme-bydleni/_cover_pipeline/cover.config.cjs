// Sada coverů kapitoly Bydlení – node motiv.cjs, pak z kořene repa
// PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
// Motiv (motiv.cjs): dva paneláky po 100 oknech, rozsvícená = bydlí vlastník (vlastní dům i byt), 1991 38 oken,
// 2021 61 oken (_data_pipeline/vystup.txt, vlastnicke_1991, vlastnicke_2021). Pozadí a štítek jako cover speciálu.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: '1989 × 2026', dal: 'Bydlení' },
  legenda: [[null, '1 okno = 1 % obydlených bytů'], [null, 'svítí = bydlí vlastník (dům i byt)']],
  logo: 'vlevo',
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  og: 'siroky', ogScrim: false,
  rozlozeni: {
    homepage: [{ prvky: ['kicker', 'titulek', 'pod'], x: 180, y: 150 }, { prvky: ['legenda'], x: 180, y: 985, dole: true }, { prvky: ['logo'], x: 180, y: 1078, dole: true }],
    og: [{ prvky: ['kicker', 'titulek'], x: 320, y: 44 }, { prvky: ['logo'], x: 880, y: 584, vpravo: true, dole: true }, { prvky: ['pod'], x: 320, y: 584, dole: true }],
  },
  format: { homepage: { t: 92 }, og: { t: 40, sub: 17 }, square: { t: 80 } },
  pro: {
    homepage: { legenda: [[null, '1 okno = 1 %<br>obydlených bytů'], [null, 'svítí = bydlí vlastník<br>(dům i byt)']] },
    og: { pod: '1 okno = 1 % obydlených bytů<br>svítí = bydlí vlastník (dům i byt)' },
  },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
