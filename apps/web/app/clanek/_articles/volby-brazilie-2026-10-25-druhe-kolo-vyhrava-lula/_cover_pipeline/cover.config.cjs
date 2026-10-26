// Sada coverů – node tools/cover-generator.cjs <tento soubor>
// Sourozenec coverů 1. kola (volby-brazilie-2026-10-04-prvni-kolo-vyhrava-bolsonaro): stejný motiv vlajky.
const path = require('path');
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Volby', dal: 'v&nbsp;Brazílii', oddelovac: '' },
  nad: 'Druhé kolo prezidentských voleb, predikce DataTimes.cz',
  titulek: 'Druhé kolo vyhrává<br>Lula',
  pod: 'Lula 51,8&nbsp;%, Flávio Bolsonaro 48,2&nbsp;%<br>Vítěz prvního kola prohrává o&nbsp;4,4 milionu hlasů',
  barvy: { glowA: '#101432', glowB: '#101432', kick: '#f8f6f0' /* background.2 */, sub: '#d2d8e9' /* brandNavy.1 */, stitek: '#de1743' },
  motiv: {
    typ: 'obrazek', src: path.join(__dirname, 'brazil-flag-contour.webp'), jas: 0.8, opacityOg: 0.4, scrim: [30, 62],
    pozice: { homepage: [600, 150, 1000], og: [310, 20, 590], square: [360, 400, 680], instagram: [340, 560, 780], story: [150, 900, 900] },
  },
};
