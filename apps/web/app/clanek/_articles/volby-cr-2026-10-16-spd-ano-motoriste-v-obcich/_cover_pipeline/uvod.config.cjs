// Úvodní obrázek do článku (ne cover): stejný motiv jako cover, ale bez štítku, titulku a podtitulku,
// mapa přes celou plochu. Vysvětlivka plných teček a kroužků je pod obrázkem v textu.
// PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor> homepage
// → _cover_pipeline/uvod/cover-homepage.png, zkopírovat do images/mapa-uvod.png
const path = require('path');
const cover = require('./cover.config.cjs');

module.exports = {
  ...cover,
  vystup: path.join(__dirname, 'uvod'),
  kicker: {},
  titulek: '',
  pod: '',
  mapaPozice: { homepage: [40, 60, 1460, 1150] },
};
