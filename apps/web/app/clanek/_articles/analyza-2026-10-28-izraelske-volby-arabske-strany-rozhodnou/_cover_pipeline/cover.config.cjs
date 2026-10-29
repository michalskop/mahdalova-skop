// Sada coverů – python -I -X utf8 ../_data_pipeline/mapa_obci.py, node motiv.cjs, pak
// node tools/cover-generator.cjs <tento soubor>. Titulek a podtitulek z frontmatteru (coverTitulek / coverPodtitulek).
// Motiv (motiv.cjs): bublinová mapa obcí, zeleně arabské obce – odtud přišla většina hlasů 19 arabských poslanců.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Volby v&nbsp;Izraeli' },
  legenda: [['#8dd265', 'arabské obce'], ['#8f9dc9', 'ostatní obce'], ['transparent', 'plocha kolečka = počet voličů']],
  legendaPodTextem: true,
  // mátová × královská modř (COVER-VIZUALNI-IDENTITA 7), záře ladí se zelenými arabskými obcemi; brandNavy.1 podtitulek
  barvy: { glowA: '#042319', glowB: '#272a59', kick: '#f8f6f0', sub: '#d2d8e9', stitek: '#de1743' },
  logo: 'vlevo',
  format: { homepage: { t: 86 }, square: { t: 72 }, instagram: { t: 76 } },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
