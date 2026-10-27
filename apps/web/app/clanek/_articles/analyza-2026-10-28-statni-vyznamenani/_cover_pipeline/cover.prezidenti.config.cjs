// Varianta coveru k porovnání (nepublikuje se): medaile s tečkami v barvách prezidentů.
// VARIANTA=prezidenti node motiv.cjs, pak cover-generator.cjs cover.prezidenti.config.cjs → varianta-prezidenti/
const path = require('path');
const zaklad = require('./cover.config.cjs');
const { PREZ } = require('./motiv.cjs');

module.exports = {
  ...zaklad,
  vystup: path.join(__dirname, 'varianta-prezidenti'),
  titulek: 'Komu prezidenti<br>dávají medaile',
  pod: '1&nbsp;372 vyznamenání od Havla po Pavla',
  legenda: [...PREZ.map((p) => [p[2], p[1]]), ['transparent', '1 tečka = 1 vyznamenání']],
  motiv: { ...zaklad.motiv, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, path.join(__dirname, `motiv-prezidenti-${k}.svg`)])) },
};
