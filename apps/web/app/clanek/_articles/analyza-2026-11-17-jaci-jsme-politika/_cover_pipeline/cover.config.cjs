// Sada coverů kapitoly Politika (speciál Jací jsme byli, jací jsme – 1989 × 2026).
// node motiv.cjs, pak z kořene repa: PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
// Motiv (motiv.cjs): dvě tečkové Sněmovny po 200 křeslech, 1990 (26 žen) × 2025 (67 žen), _data_pipeline/vystup.txt.
// Pozadí: trikolóra coveru speciálu (specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_cover_pipeline/cover.config.cjs).
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
const ZENY = '#f76800', MUZI = '#06677d';
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: '1989 × 2026', dal: 'Politika' },
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  logo: 'vpravo',
  og: 'siroky',
  ogScrim: false,
  legendaPodTextem: true,
  legenda: [[ZENY, 'poslankyně'], [MUZI, 'poslanci']],
  rozlozeni: {
    og: [
      { prvky: ['kicker', 'titulek', 'pod'], x: 320, y: 48 },
      { prvky: ['legenda'], x: 880, y: 48, vpravo: true },
      { prvky: ['logo'], x: 880, y: 584, vpravo: true, dole: true },
    ],
  },
  format: { homepage: { t: 88 }, og: { t: 46, sub: 18 } },
  pro: {
    og: { pod: 'Po volbách v roce 1990 jich bylo 26 z 200' },
  },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
