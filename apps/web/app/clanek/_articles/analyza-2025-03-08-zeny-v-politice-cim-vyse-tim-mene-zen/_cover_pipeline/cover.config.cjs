// Sada coverů – node motiv.cjs, pak PW_PATH=<repo>/node_modules/playwright node ../../../../../../../tools/cover-generator.cjs cover.config.cjs
// Motiv: tečkový graf podílu žen (hejtmanky, radní, zastupitelky, kandidátky), ženy červeně (viz motiv.cjs). Nahrazuje starý cover = screenshot grafu
// (images/main.png), který v bočním boxu 🔻🔻🔻 působil nečitelně (Kateřina 27. 10. 2026).
const path = require('path');

const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Ženy v politice' },
  titulek: 'Čím výš<br>v politice,<br>tím méně žen',
  pod: 'Podíl žen v krajské politice po volbách 2024',
  logo: 'vlevo',
  barvy: { glowA: '#2f325c', glowB: '#101432', glowPosA: '0% 0%', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
