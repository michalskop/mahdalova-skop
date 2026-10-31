// Covery kapitoly 2 Zdravotnictví a péče (29. 10. 2026) – stejný systém jako kapitola 1, barva kapitoly #5e66d5 (dpbpChapters.json).
// Zadání jsou v DEF níže, motivy v MOTIVY (bary, tecky, cisla); každé číslo je v textu příslušného článku.
//   hlavička: velké logo speciálu (hlava s tečkami) + „Data pro budoucí premiérku“
//   štítek, VELKÝ titulek (hlavní sdělení článku), podtitulek, JEDEN motiv z čísel článku, logo DataTimes.cz dole
//   pozadí ink blue se zářemi, hlavní barva dat = barva kapitoly 1 (dpbpChapters.json, #de1743)
// node covery.cjs <id|all> [formát…]      formáty: homepage square instagram story og
const { chromium } = require('C:/Users/datov/Desktop/datatimes/mahdalova-skop/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..', '..', '..', '..', '..', '..');
const OUTROOT = path.join(__dirname, '..', '..', '..', '..', 'public', 'specialy', 'dpbp', 'og', '02-zdravotnictvi-a-pece');
const PODKLADY = __dirname;

const CH = '#5e66d5';
const NAVY = '#101432', CRIMSON = '#de1743', CORAL = '#a9aff3', BILA = '#f8f6f0', MOD = '#899aeb', ZLU = '#ffcf02', SED = '#4c4f8e';
const uri = (f, m) => `data:${m};base64,${fs.readFileSync(f).toString('base64')}`;
const donut = fs.readFileSync(path.join(REPO, 'apps', 'web', 'public', 'images', 'datatimes-donut.svg'), 'utf8').replace('<svg ', '<svg style="width:100%;height:100%" ');
const hlava = fs.readFileSync(path.join(__dirname, 'logo-dpbp-hlava.svg'), 'utf8')
  .replace('#ffcf02', '@a').replace('#f76800', '@b').replace('#101432', '@c')
  .replace('@a', '#101432').replace('@b', '#3f46a8').replace('@c', '#b9bef7')
  .replace('fill="#de1743"', `fill="${CORAL}"`)
  .replace('viewBox="-8 -8 716 716"', 'viewBox="-4 -4 548 701"')
  .replace('<svg ', '<svg style="height:100%;width:100%;transform:scaleX(-1)" ');

const typo = (s) => s
  .replace(/(^|[\s>])([vkszouaiVKSZOUAI]) /g, '$1$2&nbsp;')
  .replace(/([A-Za-zÁ-ž]) (\d)/g, '$1&nbsp;$2')
  .replace(/(\d) (%|žen|dětí|let|mil\.|tis\.|tisíc|milionů|milionu)/g, '$1&nbsp;$2');

// ---------- formáty (bezpečné zóny podle COVER-EDITOR.md) ----------
const FM = {
  homepage: { W: 1500, H: 1200, m: 180, top: 80, bot: 80, head: 175, hl: 58, kick: 24, t: 88, sub: 36, dt: 46 },
  square: { W: 1080, H: 1080, m: 70, top: 52, bot: 56, head: 135, hl: 45, kick: 21, t: 68, sub: 30, dt: 38 },
  instagram: { W: 1080, H: 1350, m: 70, top: 90, bot: 100, head: 150, hl: 48, kick: 22, t: 80, sub: 33, dt: 40 },
  story: { W: 1080, H: 1920, m: 80, top: 260, bot: 340, head: 165, hl: 52, kick: 24, t: 92, sub: 38, dt: 44 },
};

// ---------- motivy (kreslí se do plochy w × h) ----------
const halo = (fs_) => `stroke="${NAVY}" stroke-width="${(fs_ * 0.3).toFixed(1)}" paint-order="stroke" stroke-linejoin="round"`;
const T = (x, y, t, anchor, fill, fs_, weight = 600) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="${weight}" font-size="${fs_.toFixed(1)}" fill="${fill}" ${halo(fs_)}>${t}</text>`;
const C = (x, y, r, fill, extra = '') => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}"${extra}/>`;
const svgWrap = (w, h, inner) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block">${inner}</svg>`;
const fsOf = (w) => Math.max(20, Math.min(40, w * 0.032));

