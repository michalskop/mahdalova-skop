// Covery druhého článku (analyza-2026-10-28-statni-vyznamenani-komu): medaile s tečkami v barvách prezidentů.
// VARIANTA=prezidenti node motiv.cjs, pak cover-generator.cjs cover.prezidenti.config.cjs → ../../analyza-2026-10-28-statni-vyznamenani-komu/images/
const path = require('path');
const zaklad = require('./cover.config.cjs');
const { PREZ } = require('./motiv.cjs');

module.exports = {
  ...zaklad,
  vystup: path.join(__dirname, '..', '..', 'analyza-2026-10-28-statni-vyznamenani-komu', 'images'),
  titulek: 'Komu prezidenti<br>dávají medaile',
  pod: '1&nbsp;424 vyznamenání<br>od Havla po Pavla',
  legenda: PREZ.map((p) => [p[2], p[1]]), // „1 tečka = 1 vyznamenání 1995–2025“ kreslí motiv.cjs vpravo dole na úrovni loga
  motiv: { ...zaklad.motiv, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, path.join(__dirname, `motiv-prezidenti-${k}.svg`)])) },
};
