// Cover set – node motiv.cjs, then node tools/cover-generator.cjs <this file> (from the repo root).
// Headline and subtitle come from the article frontmatter (coverTitulek, coverPodtitulek).
// Motif (motiv.cjs): 490 SPD councillors from 2022 – 166 kept, 2 Prague city councillors (state-paid), 322 other lost.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
const RED = '#de1743';
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Komunální volby 2026', dal: 'Peníze stran' },
  barvy: { glowA: '#2f325c', glowB: '#522a7a', glowPosB: '80% 70%', sub: '#d2d8e9', stitek: RED },
  logo: 'vlevo',
  og: 'siroky',
  ogScrim: false,
  legendaPodTextem: true,
  legenda: [[null, 'Zastupitelé SPD po volbách 2022'], ['#f8f6f0', 'zůstali (166)'], [RED, 'pražští, stát za ně platil (2)'], ['#4c4f8e', 'ostatní ztracení (322)']],
  format: { homepage: { t: 90 }, og: { t: 40, sub: 18 }, square: { t: 76 }, instagram: { t: 84 }, story: { t: 96 } },
  rozlozeni: {
    og: [
      { prvky: ['kicker', 'titulek'], x: 320, y: 48 },
      { prvky: ['pod'], x: 320, y: 300 },
      { prvky: ['logo'], x: 320, y: 584, dole: true },
    ],
  },
  pro: {
    homepage: { pod: 'Od státu ztratí peníze<br>jen za dva pražské,<br>500 tisíc korun ročně' },
    og: { pod: 'Od státu ztratí peníze<br>jen za dva pražské,<br>500 tisíc korun ročně' },
    square: { pod: 'Od státu ztratí peníze jen za dva<br>pražské, 500 tisíc korun ročně' },
    instagram: { pod: 'Od státu ztratí peníze jen za dva<br>pražské, 500 tisíc korun ročně' },
    story: { pod: 'Od státu ztratí peníze jen za dva<br>pražské, 500 tisíc korun ročně' },
  },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
