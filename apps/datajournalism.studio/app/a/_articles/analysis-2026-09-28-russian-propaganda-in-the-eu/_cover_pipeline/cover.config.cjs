// English cover set (datatimes.org) – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Text coveru (titulek, podtitulek) je ve frontmatteru článku (coverTitulek, coverPodtitulek) – sem nepatří.
// Motiv (motiv.cjs): hantle sankce × zbraně pro Ukrajinu po zemích EU z ../data/sankce-a-zbrane.json, zvýrazněné
// Česko 65 × 32 a průměr EU 70 × 56. Barevná slova v podtitulku (sankce tyrkysově, zbraně fialově) slouží jako legenda.
// Graf jde diagonálně zprava nahoře doleva dolů, text sedí v prázdném levém horním trojúhelníku.
const path = require('path');
const { svg } = require('./motiv.cjs');

module.exports = {
  logoText: 'DataTimes.org', // anglický web datajournalism.studio
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analysis' },
  // brandTeal.9 × brandAmethyst.9 záře, podtitulek brandNavy.1, štítek brand.6
  barvy: { glowA: '#023440', glowB: '#351040', glowPosA: '0% 0%', glowPosB: '100% 100%', sub: '#d2d8e9', stitek: '#de1743' },
  pro: { story: { barvy: { glowA: '#101432', glowB: '#101432', sub: '#d2d8e9', stitek: '#de1743' } } },
  og: 'siroky', ogScrim: false,
  format: { og: { t: 46, sub: 20, logo: 24 }, homepage: { t: 92 }, story: { t: 88 } },
  rozlozeni: { og: [{ prvky: ['kicker', 'titulek', 'pod'], x: 320, y: 48 }, { prvky: ['logo'], x: 880, y: 48, vpravo: true }] },
  motiv: { typ: 'svg', opacityOg: 1, svg: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, svg(k)])) },
};
