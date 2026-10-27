// Sdílené tečkové motivy coverů (tools/COVER-VIZUALNI-IDENTITA.md → 4.2 Tečková jednotka a sada motivů).
// Vrací SVG vrstvu pro každý formát pro cover.config.cjs: motiv: { typ: 'svg', svg: vrstva((klic, [cx, cy, R]) => …) }.
// Všechny motivy stojí na stejném principu jako „slunečnice“: jedna tečka = pevný počet, plocha ∝ počtu,
// plná tečka = to, o čem je zpráva, prázdný kroužek = chybějící část. Střídej je, ať se slunečnice neokouká:
//
//   slunecnice({ cx, cy, R, n, styl, rozsah? })  Vogelova spirála – počet a jeho změna (X lidí → Y lidí)
//   prstenec({ cx, cy, R, n, styl })            tečkový donut jako logo DataTimes – podíl (účast, procenta)
//   plastev({ cx, cy, R, n, styl })             šestiúhelníková plástev – počet, „úl“ lidí nebo obcí
//   parlament({ cx, cy, R, n, styl })           půlkruh křesel – rozložení mandátů, bloky (cy = spodní hrana)
//   sloupce({ x, y, w, h, hodnoty, jednotka, styl, popisky? })  tečkové sloupce – vývoj v čase
//   mrizka({ x, y, sloupcu, n, krok, styl })    řádky teček (waffle) – procenta, srovnání skupin
//   listek({ x, y, sloupcu, n, krok, krizku, barva, ramecek })  hlasovací lístek: čtverečky, v prvních `krizku` křížek
//   zare(cx, cy, R, barva)                      měkká záře za motivem
//   podkres(soubor, [x, y, w, h], { sytost, jas })  fotka jako tlumený podkres vpravo, k textu plynule mizí
//   vrstva(kresli, plochy?)  kresli(klic, [cx, cy, R]) → SVG obsah; plochy = { formát: [cx, cy, R] } (výchozí PLOCHY)
// styl(i) → { fill } plná tečka, { ring } prázdný kroužek s obrysem, s `ikona` místo tečky piktogram (IKONY níže).
const NAVY = '#101432'; // brandNavy.9

// motiv vpravo dole jako u slunečnice PPP; OG vpravo, celý vidět (text v OG zarovnaný doleva od x 285, Kateřina 26. 10.)
const PLOCHY = {
  homepage: [1135, 860, 320], square: [775, 775, 285], instagram: [700, 945, 320], story: [610, 1195, 315], og: [985, 330, 190],
};
const ROZMERY = { homepage: [1500, 1200], og: [1200, 630], square: [1080, 1080], instagram: [1080, 1350], story: [1080, 1920] };
const ZLATY = Math.PI * (3 - Math.sqrt(5));
const f1 = (v) => v.toFixed(1);

// Piktogramy místo teček (Kateřina 26. 10.: větrníky, kapky, srdíčka, postavy podle pohlaví…) – tvar v jednotkovém
// čtverci 0–1, skládají se do všech motivů stejně jako tečky: styl(i) → { ikona: 'zena', fill } nebo { ikona, ring }.
// Ikony potřebují víc místa než tečky: volit hrubší jednotku (např. 1 postava = 5 %), ať jich není víc než ~60 na motiv.
const IKONY = {
  osoba: '<circle cx=".5" cy=".22" r=".16"/><path d="M.2 1V.64Q.2 .44 .4 .44H.6Q.8 .44 .8 .64V1Z"/>',
  zena: '<circle cx=".5" cy=".2" r=".15"/><path d="M.5 .38L.84 .98H.16Z"/>',
  muz: '<circle cx=".5" cy=".2" r=".15"/><path d="M.27 .4H.73V.72H.62V1H.38V.72H.27Z"/>',
  kapka: '<path d="M.5 .04C.62 .26 .86 .5 .86 .68A.36 .36 0 0 1 .14 .68C.14 .5 .38 .26 .5 .04Z"/>',
  srdce: '<path d="M.5 .92L.13 .54A.22 .22 0 0 1 .5 .27A.22 .22 0 0 1 .87 .54Z"/>',
  vetrnik: '<path d="M.47 .4H.53L.57 1H.43Z"/>' + [0, 120, 240].map((u) => `<path transform="rotate(${u} .5 .38)" d="M.5 .38L.46 .02Q.5 0 .54 .04Z"/>`).join('') + '<circle cx=".5" cy=".38" r=".05"/>',
  domek: '<path d="M.5 .08L.95 .5H.82V.95H.18V.5H.05Z"/>',
};