function lineChart(w, h, { x, y, serie, ticks, ref }) {
  const f = fsOf(w), L = f * 1.2, R = f * 7, Tp = f * 1.2, B = f * 2.6;
  const px = (v) => L + ((v - x[0]) / (x[1] - x[0])) * (w - L - R), py = (v) => Tp + (1 - (v - y[0]) / (y[1] - y[0])) * (h - Tp - B);
  let s = `<line x1="${L}" x2="${w - R * 0.4}" y1="${py(y[0])}" y2="${py(y[0])}" stroke="${BILA}" stroke-opacity=".35" stroke-width="2"/>`;
  if (ref) s += `<line x1="${L}" x2="${w - R * 0.4}" y1="${py(ref.y)}" y2="${py(ref.y)}" stroke="${ZLU}" stroke-width="${f * 0.14}" stroke-dasharray="${f * 0.6} ${f * 0.4}"/>` + T(w - R * 0.4, py(ref.y) - f * 0.5, ref.t, 'end', ZLU, f * 0.95, 700);
  for (const [tx, tt] of ticks) s += T(px(tx), py(y[0]) + f * 1.6, tt, 'middle', BILA, f * 0.9, 500);
  for (const se of serie) {
    const pts = se.body.map(([a, b]) => [px(a), py(b)]);
    s += `<polyline points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${se.barva}" stroke-width="${f * 0.42}" stroke-linejoin="round" stroke-linecap="round"/>`;
    pts.forEach(([a, b], i) => { s += C(a, b, f * 0.55, se.barva, ` stroke="${NAVY}" stroke-width="${f * 0.16}"`); const lab = se.popisky?.[i]; if (lab) s += T(a + (lab[1] === 'r' ? f * 1.0 : lab[1] === 'l' ? -f * 1.0 : 0), b + (lab[1] === 'd' ? f * 1.95 : lab[1] === 'r' || lab[1] === 'l' ? f * 0.4 : -f * 1.0), lab[0], lab[1] === 'r' ? 'start' : lab[1] === 'l' ? 'end' : 'middle', BILA, f * 1.25, 700); });
  }
  return svgWrap(w, h, s);
}

