// Covery kapitoly Rodina speciálu „Jací jsme byli, jací jsme – 1989 × 2026“ (sourozenec coveru speciálu
// apps/web/app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_cover_pipeline/: trikolórové pozadí, karmínová jako „dnes“).
// node motiv.cjs, pak z kořene repa PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
// Motiv (motiv.cjs): seřazená mřížka 128 pozic (1989), 78 karmínových teček (2025) odspodu, 50 prázdných = ubylo,
// přerušovaná čára = dno 90. let (1999, 89); 1 tečka = 1 000 narozených dětí, čísla z _data_pipeline/cisla.json.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: '1989 × 2026', dal: 'Rodina' },
  legenda: [[null, 'Narozené děti, 1 tečka = 1 000 dětí'], ['#de1743', 'v roce 2025'], ['transparent;border:3px solid #ff8099;box-sizing:border-box', 'ubylo proti roku 1989']],
  logo: 'vlevo',
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  og: 'siroky', ogScrim: false,
  rozlozeni: {
    homepage: [{ prvky: ['kicker', 'titulek', 'pod'], x: 180, y: 120 }, { prvky: ['legenda', 'logo'], x: 180, y: 1080, dole: true }],
    og: [{ prvky: ['kicker', 'titulek', 'pod'], x: 320, y: 48 }, { prvky: ['legenda', 'logo'], x: 320, y: 584, dole: true }],
    square: [{ prvky: ['kicker', 'titulek', 'pod'], x: 70, y: 70 }, { prvky: ['legenda'], x: 1010, y: 1010, vpravo: true, dole: true }, { prvky: ['logo'], x: 70, y: 1010, dole: true }],
  },
  format: { homepage: { t: 80 }, og: { t: 40, sub: 17, leg: 16 }, instagram: { t: 84 }, story: { t: 88 } },
  pro: { og: { pod: 'O 50 tisíc méně než v roce 1989<br>a méně i než v nejhorším<br>roce 90. let', legenda: [[null, 'Narozené děti,<br>1 tečka = 1 000 dětí'], ['#de1743', 'v roce 2025'], ['transparent;border:3px solid #ff8099;box-sizing:border-box', 'ubylo proti roku 1989']] } },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