const tecka = (x, y, r, { fill, ring, ikona }) => {
  if (ikona) {
    const a = r * 2.6; // ikona zabere skoro celou buňku, tečka jen ~ 3/4
    // „prázdný“ piktogram = plný tvar ztlumený na 40 % (obrysy drobných ikon splývají v řetízky)
    const barvy = ring ? `fill="${ring}" opacity="0.4"` : `fill="${fill}"`;
    return `<g transform="translate(${f1(x - a / 2)} ${f1(y - a / 2)}) scale(${f1(a)})" ${barvy}>${IKONY[ikona]}</g>`;
  }
  return ring
    ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 0.8)}" fill="${NAVY}" stroke="${ring}" stroke-width="${f1(r * 0.4)}"/>`
    : `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${fill}"/>`;
};

function slunecnice({ cx, cy, R, n, styl, rozsah = n }) {
  // rozsah = počet míst, podle kterého se počítá rozteč (např. výchozí rok), n = kolik teček kreslit
  const c = R / Math.sqrt(rozsah + 0.5), r = c * 0.56;
  let s = '';
  for (let i = 0; i < n; i++) {
    const rr = c * Math.sqrt(i + 0.5), a = i * ZLATY - Math.PI / 2;
    s += tecka(cx + rr * Math.cos(a), cy + rr * Math.sin(a), r, styl(i));
  }
  return s;
}

// Tečkový donut (Kateřina 26. 10.: tečky „šikovně rozesadit, ať sedí v mezerách“, jako dot-packing ve Flourishi):
// soustředné kružnice ve vzdálenosti √3/2 rozteče, na každé tolik teček, kolik se vejde po obvodu, a každá druhá
// kružnice pootočená o půl kroku – tečka sedí v mezeře mezi dvěma tečkami sousední kružnice (šestiúhelníkové těsnání).
// Přebytek vůči n ubere vnější kružnice (zůstane rovnoměrná). Pořadí jde po směru hodinových ručiček od 12 h přes
// všechny kružnice – prvních m teček = výseč m/n.
function prstenec({ cx, cy, R, n, styl, vnitrni = 0.5 }) {
  const r0 = R * vnitrni;
  const rozlozeni = (s) => {
    const h = (s * Math.sqrt(3)) / 2, kruhy = [];
    for (let rr = r0 + s / 2; rr <= R - s / 2 + 1e-6; rr += h) kruhy.push({ rr, m: Math.floor((2 * Math.PI * rr) / s) });
    return kruhy;
  };
  // největší rozteč, při které se vejde aspoň n teček
  let lo = 1, hi = R;
  for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (rozlozeni(mid).reduce((a, b) => a + b.m, 0) >= n) lo = mid; else hi = mid; }
  const s = lo, kruhy = rozlozeni(s);
  let navic = kruhy.reduce((a, b) => a + b.m, 0) - n;
  for (let j = kruhy.length - 1; navic > 0 && j >= 0; j--) { const ub = Math.min(navic, kruhy[j].m); kruhy[j].m -= ub; navic -= ub; }
  const body = [];
  kruhy.forEach(({ rr, m }, j) => { for (let i = 0; i < m; i++) body.push({ rr, a: ((i + (j % 2 ? 0.5 : 0) + 0.25) / m) * 2 * Math.PI }); });
  body.sort((p, q) => p.a - q.a || p.rr - q.rr);
  return body.map((b, i) => tecka(cx + b.rr * Math.sin(b.a), cy - b.rr * Math.cos(b.a), s * 0.4, styl(i))).join('');
}

