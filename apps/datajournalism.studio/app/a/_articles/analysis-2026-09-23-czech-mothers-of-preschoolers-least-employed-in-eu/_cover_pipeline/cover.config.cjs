// English cover set (datatimes.org) – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Převod českého coveru (koláž fotek + pruhy otcové × matky) do angličtiny a do všech pěti formátů.
// Titulek a podtitulek jsou ve frontmatteru článku (coverTitulek, coverPodtitulek); nadtitulek tady.
// Motiv (motiv.cjs): koláž vlevo (výřez kolaz.jpg z původního coveru, bez textu), pruhy a zdroj vpravo.
// Koláž vlevo a text vpravo zachovávají kompozici schváleného českého coveru (COVER-EDITOR.md, kontrola bod 8).
const path = require('path');
const { svg } = require('./motiv.cjs');

module.exports = {
  logoText: 'DataTimes.org', // anglický web datajournalism.studio
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analysis', dal: 'Family and work' },
  nad: 'Czechia lets mothers into work',
  // čisté ink blue jako původní cover (koláž nese barvu), podtitulek brandNavy.1, nadtitulek brandNavy.2
  barvy: { glowA: '#101432', glowB: '#272a59', glowPosB: '100% 100%', sub: '#d2d8e9', stitek: '#de1743' },
  og: 'siroky', ogScrim: false,
  format: { homepage: { t: 112 }, og: { t: 52, sub: 20 }, square: { t: 84 }, instagram: { t: 92 }, story: { t: 110 } },
  // podtitulek se na homepage nevejde na jeden řádek vedle koláže
  pro: { homepage: { pod: 'Employed parents of children<br>under 6 (2025)' }, story: { barvy: { glowA: '#101432', glowB: '#101432', sub: '#d2d8e9', stitek: '#de1743' } } },
  rozlozeni: {
    homepage: [{ prvky: ['kicker'], x: 180, y: 120 }, { prvky: ['nad', 'titulek', 'pod'], x: 740, y: 330 }, { prvky: ['logo'], x: 1320, y: 1080, vpravo: true, dole: true }],
    og: [{ prvky: ['kicker', 'nad', 'titulek', 'pod'], x: 470, y: 48 }, { prvky: ['logo'], x: 880, y: 584, vpravo: true, dole: true }],
    square: [{ prvky: ['kicker', 'nad', 'titulek', 'pod'], x: 70, y: 70 }, { prvky: ['logo'], x: 1010, y: 1010, vpravo: true, dole: true }],
    instagram: [{ prvky: ['kicker', 'nad', 'titulek', 'pod'], x: 70, y: 110 }, { prvky: ['logo'], x: 1010, y: 1240, vpravo: true, dole: true }],
    story: [{ prvky: ['kicker', 'nad', 'titulek', 'pod'], x: 80, y: 260 }, { prvky: ['logo'], x: 1000, y: 1570, vpravo: true, dole: true }],
  },
  motiv: { typ: 'svg', opacityOg: 1, svg: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, svg(k)])) },
};
