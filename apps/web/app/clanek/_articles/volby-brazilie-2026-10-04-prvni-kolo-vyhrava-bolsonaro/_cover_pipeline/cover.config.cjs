// Sada coverů – node tools/cover-generator.cjs <tento soubor>
// (původní PIL generátor brazilie-cover-puvodni.py – text posunutý doprostřed kvůli tehdejšímu ořezu bočních karet)
const path = require('path');
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Volby', dal: 'v&nbsp;Brazílii', oddelovac: '' },
  nad: 'Prezidentské volby v&nbsp;Brazílii, predikce DataTimes.cz',
  titulek: 'První kolo vyhrává<br>Flávio Bolsonaro',
  pod: 'Druhé kolo se bude konat 25.&nbsp;října 2026<br>Lula ztratil pozici mírného favorita',
  barvy: { glowA: '#101432', glowB: '#101432', kick: '#f8f6f0' /* background.2 */, sub: '#d2d8e9' /* brandNavy.1 */, stitek: '#de1743' },
  motiv: {
    typ: 'obrazek', src: path.join(__dirname, 'brazil-flag-contour.webp'), jas: 0.8, opacityOg: 0.4, scrim: [30, 62],
    // [x, y, výška] obrázku mapy ve vlajce pro každý formát
    pozice: { homepage: [600, 150, 1000], og: [310, 20, 590], square: [360, 400, 680], instagram: [340, 560, 780], story: [150, 900, 900] },
  },
};
