// vygenerováno socialni-site.cjs
const path = require('path');
const s = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  "vystup": "C:\\Users\\datov\\Desktop\\datatimes\\mahdalova-skop\\.claude\\worktrees\\ceske-volby-mapa-4343b6\\apps\\web\\app\\clanek\\_articles\\volby-2026-11-10-komunalni-vysledky-jak-volili-vasi-sousede\\social\\11-zlin",
  "kicker": {
    "cervene": "Mapa",
    "dal": "Komunální volby 2026"
  },
  "titulek": "Jak volili vaši<br>sousedé: Zlín",
  "pod": "Kdo vyhrál kolik z&nbsp;74 okrsků",
  "logo": "vlevo",
  "legenda": [
    [
      "#272a59",
      "ANO · 42"
    ],
    [
      "#ff1a4a",
      "Starostové · 21"
    ],
    [
      "#c19a78",
      "Zlín 21 · 9"
    ],
    [
      "#c5143c",
      "Pro lepší Zlín · 1"
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
