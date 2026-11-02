// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 2 volby v zahraničí).
// Původní cover článku: billboard Jednotného Ruska (výřez bez zapečených textů) a titulek „Jak se vyrábí vítězství“,
// bez podtitulku, bez přechodů, v původních barvách (Kateřina 26. 10.).
// Kompozice: titulek nahoře na navy, billboard jako pás přes celou šířku pod ním, logo pod billboardem na navy –
// nikdy přes tváře nebo krky. Výřez je malý (760 × 428), proto pás, ne celá plocha.
const path = require('path');
const { vrstva, podkres } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-tecky.cjs'));

const BILLBOARD = path.join(__dirname, 'podklad-billboard.jpg');
// [x, y, w, h] pásu; slice + xMidYMax ořízne jen oblohu nahoře, tváře a postavy zůstanou
const FOTO = { homepage: [0, 500, 1500, 470], square: [0, 380, 1080, 520], instagram: [0, 470, 1080, 640], story: [0, 620, 1080, 820], og: [0, 0, 1200, 630] };

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Volby v&nbsp;Rusku 2026' },
  titulek: 'Jak se vyrábí<br>vítězství',
  logo: 'vlevo',
  // brandChocolate.8 / brandCoralRed.9 záře
  barvy: { glowA: '#3b2414', glowB: '#7d1810', kick: '#ffcec6', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 1, svg: vrstva((k) => podkres(BILLBOARD, FOTO[k], { sytost: 1, jas: 0.85, zarovnani: 'xMidYMax', id: `pk${k}`, vlevo: 0, dole: 0 })) },
};
