// vygenerováno socialni-site.cjs
const path = require('path');
const s = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  "vystup": "C:\\Users\\datov\\Desktop\\datatimes\\mahdalova-skop\\.claude\\worktrees\\ceske-volby-mapa-4343b6\\apps\\web\\app\\clanek\\_articles\\volby-2026-11-10-komunalni-vysledky-jak-volili-vasi-sousede\\social\\14-trebic",
  "kicker": {
    "cervene": "Mapa",
    "dal": "Komunální volby 2026"
  },
  "titulek": "Jak volili vaši<br>sousedé: Třebíč",
  "pod": "Kdo vyhrál kolik z&nbsp;39 okrsků",
  "logo": "vlevo",
  "legenda": [
    [
      "#ff1a4a",
      "Pro Třebíč · 20"
    ],
    [
      "#272a59",
      "ANO · 7"
    ],
    [
      "#111111",
      "Piráti · 5"
    ],
    [
      "#c19a78",
      "Třebíč Občanům! · 3"
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
