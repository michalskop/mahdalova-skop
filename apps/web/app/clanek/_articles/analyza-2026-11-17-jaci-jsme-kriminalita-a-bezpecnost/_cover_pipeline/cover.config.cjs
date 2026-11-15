// Sada coverů kapitoly Kriminalita a bezpečnost (speciál Jací jsme byli, jací jsme – 1989 × 2026).
// node motiv.cjs, pak z kořene repa: PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
// Motiv (motiv.cjs): tečkové sloupce 1973–2025, 1 tečka = 20 000 trestných činů zjištěných policií (data/trestne-ciny.json).
// Pozadí a barvy štítku jako cover speciálu (specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_cover_pipeline/cover.config.cjs).
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: '1989 × 2026', dal: 'Kriminalita a bezpečnost' },
  legenda: [[null, '1 tečka = 20 000 trestných činů zjištěných policií']],
  pro: {
    og: { legenda: [[null, '1 tečka = 20 000 trestných činů<br>zjištěných policií']], pod: 'Je ale pořád vyšší než v roce 1989, kdy policie<br>objasnila tři čtvrtiny činů a dnes necelou polovinu' },
    square: { pod: 'Je ale pořád vyšší než v roce 1989, kdy policie<br>objasnila tři čtvrtiny činů a dnes necelou polovinu' },
    instagram: { pod: 'Je ale pořád vyšší než v roce 1989, kdy policie<br>objasnila tři čtvrtiny činů a dnes necelou polovinu' },
    story: { legenda: [[null, '1 tečka = 20 000 trestných činů<br>zjištěných policií']], pod: 'Je ale pořád vyšší než v roce 1989,<br>kdy policie objasnila tři čtvrtiny činů<br>a dnes necelou polovinu' },
  },
  logo: 'vpravo',
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  og: 'siroky', ogScrim: false,
  format: { homepage: { t: 84, sub: 32 }, og: { t: 40, sub: 17, leg: 15 }, square: { t: 76, sub: 30 }, instagram: { t: 80, sub: 30 }, story: { t: 84, sub: 32 } },
  rozlozeni: {
    homepage: [{ prvky: ['kicker', 'titulek', 'pod'], x: 180, y: 140 }, { prvky: ['legenda'], x: 180, y: 1078, dole: true }, { prvky: ['logo'], x: 1320, y: 1078, vpravo: true, dole: true }],
    og: [{ prvky: ['kicker', 'titulek', 'pod'], x: 320, y: 48 }, { prvky: ['legenda'], x: 320, y: 584, dole: true }, { prvky: ['logo'], x: 880, y: 584, vpravo: true, dole: true }],
  },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
