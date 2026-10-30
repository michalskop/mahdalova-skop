// Sada coverů: python -I krivky_export.py (data z _data_pipeline/krivky.py), node motiv.cjs, pak
// PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// a kontrolní arch: PW_PATH=… node tools/kontaktni-arch.cjs <images/ článku> _cover_pipeline/kontaktni-arch.png
// Text coveru (titulek, podtitulek) je ve frontmatteru článku (coverTitulek, coverPodtitulek) – sem nepatří.
// Motiv (motiv.cjs): pět křivek indexu počtu obyvatel kolem začátku genocidy (rok před = 100, Světová banka);
// Kambodža a Rwanda padají (brandOrange.6/.4), Guatemala, Irák a Myanmar rostou dál (brandTeal.3/.4/.5).
// Graf vpravo a dole, text vlevo nahoře; OG = výchozí „čtverec s ušima“ (čtvercový cover zmenšený na 630).
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Explainer', dal: 'Genocida a čísla' },
  // homepage: text níž kvůli štítku rubriky v malých kartách (nic textového nad ~200 z 800)
  format: { homepage: { box: [180, 300, 1320, 1080] } },
  // brandTeal.8 × brandRoyalBlue.8 záře (COVER-VIZUALNI-IDENTITA 7), podtitulek brandNavy.1, štítek brand.6
  barvy: { glowA: '#044d5e', glowB: '#272a59', glowPosA: '100% 15%', glowPosB: '0% 100%', sub: '#d2d8e9', stitek: '#de1743' },
  // story: čisté ink blue bez záře (COVER-EDITOR.md, kontrola bod 4)
  pro: { story: { barvy: { glowA: '#101432', glowB: '#101432', sub: '#d2d8e9', stitek: '#de1743' } } },
  motiv: { typ: 'svg', opacityOg: 1, soubory: { homepage: soubor('homepage'), og: soubor('square'), square: soubor('square'), instagram: soubor('instagram'), story: soubor('story') } },
};
