// Sada coverů – node motiv.cjs, pak PW_PATH=<repo>/node_modules/playwright node ../../../../../../tools/cover-generator.cjs cover.config.cjs
// Motiv: medaile z 1 370 teček = všechna státní vyznamenání 1995–2025 od středu ven, ženy oranžově (viz motiv.cjs).
const path = require('path');
const { ZENY, MUZI } = require('./motiv.cjs');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Státní vyznamenání' },
  titulek: 'Za Pavla jsou<br>zásluhy žen<br>méně přehlížené',
  pod: 'Za Petra Pavla 28&nbsp;%,<br>za předchůdců 14&nbsp;%',
  legenda: [[ZENY, 'žena'], [MUZI, 'muž'], ['transparent', '1 tečka = 1 vyznamenání 1995–2025']],
  legendaPodTextem: true,
  logo: 'vlevo',
  format: { homepage: { t: 92 }, square: { t: 74 }, instagram: { t: 80 }, story: { t: 88 } },
  barvy: { glowA: '#2f325c', glowB: '#101432', glowPosA: '0% 0%', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
