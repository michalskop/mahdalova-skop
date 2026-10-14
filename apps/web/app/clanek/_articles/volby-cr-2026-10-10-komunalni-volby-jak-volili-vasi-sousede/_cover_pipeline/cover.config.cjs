// Sada coverů – node motiv.cjs && PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv: ČR po okrscích + lupa nad Prahou (motiv.cjs, data z public/data/kv2026-okrsky).
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Mapa', dal: 'Komunální volby 2026' },
  titulek: 'Jak volili<br>vaši sousedé',
  pod: 'Kdo vyhrál ve všech 14&nbsp;551&nbsp;okrscích',
  logo: 'vlevo', // vpravo dole je lupa
  barvy: { glowA: '#101432', glowB: '#101432', kick: '#f8f6f0' /* background.2 */, sub: '#d2d8e9' /* brandNavy.1 */, stitek: '#de1743' },
  motiv: {
    typ: 'svg', opacityOg: 1,
    soubory: { homepage: soubor('homepage'), og: soubor('og'), square: soubor('square'), instagram: soubor('instagram'), story: soubor('story') },
  },
};
