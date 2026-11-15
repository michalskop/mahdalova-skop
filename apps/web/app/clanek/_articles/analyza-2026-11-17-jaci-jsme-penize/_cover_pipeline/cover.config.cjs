// Sada coverů kapitoly Peníze – node motiv.cjs, pak z kořene repa
// PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
// Motiv (motiv.cjs): košík z jedné čisté výplaty, 1 ikona = desetina nákupu 1989; kuře 10 → 64, kadeřník (pánské stříhání) 10 → 3
// (_data_pipeline/vystup.txt, KOŠÍK Z JEDNÉ VÝPLATY). Pozadí a štítek jako cover speciálu.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: '1989 × 2026', dal: 'Peníze' },
  legenda: [[null, 'Kolik koupí průměrná čistá mzda:'], [null, '1 ikona = desetina nákupu v roce 1989']],
  logo: 'vlevo',
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  og: 'siroky', ogScrim: false,
  rozlozeni: {
    homepage: [{ prvky: ['kicker', 'titulek', 'pod'], x: 180, y: 120 }, { prvky: ['legenda'], x: 1320, y: 1078, vpravo: true, dole: true }, { prvky: ['logo'], x: 180, y: 1078, dole: true }],
    og: [{ prvky: ['kicker', 'titulek'], x: 320, y: 44 }, { prvky: ['logo'], x: 880, y: 584, vpravo: true, dole: true }, { prvky: ['pod'], x: 320, y: 584, dole: true }],
  },
  format: { homepage: { t: 80 }, og: { t: 40, sub: 17 }, square: { t: 72 }, instagram: { t: 72 }, story: { t: 72 } },
  pro: {
    square: { pod: 'Průměrná čistá mzda dnes koupí šestkrát víc kuřat<br>než v roce 1989, ale jen necelou třetinu<br>pánských stříhání' },
    instagram: { pod: 'Průměrná čistá mzda dnes koupí šestkrát víc kuřat<br>než v roce 1989, ale jen necelou třetinu<br>pánských stříhání' },
    homepage: { pod: 'Průměrná čistá mzda dnes koupí šestkrát víc kuřat<br>než v roce 1989, ale jen necelou třetinu pánských stříhání' },
    og: { pod: 'Kolik koupí průměrná čistá mzda:<br>1 ikona = desetina nákupu v roce 1989' },
    story: { pod: 'Průměrná čistá mzda dnes koupí<br>šestkrát víc kuřat než v roce 1989,<br>ale jen necelou třetinu pánských stříhání' },
  },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