// Parlament (půlkruh): n křesel v řadách mezi 0,4 R a R, počty v řadě ∝ poloměru; pořadí zleva doprava podle úhlu –
// prvních m křesel = levý blok. Střed (cx, cy) = střed spodní hrany půlkruhu.
function parlament({ cx, cy, R, n, styl, rad }) {
  const r0 = R * 0.4;
  rad = rad ?? Math.max(4, Math.round(Math.sqrt(n / 6)));
  const polomery = Array.from({ length: rad }, (_, j) => r0 + ((R - r0) * (j + 0.5)) / rad);
  const soucet = polomery.reduce((a, b) => a + b, 0);
  let zbyva = n;
  const body = [];
  polomery.forEach((rr, j) => {
    const m = j === rad - 1 ? zbyva : Math.round((n * rr) / soucet);
    zbyva -= m;
    for (let i = 0; i < m; i++) body.push({ rr, a: Math.PI - (m === 1 ? Math.PI / 2 : (i / (m - 1)) * Math.PI) });
  });
  body.sort((p, q) => q.a - p.a || p.rr - q.rr);
  const r = ((R - r0) / rad) * 0.38;
  return body.map((b, i) => tecka(cx + b.rr * Math.cos(b.a), cy - b.rr * Math.sin(b.a), r, styl(i))).join('');
}

// Plástev: n teček na šestiúhelníkové mřížce, nejbližší ke středu; pořadí od středu ven (prvních m = jádro).
function plastev({ cx, cy, R, n, styl }) {
  const s = Math.sqrt((2 * Math.PI * R * R) / (Math.sqrt(3) * n)), h = (s * Math.sqrt(3)) / 2;
  const k = Math.ceil(R / h) + 2, body = [];
  for (let j = -k; j <= k; j++) for (let i = -k; i <= k; i++) {
    const x = (i + (j % 2 ? 0.5 : 0)) * s, y = j * h;
    body.push({ x, y, d: Math.hypot(x, y) + Math.atan2(y, x) * 1e-6 });
  }
  body.sort((p, q) => p.d - q.d);
  return body.slice(0, n).map((b, i) => tecka(cx + b.x, cy + b.y, s * 0.36, styl(i))).join('');
}

// Tečkové sloupce: hodnoty[] → sloupce teček odspodu (1 tečka = `jednotka`), x/y = levý dolní roh plochy w × h.
// styl(sloupec, i) → styl tečky; popisky[] = text pod sloupci (např. roky).
function sloupce({ x, y, w, h, hodnoty, jednotka, styl, popisky = [], barvaPopisku = '#f8f6f0' }) {
  const vysky = hodnoty.map((v) => Math.round(v / jednotka));
  const max = Math.max(...vysky), sl = hodnoty.length;
  const krokX = w / sl;
  // počet teček v řádku sloupce volí tak, aby tečky byly co největší a sloupec se vešel do výšky i šířky
  const { krok, rad } = [1, 2, 3, 4, 5, 6].map((rad) => ({ rad, krok: Math.min(h / Math.ceil(max / rad), (krokX * 0.8) / rad) }))
    .reduce((a, b) => (b.krok > a.krok ? b : a));
  const r = krok * 0.36, fs = Math.max(14, krokX * 0.24);
  let s = '';
  vysky.forEach((v, c) => {
    const x0 = x + c * krokX + (krokX - rad * krok) / 2 + krok / 2;
    for (let i = 0; i < v; i++) s += tecka(x0 + (i % rad) * krok, y - krok / 2 - Math.floor(i / rad) * krok, r, styl(c, i));
    if (popisky[c] != null) s += `<text x="${f1(x + c * krokX + krokX / 2)}" y="${f1(y + fs * 1.3)}" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="600" font-size="${f1(fs)}" fill="${barvaPopisku}" stroke="${NAVY}" stroke-width="${f1(fs * 0.25)}" paint-order="stroke">${popisky[c]}</text>`;
  });
  return s;
}

function mrizka({ x, y, sloupcu, n, krok, styl }) {
  let s = '';
  for (let i = 0; i < n; i++) s += tecka(x + (i % sloupcu) * krok, y + Math.floor(i / sloupcu) * krok, krok * 0.36, styl(i));
  return s;
}

// Hlasovací lístek: n čtverečků (rámeček), v prvních `krizku` křížek v barvě `barva`. x, y = střed prvního políčka.
function listek({ x, y, sloupcu, n, krok, krizku, barva, ramecek }) {
  const a = krok * 0.66, sw = krok * 0.07;
  let s = '';
  for (let i = 0; i < n; i++) {
    const cx = x + (i % sloupcu) * krok, cy = y + Math.floor(i / sloupcu) * krok;
    s += `<rect x="${f1(cx - a / 2)}" y="${f1(cy - a / 2)}" width="${f1(a)}" height="${f1(a)}" rx="${f1(a * 0.12)}" fill="${NAVY}" stroke="${i < krizku ? barva : ramecek}" stroke-width="${f1(sw)}"/>`;
    if (i < krizku) {
      const d = a * 0.3;
      s += `<path d="M${f1(cx - d)} ${f1(cy - d)}L${f1(cx + d)} ${f1(cy + d)}M${f1(cx + d)} ${f1(cy - d)}L${f1(cx - d)} ${f1(cy + d)}" stroke="${barva}" stroke-width="${f1(sw * 2.2)}" stroke-linecap="round"/>`;
    }
  }
  return s;
}

