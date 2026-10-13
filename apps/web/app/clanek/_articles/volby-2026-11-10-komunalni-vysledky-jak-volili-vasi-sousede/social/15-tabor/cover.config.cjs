// vygenerováno socialni-site.cjs
const path = require('path');
const s = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  "vystup": "C:\\Users\\datov\\Desktop\\datatimes\\mahdalova-skop\\.claude\\worktrees\\ceske-volby-mapa-4343b6\\apps\\web\\app\\clanek\\_articles\\volby-2026-11-10-komunalni-vysledky-jak-volili-vasi-sousede\\social\\15-tabor",
  "kicker": {
    "cervene": "Mapa",
    "dal": "Komunální volby 2026"
  },
  "titulek": "Jak volili vaši<br>sousedé: Tábor",
  "pod": "Kdo vyhrál kolik z&nbsp;41 okrsků",
  "logo": "vlevo",
  "legenda": [
    [
      "#272a59",
      "ANO · 17"
    ],
    [
      "#c19a78",
      "Naše Česko · 10"
    ],
    [
      "#c49ad8",
      "Tábor 2020 · 7"
    ],
    [
      "#111111",
      "Živý Tábor · 5"
    ]
  ],
  "legendaPodTextem": true,
  "barvy": {
    "glowA": "#101432",
    "glowB": "#101432",
    "kick": "#f8f6f0",
    "sub": "#d2d8e9",
    "stitek": "#de1743"
  },
  "motiv": {
    "typ": "svg",
    soubory: { square: s('square'), instagram: s('instagram'), story: s('story') }
  }
};
