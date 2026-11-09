// Cover set – node motiv.cjs, then node tools/cover-generator.cjs <this file> (from the repo root).
// Headline and subtitle come from the article frontmatter (coverTitulek, coverPodtitulek).
// Motif (motiv.cjs): 100 figures, 60 crimson = Bectu 2024: more than 60 % of respondents did not report
// harassment for fear for their career (_data_pipeline/bectu.py).
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
const RED = '#de1743';
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Kontext', dal: 'Velká Británie • Média' },
  barvy: { glowA: '#2f325c', glowB: '#8b0e2b', glowPosB: '80% 70%', sub: '#d2d8e9', stitek: RED },
  logo: 'vlevo',
  og: 'siroky',
  ogScrim: false,
  legendaPodTextem: true, // the figure grid fills the bottom right corner
  legenda: [[RED, 'nenahlásili, báli se o práci'], [null, '1 postava = 1 % dotázaných (Bectu 2024)']],
  format: { homepage: { t: 92 }, og: { t: 42, sub: 18 }, square: { t: 78 }, instagram: { t: 84 }, story: { t: 96 } },
  rozlozeni: {
    og: [
      { prvky: ['kicker', 'titulek'], x: 320, y: 48 },
      { prvky: ['pod'], x: 320, y: 300 },
      { prvky: ['logo'], x: 320, y: 584, dole: true },
    ],
  },
  pro: {
    homepage: { pod: 'Lidé z britských médií a zábavy<br>mlčí ze strachu o práci.<br>Případ Russella Branda<br>ukazuje proč' },
    og: { pod: 'Lidé z britských médií<br>mlčí ze strachu o práci.<br>Případ Russella Branda<br>ukazuje proč' },
    square: { pod: 'Lidé z britských médií a zábavy<br>mlčí ze strachu o práci.<br>Případ Russella Branda ukazuje proč' },
    instagram: { pod: 'Lidé z britských médií a zábavy<br>mlčí ze strachu o práci.<br>Případ Russella Branda ukazuje proč' },
    story: { pod: 'Lidé z britských médií a zábavy<br>mlčí ze strachu o práci.<br>Případ Russella Branda ukazuje proč' },
  },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