const MOTIVY = {
  // vodorovné sloupce: radky = [[popisek, hodnota, text hodnoty, zvýraznit]]
  bary(w, h, { radky, max, jednotka }) {
    const f = fsOf(w), n = radky.length, L = f * 9.2, R = f * 5.2, lane = (h - (jednotka ? f * 1.8 : 0)) / n;
    const x = (v) => L + (v / max) * (w - L - R);
    let s = '';
    radky.forEach(([nazev, v, text, zv], i) => {
      const cy = lane * (i + 0.5), bh = Math.min(lane * 0.62, f * 2.2), barva = zv ? ZLU : CH;
      s += `<rect x="${L}" y="${(cy - bh / 2).toFixed(1)}" width="${(x(v) - L).toFixed(1)}" height="${bh.toFixed(1)}" rx="${(bh * 0.18).toFixed(1)}" fill="${barva}"/>`;
      s += T(L - f * 0.7, cy + f * 0.38, nazev, 'end', BILA, f * 1.05, zv ? 700 : 600) + T(x(v) + f * 0.6, cy + f * 0.45, text, 'start', zv ? ZLU : BILA, f * 1.3, 700);
    });
    if (jednotka) s += `<text x="${L}" y="${h - f * 0.2}" font-family="IBM Plex Sans" font-weight="500" font-size="${f * 0.9}" fill="${BILA}" fill-opacity=".85">${jednotka}</text>`;
    return svgWrap(w, h, s);
  },
  // tečkový waffle: total teček, filled plných; popis1 u plných, popis2 u prázdných
  tecky(w, h, { total, filled, popis1, popis2 }) {
    const f = fsOf(w);
    let best = { k: 0, c: 14 };
    for (let c = 6; c <= 30; c++) { const k = Math.min((w * 0.96) / c, (h - f * 4.4) / Math.ceil(total / c)); if (k > best.k) best = { k, c }; }
    const { k, c } = best, rows = Math.ceil(total / c), gw = k * c, gx = (w - gw) / 2;
    let s = '';
    for (let i = 0; i < total; i++) {
      const cx = gx + ((i % c) + 0.5) * k, cy = k * rows - (Math.floor(i / c) + 0.5) * k;
      s += i < filled ? C(cx, cy, k * 0.4, CH) : C(cx, cy, k * 0.34, 'none', ` stroke="${BILA}" stroke-opacity=".6" stroke-width="${Math.max(2, k * 0.08)}"`);
    }
    s += `<text font-family="IBM Plex Sans" font-size="${f * 1.05}" font-weight="600" fill="${BILA}"><tspan x="${gx}" y="${k * rows + f * 1.6}"><tspan fill="${CORAL}">●</tspan> ${popis1}</tspan><tspan x="${gx}" y="${k * rows + f * 3.0}"><tspan fill-opacity=".8">○</tspan> ${popis2}</tspan></text>`;
    return svgWrap(w, h, s);
  },
  // jedno velké číslo (nebo dvě) s popiskem
  cisla(w, h, { velka, pop }) {
    const f = fsOf(w), n = velka.length, lane = h / n;
    let s = '';
    velka.forEach(([cislo, popis, zv], i) => {
      const cy = lane * (i + 0.5), fs_ = Math.min(lane * 0.62, w / (cislo.length * 0.62));
      s += T(0, cy + fs_ * 0.28, cislo, 'start', zv ? ZLU : CORAL, fs_, 700) + T(0, cy + fs_ * 0.28 + f * 1.8, popis, 'start', BILA, f * 1.05, 600);
    });
    return svgWrap(w, h, s);
  },

  // řady teček: radky = [{ nazev, skupiny: [[počet, barva]…], total (počet obrysů), pozn }]
  rady(w, h, { radky, jednotka }) {
    const f = fsOf(w), n = radky.length, N = Math.max(...radky.map((r) => r.total || r.skupiny.reduce((a, g) => a + g[0], 0)));
    const L = f * 11, R = f * 6.5, k = Math.min((w - L - R) / N, (h - (jednotka ? f * 2.6 : 0)) / n * 0.9), lane = (h - (jednotka ? f * 2.2 : 0)) / n;
    let s = '';
    radky.forEach((r, i) => {
      const cy = lane * (i + 0.5), total = r.total || r.skupiny.reduce((a, g) => a + g[0], 0);
      let idx = 0;
      for (let j = 0; j < total; j++) s += C(L + (j + 0.5) * k, cy, k * 0.3, 'none', ` stroke="${BILA}" stroke-opacity=".45" stroke-width="${Math.max(2, k * 0.07)}"`);
      r.skupiny.forEach(([c, b]) => { for (let j = 0; j < c; j++, idx++) s += C(L + (idx + 0.5) * k, cy, k * 0.4, b); });
      s += T(L - f * 0.7, cy + f * 0.38, r.nazev, 'end', BILA, f * 1.05, 700);
      if (r.pozn) s += T(L + total * k + f * 0.7, cy + f * 0.42, r.pozn, 'start', r.zv ? ZLU : BILA, f * 1.2, 700);
    });
    if (jednotka) s += `<text x="${L}" y="${h - f * 0.2}" font-family="IBM Plex Sans" font-weight="500" font-size="${f * 0.9}" fill="${BILA}" fill-opacity=".85">${jednotka}</text>`;
    return svgWrap(w, h, s);
  },
  // dvě skupiny sloupců v poměru k Česku (Česko = celá délka): skupiny = [{ nadpis, radky: [[popisek, podíl 0–100, text, zvýraznit]] }]
  dvojice(w, h, { skupiny }) {
    const f = fsOf(w), L = f * 8.6, R = f * 9, gh = h / skupiny.length;
    let s = '';
    skupiny.forEach((g, gi) => {
      const y0 = gi * gh + (gi ? f * 1.2 : 0), lane = (gh - f * 3.4) / g.radky.length;
      s += T(0, y0 + f * 1.1, g.nadpis, 'start', BILA, f * 1.1, 700);
      g.radky.forEach(([nazev, v, text, zv], i) => {
        const cy = y0 + f * 2.2 + lane * (i + 0.5), bh = Math.min(lane * 0.6, f * 1.9), x1 = L + (v / 100) * (w - L - R);
        s += `<rect x="${L}" y="${(cy - bh / 2).toFixed(1)}" width="${(x1 - L).toFixed(1)}" height="${bh.toFixed(1)}" rx="${(bh * 0.18).toFixed(1)}" fill="${zv ? ZLU : CH}"/>`;
        s += T(L - f * 0.7, cy + f * 0.38, nazev, 'end', BILA, f * 1.05, zv ? 700 : 600);
        if (text) s += T(x1 + f * 0.6, cy + f * 0.42, text, 'start', ZLU, f * 1.15, 700);
      });
    });
    return svgWrap(w, h, s);
  },
};

