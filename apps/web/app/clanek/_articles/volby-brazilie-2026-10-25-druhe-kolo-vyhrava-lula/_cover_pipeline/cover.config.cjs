// Sada coverů – node tools/cover-generator.cjs <tento soubor>
// Sourozenec coverů 1. kola (volby-brazilie-2026-10-04-prvni-kolo-vyhrava-bolsonaro): stejný motiv vlajky.
const path = require('path');
const MOTIV = {
  typ: 'obrazek', src: path.join(__dirname, 'brazil-flag-contour.webp'), jas: 0.8, opacityOg: 0.4, scrim: [30, 62],
  pozice: { homepage: [828, 300, 660], og: [530, 12, 606], square: [360, 400, 680], instagram: [340, 560, 780], story: [150, 900, 900] },
};
// texty pro dvousloupcové OG a homepage (titulek na dva řádky vedle mapy)
const SLOUPEC = { logo: 'vlevo', nad: 'Druhé kolo prezidentských voleb,<br>predikce DataTimes.cz', titulek: 'Druhé kolo<br>vyhrává Lula', pod: 'Lula 51,8&nbsp;%, Flávio Bolsonaro 48,2&nbsp;%<br>Vítěz prvního kola prohrává<br>o&nbsp;4,4 milionu hlasů' };
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Volby', dal: 'v&nbsp;Brazílii', oddelovac: '' },
  nad: 'Druhé kolo prezidentských voleb, predikce DataTimes.cz',
  titulek: 'Druhé kolo vyhrává<br>Lula',
  pod: 'Lula 51,8&nbsp;%, Flávio Bolsonaro 48,2&nbsp;%<br>Vítěz prvního kola prohrává o&nbsp;4,4 milionu hlasů',
  // OG a homepage (26. 10. 2026, Kateřina): mapa vpravo, text vlevo ve sloupci – nic se nepřekrývá, logo pod textem.
  // OG: text a logo uvnitř středního čtverce 630 (x 285–915) s rezervou 30 px, aby je neořízl náhled WhatsAppu;
  // mapa zasahuje pod text, její levá část plynule mizí do tmy (scrim), jako na Instagramu – text a mapa se propojí.
  format: { og: { stred: false, box: [315, 48, 700, 584], t: 56, sub: 21, kick: 15, logo: 28 }, homepage: { sub: 33 } },
  pro: {
    og: { ...SLOUPEC, motiv: { ...MOTIV, scrim: [40, 74] } }, // mapa zasahuje pod text, její levá část mizí do tmy
    homepage: SLOUPEC,
  },
  logo: 'vlevo', // mapa leží vpravo/dole ve všech formátech, logo do volného levého dolního rohu
  barvy: { glowA: '#101432', glowB: '#101432', kick: '#f8f6f0' /* background.2 */, sub: '#d2d8e9' /* brandNavy.1 */, stitek: '#de1743' },
  motiv: MOTIV,
};
