// vygenerováno socialni-site.cjs
const path = require('path');
const s = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  "vystup": "C:\\Users\\datov\\Desktop\\datatimes\\mahdalova-skop\\.claude\\worktrees\\ceske-volby-mapa-4343b6\\apps\\web\\app\\clanek\\_articles\\volby-cr-2026-10-10-komunalni-volby-jak-volili-vasi-sousede\\social\\05-liberec",
  "kicker": {
    "cervene": "Mapa",
    "dal": "Komunální volby 2026"
  },
  "titulek": "Jak volili vaši<br>sousedé: Liberec",
  "pod": "Kdo vyhrál kolik z&nbsp;87 okrsků",
  "logo": "vlevo",
  "legenda": [
    [
      "#c19a78",
      "Starostové · 69"
    ],
    [
      "#c49ad8",
      "Lepší Liberec · 12"
    ],
    [
      "#272a59",
      "ANO · 6"
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