const D = (id) => id;
// ---------- zadání coverů (každé číslo je v textu příslušného článku) ----------
const DEF = {
  '01-pyramida': { stitek: 'Analýza', motiv: 'tecky', arg: { total: 100, filled: 53, popis1: 'za deset let v důchodovém věku', popis2: 'ostatní praktičtí lékaři' }, titulek: 'Polovina praktických lékařů míří do důchodu', pod: 'Kdo převezme jejich pacienty? Nový lékař se vzdělává deset let' },
  '02-stari': { stitek: 'Analýza', motiv: 'bary', arg: { max: 16, jednotka: 'roky ve zdraví po 65. narozeninách', radky: [['Švédové', 14, '14 let'], ['Češi', 8, '8 let', true]] }, titulek: 'Zdraví nám dochází o šest let dřív než Švédům', pod: 'Žijeme sice déle, jde ale o roky ve zdraví po 65. narozeninách' },
  '03-digital': { stitek: 'Analýza', motiv: 'tecky', arg: { total: 100, filled: 47, popis1: 'do pěti let v důchodovém věku', popis2: 'ostatní dětští psychiatři' }, titulek: 'Skoro polovina dětských psychiatrů brzy dosáhne důchodového věku', pod: 'Pomůže péče na dálku? Zákon ji upravuje od října 2024' },
  '04-sestry-a-skupinove-praxe': { stitek: 'Evropa', motiv: 'bary', arg: { max: 19, jednotka: 'zdravotní sestry na 1 000 obyvatel', radky: [['Norsko', 15.6, '16'], ['Česko', 9.0, '9', true]] }, titulek: 'Norská sestra smí skoro jako lékař. Česká skoro nic', pod: 'Rakousko rozšiřuje ordinace, kde spolu pracuje víc lékařů' },
  '07-zubari': { stitek: 'Analýza', motiv: 'cisla', arg: { velka: [['skoro 7 000', 'zubních lékařů v Česku, zhruba stejně jako před pěti lety']] }, titulek: 'Zubaři jsou. Místa pro pacienty na pojišťovnu chybějí', pod: 'Záleží, kolik zubařů má smlouvu s pojišťovnou' },
  '09-nemocnice': { stitek: 'Analýza', motiv: 'bary', arg: { max: 7.5, jednotka: 'nemocniční lůžka na 1 000 obyvatel', radky: [['Česko', 6.4, '6', true], ['vyspělé země', 4.2, '4']] }, titulek: 'Nemocniční lůžko bez personálu je jen postel', pod: 'Česko má lůžek víc než vyspělé země, personál ale chybí' },
  '10-kdo-se-postara': { stitek: 'Péče', motiv: 'bary', arg: { max: 22, jednotka: 'podíl výdajů na zdraví, který jde na péči o seniory', radky: [['průměr EU', 18, '18 %'], ['Česko', 13, '13 %', true]] }, titulek: 'Na péči o seniory dává Česko míň než Evropa. Kdo ji nahradí?', pod: 'Jde o podíl výdajů na zdraví. Péči rodin čísla neukazují' },
  '11-kdo-vlastni-peci': { stitek: 'Investigace', motiv: 'cisla', arg: { velka: [['455 000 lidí', 'je kapacita domovů, které spravuje 25 největších korporací', true]] }, titulek: 'Domovy pro seniory čím dál víc spravují korporace', pod: 'Soukromé vlastnictví samo o sobě problém není, potíž je neprůhlednost' },
  '12-treti-navrat-vojtecha': { stitek: 'Kontext', motiv: 'bary', arg: { max: 3000, jednotka: 'Kč měsíčně, které stát platí za jednoho člověka', radky: [['letos', 2200, '2 200'], ['výbor', 2400, '2 400'], ['vláda', 2500, '2 500', true]] }, titulek: 'Stát chtěl platit pojišťovnám o 21 miliard víc. Poslanci navrhují 13', pod: 'Poslanci sází na vyšší výběr pojistného, rozhodnuto ještě není' },
  '13-cekaci-doby': { stitek: 'Analýza', motiv: 'bary', arg: { max: 16, jednotka: 'z 1 000 lidí zůstane bez vyšetření kvůli čekání', radky: [['průměr EU', 12, '12'], ['Česko', 2, '2', true]] }, titulek: 'Kvůli čekání zůstanou bez vyšetření jen 2 Češi z tisíce', pod: 'Kde je háček? Jak dlouho se čeká, data neukazují' },
  '14-kolik-stoji-kdo-plati': { stitek: 'Analýza', motiv: 'tecky', arg: { total: 100, filled: 14, popis1: 'ze sta korun platí pacienti sami', popis2: 'ostatní platí veřejné peníze' }, titulek: 'Ze sta korun na zdravotnictví platíme 14 ze své kapsy', pod: 'Zbytek hradí veřejné peníze, hlavně zdravotní pojištění' },
  '15-sousede-stredni-evropa': { stitek: 'Komparace', motiv: 'rady', arg: { jednotka: 'korun na zdraví na člověka (Česko = 10)', radky: [{ nazev: 'Česko', skupiny: [[10, CH]], pozn: '10' }, { nazev: 'Rakousko', skupiny: [[10, CH], [7, ZLU]], pozn: '17', zv: true }] }, titulek: 'Na zdraví dá Česko 10 korun, Rakousko 17', pod: 'Je tamní péče o tolik lepší? Výdaje samy o kvalitě nerozhodují' },
  'svet-japonsko-stari': { stitek: 'Svět', motiv: 'rady', arg: { jednotka: 'z deseti lidí je starších 65 let', radky: [{ nazev: 'Japonsko dnes', skupiny: [[3, ZLU]], total: 10, pozn: 'skoro 3', zv: true }, { nazev: 'Česko dnes', skupiny: [[2, CH]], total: 10, pozn: '2' }, { nazev: 'Česko 2050', skupiny: [[3, CH]], total: 10, pozn: '3' }] }, titulek: 'Budoucnost Česka se nyní děje v Japonsku', pod: 'A vyplatí se na ni podívat už teď' },
  'svet-jizni-korea-lekari': { stitek: 'Svět', motiv: 'dvojice', arg: { skupiny: [{ nadpis: 'lékaři na obyvatele', radky: [['Česko', 100, ''], ['Jižní Korea', 60, 'o 40 % méně', true]] }, { nadpis: 'úmrtí, kterým šlo předejít', radky: [['Česko', 100, ''], ['Jižní Korea', 50, 'o polovinu méně', true]] }] }, titulek: 'Méně lékařů, méně předčasných úmrtí. Jak to dělá Jižní Korea?', pod: 'Dvě souvislosti ještě nevysvětlují příčinu rozdílu' },
  'explainer-drg': { stitek: 'Explainer', motiv: 'tecky', arg: { total: 100, filled: 7, popis1: 'peněz nemocnice dostalo podle diagnózy (rok 2019)', popis2: 'ostatní způsoby placení' }, titulek: 'Nemocnice dostávají zaplaceno podle diagnózy. Co to změní?', pod: 'Za stejnou diagnózu podobná platba, i když je léčba složitější' },
};

