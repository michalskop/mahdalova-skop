// Sada coverů kapitoly Volný čas a spotřeba (speciál Jací jsme byli, jací jsme – 1989 × 2026).
// node motiv.cjs, pak z kořene repa: PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
// Motiv (motiv.cjs): kinosál ze 100 sedadel = návštěvy kin 1989, 25 obsazených = 2024, _data_pipeline/vystup.txt.
// Pozadí: trikolóra coveru speciálu (specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_cover_pipeline/cover.config.cjs).
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: '1989 × 2026', dal: 'Volný čas a spotřeba' },
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  logo: 'vlevo',
  og: 'siroky',
  ogScrim: false,
  // legenda na dva řádky, položky v jednom řádku, puntík před textem (Kateřina 15. 11.)
  legenda: [[null, 'Návštěvy kin, 1 sedadlo = 1 %'],
    [null, `<i style="background:#de1743;margin:0 .35em 0 0"></i>dnes&emsp;<i style="background:#6267a3;margin:0 .35em 0 0"></i>ubylo od roku 1989`]],
  rozlozeni: {
    og: [
      { prvky: ['kicker', 'titulek'], x: 320, y: 48 },
      { prvky: ['logo'], x: 320, y: 584, dole: true },
    ],
  },
  format: { homepage: { t: 88 }, og: { t: 46, sub: 18 }, story: { t: 88 } },
  mezery: { homepage: [36, 64, 28] },
  pro: { story: { pod: 'V roce 1989 šel průměrný člověk<br>do kina pětkrát za rok. Dnes jednou' } },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
