// English cover set (datatimes.org) – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Převod českého coveru z Canvy („Babiš neumí počítat: regulace benzínek lidem neuleví“) do angličtiny.
// Titulek a podtitulek jsou ve frontmatteru článku (coverTitulek, coverPodtitulek). Motiv: motiv.cjs (fotka foto.jpg).
const path = require('path');
const { svg } = require('./motiv.cjs');

module.exports = {
  logoText: 'DataTimes.org', // anglický web datajournalism.studio
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analysis', dal: 'Czech Republic &nbsp;•&nbsp; Fuel prices' },
  // tmavé pozadí s červenou září jako původní cover
  barvy: { glowA: '#4a0a16', glowB: '#101432', glowPosA: '100% 30%', glowPosB: '0% 100%', sub: '#d2d8e9', stitek: '#de1743' },
  og: 'siroky', ogScrim: false,
  format: { og: { t: 50, sub: 20 } },
  rozlozeni: { og: [{ prvky: ['kicker', 'titulek', 'pod'], x: 320, y: 48 }, { prvky: ['logo'], x: 320, y: 584, dole: true }] },
  motiv: { typ: 'svg', opacityOg: 1, svg: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, svg(k)])) },
};