// Fotka jako tlumený podkres pod tečkovým motivem (COVER-VIZUALNI-IDENTITA.md → 5.1): soubor vložený jako data URI,
// odbarvený (sytost), ztmavený (jas) a k levému okraji plynule mizí do pozadí, ať nepřekáží textu vlevo.
// [x, y, w, h] = obdélník, do kterého se fotka vepíše a ořízne (slice), ostrost = poloha výřezu ('xMidYMin' apod.).
function podkres(soubor, [x, y, w, h], { sytost = 0.35, jas = 0.55, zarovnani = 'xMidYMid', id = 'pk', vlevo = 0.5, vpravo = 0, nahore = 0, dole = 0.3, bod } = {}) {
  // bod = { fx, fy, X, Y, sirka, pomer }: místo ořezu „slice“ umístí fotku tak, aby její bod (fx, fy v podílech šířky
  // a výšky, např. obličej) ležel na plátně v (X, Y); sirka = šířka fotky v px, pomer = výška / šířka originálu.
  // [x, y, w, h] pak jen ořezává (maska).
  // vlevo/vpravo/nahore/dole = jak velká část fotky (0–1) u daného okraje plynule mizí do pozadí
  const fs = require('fs');
  const typ = soubor.endsWith('.png') ? 'png' : soubor.endsWith('.webp') ? 'webp' : 'jpeg';
  const uri = `data:image/${typ};base64,${fs.readFileSync(soubor).toString('base64')}`;
  const g = (smer, a, b) => `<linearGradient id="${id}${smer}" ${smer === 'h' ? 'x1="0" x2="1"' : 'x1="0" x2="0" y1="0" y2="1"'}><stop offset="0" stop-color="${a ? '#000' : '#fff'}"/><stop offset="${a}" stop-color="#fff"/><stop offset="${1 - b}" stop-color="#fff"/><stop offset="1" stop-color="${b ? '#000' : '#fff'}"/></linearGradient>`;
  return `<defs><filter id="${id}f"><feColorMatrix type="saturate" values="${sytost}"/><feComponentTransfer><feFuncR type="linear" slope="${jas}"/><feFuncG type="linear" slope="${jas}"/><feFuncB type="linear" slope="${jas}"/></feComponentTransfer></filter>
    ${g('h', vlevo, vpravo)}${g('v', nahore, dole)}
    <mask id="${id}m" maskUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${h}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}h)"/></mask>
    <mask id="${id}m2" maskUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${h}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}v)"/></mask></defs>
    <g mask="url(#${id}m2)"><g mask="url(#${id}m)">${bod ? `<image href="${uri}" x="${(bod.X - bod.fx * bod.sirka).toFixed(1)}" y="${(bod.Y - bod.fy * bod.sirka * bod.pomer).toFixed(1)}" width="${bod.sirka}" height="${(bod.sirka * bod.pomer).toFixed(1)}" preserveAspectRatio="none" filter="url(#${id}f)"/>` : `<image href="${uri}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${zarovnani} slice" filter="url(#${id}f)"/>`}</g></g>`;
}

const zare = (cx, cy, R, barva) => `<defs><radialGradient id="zare"><stop offset="0" stop-color="${barva}" stop-opacity=".5"/><stop offset="1" stop-color="${barva}" stop-opacity="0"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="${f1(R * 1.45)}" fill="url(#zare)"/>`;

function vrstva(kresli, plochy = PLOCHY) {
  return Object.fromEntries(Object.entries(ROZMERY).map(([k, [W, H]]) =>
    [k, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${kresli(k, plochy[k])}</svg>`]));
}

module.exports = { IKONY, podkres, vrstva, slunecnice, prstenec, parlament, plastev, sloupce, mrizka, listek, zare, PLOCHY, ROZMERY };
