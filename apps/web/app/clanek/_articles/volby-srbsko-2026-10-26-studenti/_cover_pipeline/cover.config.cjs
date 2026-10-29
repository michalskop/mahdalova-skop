// Sada coverů – node motiv.cjs, pak node tools/cover-generator.cjs <tento soubor>
// Motiv (motiv.cjs): bublinová mapa obcí Srbska, kolečko = obec (plocha ∝ voliči), barva = kdo vede podle predikce.
// Vínová města (Bělehrad, Nový Sad, Kragujevac, Niš) proti modrým malým obcím na jihu a východě.
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
const path = require('path');
const MAPA = require('./mapa-pozice.json');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Volby v&nbsp;Srbsku' },
  legenda: [['#d85a74', 'vedou studenti'], ['#697fe6', 'vede Vučićova SNS']],
  // brandDeepRed.7 / brandRoyalBlue.8 záře (barvy obou uskupení z palety), background.2 a brandNavy.1 texty, brand.6 štítek
  barvy: { glowA: '#812840', glowB: '#272a59', kick: '#f8f6f0', sub: '#d2d8e9', stitek: '#de1743' },
  mapaPozice: MAPA,
  format: {
    og: { stred: false, box: [285, 50, 915, 580] },
  },
  logoPodLegendou: true,
  motiv: { typ: 'svg', opacityOg: 0.55, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
