// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 1 volby 2026).
// Motiv: mapa obcí ČR jako zlaté mince (brandYellow.6), plocha ∝ počtu obyvatel – peníze rozdělené mezi radnice.
const path = require('path');
const { obce, mapaObci } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-mapa-obci.cjs'));

const ZLATA = '#ffcf02'; // brandYellow.6
const PRAHA = Math.sqrt(Math.max(...obce().map((o) => o.p)));
const body = obce().map((o) => ({ ...o, k: Math.max(0.32, (Math.sqrt(o.p) / PRAHA) * 11), barva: ZLATA, op: 0.9 })).sort((a, b) => a.k - b.k);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Explainer', dal: 'Komunální volby 2026' },
  // Kateřina 26. 10.: titulek nesmí zpochybňovat institut obcí; informace = kolik peněz radnice spravují
  titulek: 'Obce hospodaří<br>s&nbsp;pětinou toho,<br>co utratí stát',
  pod: 'Co rozhodují radnice samy, co za stát<br>a&nbsp;kdo z&nbsp;vedení obce o&nbsp;čem',
  legenda: [[ZLATA, 'obec, plocha = počet obyvatel']],
  logo: 'vlevo',
  // brandYellow.9 / brandChocolate.8 záře, brandYellow.2 štítek coveru
  barvy: { glowA: '#a47d03', glowB: '#3b2414', kick: '#fff0b3', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 0.35, svg: mapaObci({ body }) },
};
