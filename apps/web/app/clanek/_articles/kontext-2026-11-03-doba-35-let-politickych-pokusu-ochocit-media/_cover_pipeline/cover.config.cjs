// Sada coverů – node motiv.cjs, pak node tools/cover-generator.cjs <tento soubor> (z kořene repa).
// Titulek a podtitulek z frontmatteru článku (coverTitulek s <br>, coverPodtitulek); tady jen jiné zalomení
// podtitulku pro jednotlivé formáty (pro.<formát>.pod, COVER-EDITOR.md → Kompozice podle formátu, bod 6).
// Motiv (motiv.cjs): retro televize ze speciálu Svobodná média bez vínového pozadí a bez nápisu „Freedom“,
// na ink blue se zářemi brandNavy.8 a brandAmethyst.8.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
const NAVY = '#101432'; // brandNavy.9
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Kontext', dal: 'Média veřejné služby' },
  // záře brandNavy.8 vlevo nahoře × brandAmethyst.8 za televizí; podtitulek brandNavy.1
  barvy: { glowA: '#2f325c', glowB: '#522a7a', glowPosB: '85% 75%', sub: '#d2d8e9', stitek: '#de1743' },
  logo: 'vlevo',
  og: 'siroky',
  ogScrim: false,
  format: { homepage: { t: 88 }, og: { t: 44, sub: 21 }, square: { t: 80 }, instagram: { t: 88 }, story: { t: 92 } },
  rozlozeni: {
    og: [
      { prvky: ['kicker', 'titulek'], x: 320, y: 48 },
      { prvky: ['pod'], x: 320, y: 300 },
      { prvky: ['logo'], x: 320, y: 584, dole: true },
    ],
  },
  pro: {
    homepage: { pod: '35 let politických<br>pokusů sáhnout na peníze<br>médií veřejné služby' },
    og: { pod: '35 let politických pokusů<br>sáhnout na peníze<br>médií veřejné služby' },
    square: { pod: '35 let politických pokusů<br>sáhnout na peníze médií<br>veřejné služby' },
    instagram: { pod: '35 let politických pokusů<br>sáhnout na peníze médií<br>veřejné služby' },
    story: { pod: '35 let politických pokusů<br>sáhnout na peníze<br>médií veřejné služby', logo: 'vpravo', barvy: { glowA: NAVY, glowB: NAVY, sub: '#d2d8e9', stitek: '#de1743' } },
  },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
