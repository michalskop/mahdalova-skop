// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 1 volby 2026).
// Motiv: mapa všech obcí ČR, mátově obce pod 500 obyvatel (polovina obcí), ostatní tlumeně. Hustota teček sama
// ukazuje, kolik máme obcí. Počty obyvatel z poloh obcí (tools/cover-mapa-obci.cjs).
const path = require('path');
const { obce, mapaObci } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-mapa-obci.cjs'));

const MALA = '#12b886'; // brandEmeraldMint.5
const TLUM = '#4c4f8e'; // brandNavy.7
const PRAHA = Math.sqrt(Math.max(...obce().map((o) => o.p)));
const body = obce().map((o) => ({ ...o, k: Math.max(0.42, (Math.sqrt(o.p) / PRAHA) * 11), barva: o.p < 500 ? MALA : TLUM, op: o.p < 500 ? 1 : 0.85 }))
  .sort((a, b) => b.k - a.k); // velká města dospod, ať drobné oranžové obce zůstanou vidět

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analysis', dal: 'Czech municipal elections 2026' },
  titulek: 'Most municipalities<br>in&nbsp;Europe',
  pod: 'Three times as many per capita as Austria.<br>Half have fewer than 500 inhabitants',
  legenda: [[MALA, 'municipality under 500 inhabitants'], [TLUM, 'larger municipality']],
  logo: 'vlevo',
  // brandEmeraldMint.9 / brandRoyalBlue.8 záře, brandEmeraldMint.1 štítek coveru
  barvy: { glowA: '#042319', glowB: '#272a59', kick: '#c2f0e4', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 0.35, svg: mapaObci({ body }) },
};
