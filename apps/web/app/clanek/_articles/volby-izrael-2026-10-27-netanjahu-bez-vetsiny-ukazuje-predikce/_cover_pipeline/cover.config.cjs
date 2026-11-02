// Sada coverů – node motiv.cjs, pak node tools/cover-generator.cjs <tento soubor>
// Motiv (motiv.cjs): tečkový sál Knesetu podle predikce, 1 tečka = 1 mandát; titulek a podtitulek z frontmatteru
// (coverTitulek / coverPodtitulek).
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Predikce', dal: 'Volby v&nbsp;Izraeli' },
  // barvy podle stran (Likud modrá, Jašar světle modrá, Ra'am zelená), odstíny pro tmavé pozadí; grafy v článku mají tytéž škály
  legenda: [['#5e66d5', 'Netanjahuův blok 53'], ['#8cdfef', 'Eisenkotova opozice 48'], ['#8dd265', 'arabské strany 19']],
  // legenda v toku textu pod podtitulkem: dolní roh vlevo i vpravo patří sálu a logu
  legendaPodTextem: true,
  // brandTeal.8 × brandRoyalBlue.8 (tyrkysová × královská modř, COVER-VIZUALNI-IDENTITA 7), brandNavy.1 podtitulek
  barvy: { glowA: '#044d5e', glowB: '#272a59', kick: '#f8f6f0', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