// motivy z piktogramů (od 30. 10. 2026) přebíjejí sloupce a tečky výše
const PIKTO = require('./piktogramy-02.cjs')({ T, C, svgWrap, fsOf, CH, NAVY, BILA, ZLU, CORAL });
Object.assign(MOTIVY, PIKTO.MOTIVY);
for (const [id, z] of Object.entries(PIKTO.ZADANI)) Object.assign(DEF[id], z);

// ---------- sestavení stránky ----------
const BG = () => `background:radial-gradient(ellipse 80% 70% at 0% 0%,#272a59cc 0%,#272a5900 60%),radial-gradient(ellipse 70% 60% at 100% 100%,#1c2260 0%,#1c226000 70%),${NAVY}`;

function coverHtml(F, d) {
  const { W, H, m } = F;
  return `<div id="cv" style="position:relative;width:${W}px;height:${H}px;overflow:hidden;${BG(W, H)};font-family:'IBM Plex Sans',Arial,sans-serif;color:#fff;display:flex;flex-direction:column;padding:${F.top}px ${m}px ${F.bot}px ${m}px;box-sizing:border-box">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:${F.head * 0.14}px;flex:none">
     <div style="display:flex;align-items:center;gap:${F.head * 0.14}px;height:${F.head}px">
      <div style="height:${F.head}px;width:${F.head * 0.78}px;flex:none">${hlava}</div>
      <div style="font:700 ${F.hl}px/1.05 'IBM Plex Serif',Georgia,serif;color:${CORAL}">Data pro budoucí<br>premiérku</div>
     </div>
     <div style="margin-top:${F.kick * 0.5}px;font:600 ${F.kick}px 'IBM Plex Sans';letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;text-align:right;line-height:1.7"><span style="color:${CORAL};border-bottom:3px solid ${CORAL};padding-bottom:6px">${d.stitek || 'Analýza'}</span><span style="color:${CORAL}"> • </span>Kapitola 2<br>Zdravotnictví a péče</div>
    </div>
    <div style="margin-top:${F.head * 0.2}px;font:700 ${F.t}px/1.06 'IBM Plex Serif',Georgia,serif;flex:none">${typo(d.titulek)}</div>
    <div style="margin-top:${F.t * 0.22}px;font:500 ${F.sub}px/1.3 'IBM Plex Sans';color:#dfe2fb;max-width:${(W - 2 * m) * (d.bok ? 0.62 : 0.94)}px;flex:none">${typo(d.pod).replace(/[.]$/, '')}</div>
    <div id="motiv" style="${d.bok ? `position:absolute;right:${m * 0.4}px;bottom:${F.bot + F.dt * 1.9}px;width:${(W - 2 * m) * 0.62}px;height:${H * 0.42}px` : `flex:1;margin-top:${F.t * 0.35}px;min-height:0;position:relative`}"></div>
    <div style="flex:none;margin-top:${d.bok ? 'auto' : (F.t * 0.3) + 'px'};${d.logoVpravo ? 'align-self:flex-end;' : ''}display:flex;align-items:center;gap:12px;font:700 ${F.dt}px 'IBM Plex Serif',Georgia,serif;color:#fff"><span style="width:${F.dt * 1.4}px;height:${F.dt * 1.4}px;display:block">${donut}</span>DataTimes.cz</div>
  </div>`;
}

