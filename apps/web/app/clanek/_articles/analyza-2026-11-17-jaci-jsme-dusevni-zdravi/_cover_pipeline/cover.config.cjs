// Covery kapitoly Duševní zdraví speciálu „Jací jsme byli, jací jsme – 1989 × 2026“ (sourozenec coveru speciálu
// apps/web/app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_cover_pipeline/: trikolórové pozadí, karmínová jako „dnes“).
// node motiv.cjs, pak z kořene repa PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
// Motiv (motiv.cjs): tečkové sloupce spotřeby antidepresiv 1989–2024 po pěti letech, 1 tečka = 1 denní dávka
// na 1 000 obyvatel a den (OECD), čísla z _data_pipeline/cisla.json.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: '1989 × 2026', dal: 'Duševní zdraví' },
  legenda: [[null, '1 tečka = 1 denní dávka antidepresiv<br>na 1 000 obyvatel a den']],
  logo: 'vlevo',
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  og: 'siroky', ogScrim: false,
  rozlozeni: {
    homepage: [{ prvky: ['kicker', 'titulek', 'pod'], x: 180, y: 235 }, { prvky: ['legenda', 'logo'], x: 180, y: 1080, dole: true }],
    og: [{ prvky: ['kicker', 'titulek', 'pod', 'legenda'], x: 320, y: 48 }, { prvky: ['logo'], x: 880, y: 48, vpravo: true }],
    square: [{ prvky: ['kicker', 'titulek', 'pod'], x: 70, y: 70 }, { prvky: ['legenda', 'logo'], x: 70, y: 1010, dole: true }],
    instagram: [{ prvky: ['kicker', 'titulek', 'pod'], x: 70, y: 110 }, { prvky: ['legenda', 'logo'], x: 70, y: 1240, dole: true }],
  },
  format: { homepage: { t: 78 }, og: { t: 38, sub: 19, leg: 16 }, square: { t: 70 }, instagram: { t: 72 }, story: { t: 84 } },
  pro: { homepage: { legenda: [[null, '1 tečka = 1 denní dávka<br>antidepresiv<br>na 1 000 obyvatel a den']] }, og: { pod: 'Sebevražednost je<br>přitom o třetinu nižší', legenda: [[null, '1 tečka = 1 denní dávka<br>antidepresiv<br>na 1 000 obyvatel a den']] } },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
