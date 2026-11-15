// Sada coverů kapitoly Ovzduší (speciál Jací jsme byli, jací jsme – 1989 × 2026).
// node motiv.cjs, pak z kořene repa: PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
// Motiv (motiv.cjs): tovární komín a domek, nad každým oblak ze 100 teček (1 tečka = 1 % emisí v roce 1990),
// plné = zůstalo dnes (síra 3, benzo[a]pyren z domácností 49), prázdná kolečka = ubylo. Data _data_pipeline/cisla.json.
// Pozadí a barvy štítku jako cover speciálu (specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_cover_pipeline/cover.config.cjs).
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: '1989 × 2026', dal: 'Ovzduší' },
  legenda: [[null, '1 tečka = 1 % emisí v roce 1990'], ['#de1743', 'zůstalo dnes'], ['transparent;border:3px solid #ff8099;box-sizing:border-box', 'ubylo']],
  logo: 'vlevo',
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  og: 'siroky', ogScrim: false,
  format: { homepage: { t: 74 }, og: { t: 42, sub: 17, leg: 15 }, square: { t: 76 }, instagram: { t: 86 }, story: { t: 86 } },
  pro: {
    homepage: { pod: 'Emise síry klesly o 97 %.<br>Kouř z domácích komínů<br>je dnes hlavním zdrojem<br>rakovinotvorného<br>benzo[a]pyrenu' },
    og: { pod: 'Emise síry klesly o 97 %.<br>Kouř z domácích komínů je dnes<br>hlavním zdrojem rakovinotvorného<br>benzo[a]pyrenu' },
    square: { legenda: null, pod: 'Emise síry klesly o 97 %. Kouř z domácích komínů<br>je dnes hlavním zdrojem rakovinotvorného benzo[a]pyrenu' },
    instagram: { legenda: null, pod: 'Emise síry klesly o 97 %. Kouř z domácích komínů<br>je dnes hlavním zdrojem rakovinotvorného benzo[a]pyrenu' },
    story: { legenda: null, pod: 'Emise síry klesly o 97 %. Kouř z domácích<br>komínů je dnes hlavním zdrojem<br>rakovinotvorného benzo[a]pyrenu' },
  },
  rozlozeni: {
    homepage: [{ prvky: ['kicker', 'titulek', 'pod'], x: 180, y: 250 }, { prvky: ['legenda', 'logo'], x: 180, y: 1080, dole: true }],
    og: [{ prvky: ['kicker', 'titulek', 'pod'], x: 320, y: 48 }, { prvky: ['legenda', 'logo'], x: 320, y: 584, dole: true }],
  },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
