// Covery kapitoly Zdraví a délka života speciálu „Jací jsme byli, jací jsme – 1989 × 2026“ (sourozenec coveru speciálu
// apps/web/app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_cover_pipeline/: trikolórové pozadí, karmínová jako „dnes“).
// node motiv.cjs, pak z kořene repa PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
// Motiv (motiv.cjs): srdce ze 72 teček (1989), karmínových 43 (2024), 29 prázdných = ubylo; 1 tečka = 1 000 zemřelých
// na nemoci oběhové soustavy, čísla z _data_pipeline/cisla.json.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: '1989 × 2026', dal: 'Zdraví a délka života' },
  legenda: [[null, 'Zemřelí na nemoci srdce a cév,<br>1 tečka = 1 000 lidí'], ['#de1743', 'v roce 2024'], ['transparent;border:3px solid #ff8099;box-sizing:border-box', 'ubylo proti roku 1989']],
  logo: 'vlevo',
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  og: 'siroky', ogScrim: false,
  rozlozeni: {
    homepage: [{ prvky: ['kicker', 'titulek', 'pod'], x: 180, y: 120 }, { prvky: ['legenda', 'logo'], x: 180, y: 1080, dole: true }],
    og: [{ prvky: ['kicker', 'titulek', 'pod'], x: 320, y: 48 }, { prvky: ['legenda', 'logo'], x: 320, y: 584, dole: true }],
    square: [{ prvky: ['kicker', 'titulek', 'pod'], x: 70, y: 70 }, { prvky: ['legenda', 'logo'], x: 70, y: 1010, dole: true }],
  },
  format: { homepage: { t: 68 }, og: { t: 40, sub: 19, leg: 16 }, square: { t: 80 }, instagram: { t: 80 }, story: { t: 80 } },
  // podtitulek z frontmatteru (coverPodtitulek), jen zalomený podle formátu
  pro: Object.fromEntries([
    ['homepage', 'Přestože Česko zestárlo.<br>V roce 1989 jich zemřelo 72 tisíc,<br>v roce 2024 43 tisíc'],
    ['og', 'Přestože Česko zestárlo.<br>V roce 1989 jich zemřelo 72 tisíc,<br>v roce 2024 43 tisíc'],
    ['square', 'Přestože Česko zestárlo. V roce 1989 jich zemřelo<br>72 tisíc, v roce 2024 43 tisíc'],
    ['instagram', 'Přestože Česko zestárlo. V roce 1989 jich zemřelo<br>72 tisíc, v roce 2024 43 tisíc'],
    ['story', 'Přestože Česko zestárlo. V roce 1989 jich zemřelo<br>72 tisíc, v roce 2024 43 tisíc'],
  ].map(([k, pod]) => [k, { pod }])),
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
