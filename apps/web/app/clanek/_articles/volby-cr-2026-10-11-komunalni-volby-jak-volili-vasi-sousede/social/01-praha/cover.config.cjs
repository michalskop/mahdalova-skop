// vygenerováno socialni-site.cjs
const path = require('path');
const s = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  "vystup": "C:\\Users\\datov\\Desktop\\datatimes\\mahdalova-skop\\.claude\\worktrees\\ceske-volby-mapa-4343b6\\apps\\web\\app\\clanek\\_articles\\volby-cr-2026-10-11-komunalni-volby-jak-volili-vasi-sousede\\social\\01-praha",
  "kicker": {
    "cervene": "Mapa",
    "dal": "Komunální volby 2026"
  },
  "titulek": "Jak volili vaši<br>sousedé: Praha",
  "pod": "Kdo vyhrál kolik z&nbsp;1&nbsp;120 okrsků",
  "logo": "vlevo",
  "legenda": [
    [
      "#ff1a4a",
      "Starostové · 469"
    ],
    [
      "#5e66d5",
      "SPOLU · 344"
    ],
    [
      "#c19a78",
      "Praha Sobě · 159"
    ],
    [
      "#272a59",
      "ANO · 147"
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