(async () => {
  const [, , which = 'all', ...fm] = process.argv;
  const ids = which === 'all' ? Object.keys(DEF) : [which];
  const formats = fm.length ? fm : ['homepage', 'square', 'og', 'instagram', 'story'];
  const b = await chromium.launch({ channel: 'msedge' });
  for (const id of ids) {
    const d = DEF[id];
    if (!d) throw new Error('Neznámé id ' + id);
    const dir = path.join(OUTROOT, id);
    fs.mkdirSync(dir, { recursive: true });
    for (const fmt of formats) {
      const og = fmt === 'og';
      const F = FM[og ? 'square' : fmt];
      const W = og ? 1200 : F.W, H = og ? 630 : F.H;
      const inner = coverHtml(F, d);
      const wrap = og
        ? `<div style="position:relative;width:1200px;height:630px;overflow:hidden;${BG(1200, 630)}"><div style="position:absolute;left:285px;top:0;width:630px;height:630px;overflow:hidden"><div style="transform:scale(${630 / 1080});transform-origin:0 0">${inner}</div></div></div>`
        : inner;
      const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,700;1,400&family=IBM+Plex+Sans:wght@500;600;700&display=swap" rel="stylesheet"><style>html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden}</style></head><body>${wrap}</body></html>`;
      const pg = await b.newPage({ viewport: { width: W, height: H } });
      await pg.setContent(html, { waitUntil: 'networkidle' });
      await pg.evaluate(() => document.fonts.ready);
      const box = await pg.evaluate(() => { const m = document.querySelector('#motiv'); return [m.offsetWidth, m.offsetHeight]; });
      const scale = og ? 1080 / 1080 : 1;
      const html2 = MOTIVY[d.motiv](Math.floor(box[0]), Math.floor(box[1]), d.arg);
      await pg.evaluate((h) => { document.querySelector('#motiv').innerHTML = h; }, html2);
      await pg.waitForTimeout(250);
      const file = path.join(dir, og ? 'cover-og.jpg' : fmt === 'homepage' ? 'cover-homepage.png' : fmt === 'square' ? 'cover-square.png' : fmt === 'instagram' ? 'cover-instagram.png' : 'cover-story.png');
      await pg.screenshot(file.endsWith('.jpg') ? { path: file, type: 'jpeg', quality: 88 } : { path: file });
      await pg.close();
      console.log(path.relative(REPO, file), `${W}×${H}`, `${Math.round(fs.statSync(file).size / 1024)} kB`, 'motiv', box.slice(0, 2).map(Math.round).join('×'));
    }
  }
  await b.close();
})();
