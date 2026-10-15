// Karty na sítě ke článku: čtyři města pod lupou (Ústí, Praha, Brno, Ostrava) ve formátech Instagram 4:5
// (carousel), čtverec (Bluesky / X / Facebook vícefoto) a stories 9:16. Čísla se berou z dat článku, nic se nepíše ručně.
// PW_PATH=<repo>/node_modules/playwright node socialni-site.cjs   → ../social/<město>/cover-{instagram,square,story}.png
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DATA = path.join(__dirname, '..', '..', '..', '..', '..', 'public', 'data', 'kv2026-okrsky');
const REPO = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..');
const SOCIAL = path.join(__dirname, '..', 'social');
const MESTA = [
  // [obec, krátké názvy kandidátek do legendy] – krajská města + nejpestřejší menší města (nejvíc různých vítězů okrsků)
  ['Praha', { 'STAROSTOVÉ A NEZÁVISLÍ': 'Starostové', 'SPOLU pro Prahu': 'SPOLU', 'PRAHA SOBĚ': 'Praha Sobě' }],
  ['Brno', { 'Lidovci a Starostové – Brno blíž lidem': 'Lidovci a Starostové', 'ODS, TOP 09 a nezávislí': 'ODS a TOP 09', 'ZELENÉ BRNO (Zelení, Žít Brno, SEN 21, LES, Volt, Budoucnost, Kruh)': 'Zelené Brno' }],
  ['Ostrava', { 'srdcOVA - ODS, Lidovci, TOP 09 a nestraníci': 'srdcOVA', 'STAROSTOVÉ pro OSTRAVU': 'Starostové' }],
  ['Plzeň', {}], ['Liberec', {}], ['Olomouc', {}], ['České Budějovice', {}], ['Hradec Králové', {}],
  ['Ústí nad Labem', { 'Vaše Ústí s podporou Za lepší Střekov': 'Vaše Ústí', 'SPOLU PRO ÚSTÍ': 'SPOLU', 'JEDNO ÚSTÍ': 'Jedno Ústí' }],
  ['Pardubice', {}], ['Zlín', {}], ['Karlovy Vary', {}], ['Jihlava', {}],
  ['Třebíč', {}], ['Tábor', {}],
];
const slug = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
const pct = (v) => `${(v * 100).toFixed(1).replace('.', ',')}&nbsp;%`;
const num = (v) => v.toLocaleString('cs-CZ').replace(/\s/g, '&nbsp;');
// krátký název do legendy: ruční zkratka, jinak název bez závorek a dovětků za pomlčkou / čárkou
const SPOLECNE = {
  'ANO 2011': 'ANO', 'ANO 2011 a nezávislí': 'ANO a nezávislí', 'STAROSTOVÉ A NEZÁVISLÍ': 'Starostové', 'Občanská demokratická strana': 'ODS',
  'Starostové pro Liberecký kraj': 'Starostové', 'OBČANÉ PRO BUDĚJOVICE A STAROSTOVÉ': 'Občané pro Budějovice', 'Hradecký demokratický klub a TOP 09': 'HDK a TOP 09',
  'PIRÁTI a STAROSTOVÉ': 'Piráti a Starostové', 'ODS PARDUBICE': 'ODS', 'NAŠE PARDUBICE': 'Naše Pardubice', 'PRO LEPŠÍ ZLÍN': 'Pro lepší Zlín', 'PRO TŘEBÍČ': 'Pro Třebíč', 'PRO PLZEŇ': 'Pro Plzeň',
};
const zkrat = (n) => n.replace(/\s*\(.*?\)\s*/g, ' ').split(/\s[–-]\s|,|\ss\spodporou\s/i)[0].trim();
const kratce = (n, mapa) => mapa[n] ?? SPOLECNE[n] ?? SPOLECNE[zkrat(n)] ?? zkrat(n);

const idx = JSON.parse(fs.readFileSync(path.join(DATA, 'obce.json'), 'utf8'));
const texty = [];
for (const [k, [obec, mapa]] of MESTA.entries()) {
  const slozka = `${String(k + 1).padStart(2, '0')}-${slug(obec)}`;
  const row = idx.obce.find((o) => o[1] === obec);
  const meta = JSON.parse(fs.readFileSync(path.join(DATA, 'meta', `${row[2]}.json`), 'utf8'));
  const kody = new Set(row[4].length ? row[4].map((m) => String(m[0])) : [String(row[0])]);
  const tot = new Map(), won = new Map();
  let plhl = 0, n = 0, kz;
  for (const [id, z] of Object.entries(meta.okrsky)) {
    if (!kody.has(id.split('-')[0]) || !z['1']) continue;
    const r = z['1']; kz = r[0]; n++; plhl += r[3];
    for (const [i, v] of r[4]) tot.set(i, (tot.get(i) ?? 0) + v);
    if (r[4].length) won.set(r[4][0][0], (won.get(r[4][0][0]) ?? 0) + 1);
  }
  const L = meta.zast[String(kz)].l;
  const poradi = [...won.keys()].sort((a, b) => won.get(b) - won.get(a));
  const prvni = poradi[0];
  const dir = path.join(SOCIAL, slozka);
  execFileSync('node', [path.join(__dirname, 'motiv.cjs'), obec, dir, 'square,instagram,story'], { stdio: 'inherit' });
  const cfg = path.join(dir, 'cover.config.cjs');
  const legenda = poradi.slice(0, 4).map((i) => [L[i].c, `${kratce(L[i].n, mapa)} · ${num(won.get(i))}`]);
  const pod = `Kdo vyhrál kolik z&nbsp;${num(n)} okrsků`;
  fs.writeFileSync(cfg, `// vygenerováno socialni-site.cjs\nconst path = require('path');\nconst s = (k) => path.join(__dirname, \`motiv-\${k}.svg\`);\nmodule.exports = ${JSON.stringify({
    vystup: dir,
    kicker: { cervene: 'Mapa', dal: 'Komunální volby 2026' },
    titulek: `Jak volili vaši<br>sousedé: ${obec.replace(/ /g, '&nbsp;')}`,
    pod, logo: 'vlevo', legenda, legendaPodTextem: true,
    barvy: { glowA: '#101432', glowB: '#101432', kick: '#f8f6f0', sub: '#d2d8e9', stitek: '#de1743' },
    motiv: { typ: 'svg', soubory: {} },
  }, null, 2).replace('"soubory": {}', "soubory: { square: s('square'), instagram: s('instagram'), story: s('story') }")};\n`);
  execFileSync('node', [path.join(REPO, 'tools', 'cover-generator.cjs'), cfg, 'square', 'instagram', 'story'], { stdio: 'inherit', env: process.env });
  texty.push(`${obec}: ${poradi.slice(0, 4).map((i) => `${kratce(L[i].n, mapa)} ${won.get(i)} okrsků (${pct(tot.get(i) / plhl).replace('&nbsp;', ' ')})`).join(', ')}; celkem ${n} okrsků`);
}
fs.writeFileSync(path.join(SOCIAL, 'cisla.txt'), texty.join('\n') + '\n');
console.log(texty.join('\n'));

// karty na sítě jako JPEG (PNG by v repu zabraly desítky MB): python prevod_jpg.py
execFileSync('python', [path.join(__dirname, 'prevod_jpg.py'), SOCIAL], { stdio: 'inherit' });
