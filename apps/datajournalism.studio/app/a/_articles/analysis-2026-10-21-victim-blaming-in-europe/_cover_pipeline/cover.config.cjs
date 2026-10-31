// English cover (datatimes.org), translated from the Czech config. Cover článku (motiv schválila Kateřina 25. 10. 2026): node motiv.cjs && node ../../../../../../tools/cover-generator.cjs cover.config.cjs
// Zdroj fotky: Desktop/Mahdalova & Skop/Ilustrační obrázky/stop-sexualni-nasili.webp (licenci ověřit před publikací)
const path = require('path');
const m = (k) => path.join(__dirname, 'motiv', `${k}.svg`);
module.exports = {
  logoText: 'DataTimes.org', // anglický web datajournalism.studio
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analysis', dal: 'Domestic and sexual violence' },
  titulek: 'Czechs blame victims<br>of violence twice as often<br>as the rest of Europe',
  pod: 'We compared common beliefs<br>with the actual data',
  barvy: { glowA: '#101432', glowB: '#101432', sub: '#d2d8e9' /* brandNavy.1 */, stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 1, soubory: { homepage: m('homepage'), og: m('og'), square: m('square'), instagram: m('instagram'), story: m('story') } },
  format: { og: { stred: false, box: [285, 34, 915, 596], t: 34, sub: 17, kick: 13, logo: 24 }, homepage: { t: 70 }, square: { t: 57 }, instagram: { t: 57 }, story: { t: 55 } },
};
