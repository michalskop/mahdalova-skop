// Cover článku (motiv schválila Kateřina 25. 10. 2026): node motiv.cjs && node ../../../../../../tools/cover-generator.cjs cover.config.cjs
// Zdroj fotky: Desktop/Mahdalova & Skop/Ilustrační obrázky/stop-sexualni-nasili.webp (licenci ověřit před publikací)
const path = require('path');
const m = (k) => path.join(__dirname, 'motiv', `${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Domácí a&nbsp;sexuální násilí' },
  titulek: 'Češi obviňují oběti násilí<br>dvakrát víc než zbytek Evropy',
  pod: 'Zažité názory jsme porovnali se skutečnými daty',
  barvy: { glowA: '#101432', glowB: '#101432', sub: '#d2d8e9' /* brandNavy.1 */, stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 1, soubory: { homepage: m('homepage'), og: m('og'), square: m('square'), instagram: m('instagram'), story: m('story') } },
  format: { og: { box: [285, 26, 915, 330], t: 37, sub: 19 }, homepage: { t: 70 }, square: { t: 57 }, instagram: { t: 57 }, story: { t: 55 } },
};
