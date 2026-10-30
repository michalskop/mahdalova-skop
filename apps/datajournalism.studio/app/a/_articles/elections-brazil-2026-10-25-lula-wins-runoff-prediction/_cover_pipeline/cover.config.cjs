// English cover set (datatimes.org), translated copy of the Czech config.
// Sada coverů – node tools/cover-generator.cjs <tento soubor>
// Sourozenec coverů 1. kola (volby-brazilie-2026-10-04-prvni-kolo-vyhrava-bolsonaro): stejný motiv vlajky.
const path = require('path');
const MOTIV = {
  typ: 'obrazek', src: path.join(__dirname, 'brazil-flag-contour.webp'), jas: 0.8, opacityOg: 0.4, scrim: [30, 62],
  pozice: { homepage: [600, 150, 1000], og: [330, -80, 800], square: [360, 400, 680], instagram: [340, 560, 780], story: [150, 900, 900] },
};
// texty pro OG (titulek na dva řádky vedle mapy)
const SLOUPEC = { logo: 'vlevo', nad: 'Presidential runoff,<br>DataTimes.cz prediction', titulek: 'Lula wins<br>the runoff', pod: 'Lula 51.8%, Flávio Bolsonaro 48.2%<br>First-round winner loses<br>by 4.4&nbsp;million votes' };
module.exports = {
  logoText: 'DataTimes.org', // anglický web datajournalism.studio
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Brazil', dal: 'elections', oddelovac: '' },
  nad: 'Presidential runoff,<br>DataTimes.cz prediction',
  // OG (26. 10. 2026, Kateřina): ve stejném duchu jako homepage – velká mapa vpravo zajíždí pod text a pod ním je
  // ztmavená; text ve sloupci vlevo, logo pod textem.
  // OG: text a logo uvnitř středního čtverce 630 (x 285–915) s rezervou 30 px, aby je neořízl náhled WhatsAppu;
  // mapa zasahuje pod text, její levá část plynule mizí do tmy (scrim), jako na Instagramu – text a mapa se propojí.
  format: { og: { stred: false, box: [315, 48, 700, 584], t: 56, sub: 21, kick: 15, logo: 28 } },
  pro: {
    og: SLOUPEC, // stejný přechod (scrim) jako homepage: mapa pod titulkem jemně prosvítá
  },
  barvy: { glowA: '#101432', glowB: '#101432', kick: '#f8f6f0' /* background.2 */, sub: '#d2d8e9' /* brandNavy.1 */, stitek: '#de1743' },
  motiv: MOTIV,
};
