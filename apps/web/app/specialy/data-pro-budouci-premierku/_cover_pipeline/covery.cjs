// Covery kapitoly 1 Demografie (28. 10. 2026) – jeden jednoduchý systém pro všech deset dlaždic a všechny formáty.
//   hlavička: velké logo speciálu (hlava s tečkami) + „Data pro budoucí premiérku“
//   štítek, VELKÝ titulek (hlavní sdělení článku), podtitulek, JEDEN motiv z čísel článku, logo DataTimes.cz dole
//   pozadí ink blue se zářemi, hlavní barva dat = barva kapitoly 1 (dpbpChapters.json, #de1743)
// node covery.cjs <id|all> [formát…]      formáty: homepage square instagram story og
const { chromium } = require('C:/Users/datov/Desktop/datatimes/mahdalova-skop/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..', '..', '..', '..', '..', '..');
const OUTROOT = path.join(__dirname, '..', '..', '..', '..', 'public', 'specialy', 'dpbp', 'og', '01-demografie');
const PODKLADY = __dirname;
const MAPA = JSON.parse(fs.readFileSync(path.join(REPO, 'apps', 'web', 'app', 'clanek', '_articles', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'senat-mapa.json'), 'utf8'));

const NAVY = '#101432', CRIMSON = '#de1743', CORAL = '#ff4970', BILA = '#f8f6f0', MOD = '#899aeb', ZLU = '#ffcf02', SED = '#4c4f8e';
const uri = (f, m) => `data:${m};base64,${fs.readFileSync(f).toString('base64')}`;
const donut = fs.readFileSync(path.join(REPO, 'apps', 'web', 'public', 'images', 'datatimes-donut.svg'), 'utf8').replace('<svg ', '<svg style="width:100%;height:100%" ');
const hlava = fs.readFileSync(path.join(__dirname, 'logo-dpbp-hlava.svg'), 'utf8')
  .replace('#ffcf02', '@a').replace('#f76800', '@b').replace('#101432', '@c')
  .replace('@a', '#101432').replace('@b', '#a81134').replace('@c', '#ff8099')
  .replace('fill="#de1743"', `fill="${CORAL}"`)
  .replace('viewBox="-8 -8 716 716"', 'viewBox="-4 -4 548 701"')
  .replace('<svg ', '<svg style="height:100%;width:100%;transform:scaleX(-1)" ');
const DETI = uri(path.join(PODKLADY, 'deti-na-bodech-grafu.png'), 'image/png');

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
  // 01: dětský graf plodnosti (původní kresba), roky pod koncovými body
  deti(w, h) {
    const iw = 1030, ih = 400, s = Math.min(w / iw, h / ih), dw = iw * s, dh = ih * s, x0 = (w - dw) / 2, y0 = (h - dh) / 2;
    const f = fsOf(w);
    const lab = T(x0 + 50 * s, y0 + dh + f * 1.1, '1990', 'middle', BILA, f, 600) + T(x0 + 977 * s, y0 + dh + f * 1.1, '2025', 'middle', BILA, f, 600);
    return `<div style="position:relative;width:${w}px;height:${h}px"><img src="${DETI}" style="position:absolute;left:${x0}px;top:${y0 - f * 0.6}px;width:${dw}px;filter:brightness(1.6) saturate(1.15)"><svg width="${w}" height="${h}" style="position:absolute;left:0;top:${-f * 0.6}px">${lab}</svg></div>`;
  },
  // 02: na 100 žen 128 dětí (plné), k obnově 210 (prázdné kroužky)
  waffle(w, h) {
    const total = 210, filled = 128, f = fsOf(w);
    let best = { k: 0, c: 14 };
    for (let c = 6; c <= 30; c++) { const k = Math.min((w * 0.96) / c, (h - f * 4.4) / Math.ceil(total / c)); if (k > best.k) best = { k, c }; }
    const { k, c } = best, rows = Math.ceil(total / c), gw = k * c, gx = (w - gw) / 2, gy = 0;
    let s = '';
    for (let i = 0; i < total; i++) {
      const cx = gx + ((i % c) + 0.5) * k, cy = gy + k * rows - (Math.floor(i / c) + 0.5) * k;
      s += i < filled ? C(cx, cy, k * 0.4, CRIMSON) : C(cx, cy, k * 0.34, 'none', ` stroke="${BILA}" stroke-opacity=".6" stroke-width="${Math.max(2, k * 0.08)}"`);
    }
    s += `<text font-family="IBM Plex Sans" font-size="${f * 1.05}" font-weight="600" fill="${BILA}"><tspan x="${gx}" y="${k * rows + f * 1.6}"><tspan fill="${CORAL}">●</tspan> dnes: 128 dětí na 100 žen</tspan><tspan x="${gx}" y="${k * rows + f * 3.0}"><tspan fill-opacity=".8">○</tspan> k obnově populace: 210 dětí na 100 žen</tspan></text>`;
    return svgWrap(w, h, s);
  },
  // 03: Togo 8,4 → 14,0 mil., Česko 10,9 → 10,7 mil. (OSN, ČSÚ; článek 03)
  krizeni(w, h) {
    const f = fsOf(w);
    return lineChart(w, h - f * 1.6, { x: [2020, 2060], y: [6, 16], ticks: [[2024, '2024'], [2050, '2050']],
      serie: [{ body: [[2024, 8.4], [2050, 14.0]], barva: CORAL, popisky: [['8,4', 'd'], ['Togo 14,0', 'r']] },
        { body: [[2024, 10.9], [2050, 10.7]], barva: MOD, popisky: [['10,9', 'u'], ['Česko 10,7', 'r']] }] })
      .replace('</svg>', `<text x="0" y="${h - f * 0.2}" font-family="IBM Plex Sans" font-weight="500" font-size="${f * 0.9}" fill="${BILA}" fill-opacity=".85">obyvatel v milionech, projekce OSN a ČSÚ</text></svg>`).replace(/height="\d+" viewBox="0 0 (\d+) \d+"/, `height="${h}" viewBox="0 0 $1 ${h}"`);
  },
  // hantle: řádky zemí, prázdný bod = začátek, plný = konec; sloupce popsané hlavičkou (04, 12)
  hantle(w, h, spec) {
    const f = fsOf(w), L = f * 8.5, R = f * 4.5, n = spec.rady.length, lane = (h - f * 2.4) / n;
    const lo = spec.min, hi = spec.max, x = (v) => L + ((v - lo) / (hi - lo)) * (w - L - R);
    let s = T(x(spec.rady[0].a), f * 1.0, spec.hlavicka[0], 'middle', BILA, f * 0.9, 500) + T(x(spec.rady[0].b), f * 1.0, spec.hlavicka[1], 'middle', BILA, f * 0.9, 500);
    spec.rady.forEach((r, i) => {
      const cy = f * 2.4 + lane * (i + 0.5), col = r.barva || CORAL;
      s += `<line x1="${x(r.a)}" x2="${x(r.b)}" y1="${cy}" y2="${cy}" stroke="${col}" stroke-width="${f * 0.3}" stroke-linecap="round"/>`;
      s += C(x(r.a), cy, f * 0.62, NAVY, ` stroke="${col}" stroke-width="${f * 0.2}"`) + C(x(r.b), cy, f * 0.62, col, ` stroke="${NAVY}" stroke-width="${f * 0.14}"`);
      s += T(0, cy + f * 0.4, r.n, 'start', BILA, f * 1.15, 700);
      const [lo_, hi_] = r.a < r.b ? [r.a, r.b] : [r.b, r.a];
      s += T(x(lo_) - f * 1.0, cy + f * 0.4, String(lo_).replace('.', ','), 'end', BILA, f, 700) + T(x(hi_) + f * 1.0, cy + f * 0.4, String(hi_).replace('.', ','), 'start', BILA, f, 700);
    });
    return svgWrap(w, h, s);
  },
  // 05: průměrný věk matky při prvním dítěti 22,5 (1990) → 29,2 (2025), posun o 6,7 roku (ČSÚ, článek 05)
  vek(w, h) {
    const f = fsOf(w), n = 8, d = Math.min((w * 0.94) / n, h * 0.5), x0 = (w - d * n) / 2, cy = h * 0.5;
    let s = '';
    for (let i = 0; i < n; i++) {
      const krajni = i === 0 || i === n - 1, cx = x0 + (i + 0.5) * d;
      s += krajni ? C(cx, cy, d * 0.45, CRIMSON) : C(cx, cy, d * 0.32, 'none', ` stroke="${BILA}" stroke-opacity=".5" stroke-width="${Math.max(2, d * 0.05)}"`);
      if (krajni) s += `<text x="${cx.toFixed(1)}" y="${(cy + d * 0.12).toFixed(1)}" text-anchor="middle" font-family="IBM Plex Sans" font-weight="700" font-size="${(d * 0.3).toFixed(1)}" fill="${BILA}">${i === 0 ? '22,5' : '29,2'}</text>`;
    }
    s += T(x0 + d * 0.5, cy + d * 0.62 + f * 1.3, '1990', 'middle', BILA, f * 0.95, 600) + T(x0 + d * (n - 0.5), cy + d * 0.62 + f * 1.3, '2025', 'middle', BILA, f * 0.95, 600);
    s += T(w / 2, cy - d * 0.62, '+ 6,7 roku', 'middle', ZLU, f * 1.5, 700);
    return svgWrap(w, h, s);
  },
  // 16: lidí ve věku 15–64 na jednoho seniora 65+: 3,1 (2023), 2,5 (2040), 2,0 (2050); projekce ČSÚ 2023–2100
  rady(w, h) {
    const f = fsOf(w), Lm = f * 3.6, Rm = f * 5.2, N = 41, d = Math.min((w - Lm - Rm) / N, h / 4.2);
    let s = '';
    [['2023', 10, 31, '1 : 3,1'], ['2040', 10, 25, '1 : 2,5'], ['2050', 10, 20, '1 : 2,0']].forEach(([rok, a, b, pom], i) => {
      const cy = h * (0.14 + 0.22 * i);
      for (let k = 0; k < N; k++) s += C(Lm + (k + 0.5) * d, cy, d * 0.36, 'none', ` stroke="${SED}" stroke-width="${Math.max(1.5, d * 0.06)}" stroke-opacity=".8"`);
      for (let k = 0; k < a + b; k++) s += C(Lm + (k + 0.5) * d, cy, d * 0.4, k < a ? ZLU : MOD);
      s += T(0, cy + f * 0.4, rok, 'start', BILA, f * 1.2, 700) + T(Lm + N * d + f * 0.8, cy + f * 0.45, pom, 'start', ZLU, f * 1.35, 700);
    });
    s += `<text x="${Lm}" y="${h * 0.78}" font-family="IBM Plex Sans" font-weight="600" font-size="${f}" fill="${BILA}"><tspan fill="${ZLU}">●</tspan> senioři 65+ &#160;&#160;<tspan fill="${MOD}">●</tspan> lidé ve věku 15–64</text>`;
    return svgWrap(w, h * 0.86, s);
  },
  // 11: tečkovaná mapa ČR, šipky (ne kolečka): Karviná −12 %, Říčany +30 %
  mapa(w, h) {
    const lon = MAPA.dots.map((d) => d[0]), lat = MAPA.dots.map((d) => d[1]);
    const [x0, x1, y0, y1] = [Math.min(...lon), Math.max(...lon), Math.min(...lat), Math.max(...lat)];
    const kx = Math.cos((49.8 * Math.PI) / 180), sc = Math.min(w / ((x1 - x0) * kx), h / (y1 - y0));
    const ox = (w - (x1 - x0) * kx * sc) / 2, oy = (h - (y1 - y0) * sc) / 2;
    const P = (lo, la) => [ox + (lo - x0) * kx * sc, oy + (y1 - la) * sc];
    const r = Math.max(1.8, sc * 0.02), f = Math.max(fsOf(w), 26);
    let s = MAPA.dots.map(([lo, la]) => { const [x, y] = P(lo, la); return C(x, y, r * 1.1, '#6e75c4', ' opacity=".7"'); }).join('');
    const sip = (x, y, dolu, barva, nazev, pct, vlevo) => {
      const R = f * 1.05, dir = dolu ? 1 : -1;
      let g = C(x, y, R, barva, ` stroke="${NAVY}" stroke-width="${f * 0.2}"`);
      g += `<path d="M ${x} ${y - dir * R * 0.5} L ${x} ${y + dir * R * 0.4} M ${x - R * 0.38} ${y + dir * R * 0.02} L ${x} ${y + dir * R * 0.45} L ${x + R * 0.38} ${y + dir * R * 0.02}" stroke="${NAVY}" stroke-width="${f * 0.24}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      const tx = x + (vlevo ? -R - f * 0.6 : R + f * 0.6), an = vlevo ? 'end' : 'start';
      return g + T(tx, y - f * 0.05, nazev, an, BILA, f * 1.05, 700) + T(tx, y + f * 1.2, pct, an, barva, f * 1.35, 700);
    };
    const [kx_, ky_] = P(18.5369, 49.8546), [rx, ry] = P(14.6544, 49.9918);
    s += sip(kx_, ky_, true, CORAL, 'Karviná', '−20 %', true) + sip(rx, ry, false, ZLU, 'Říčany', '+47 %', true);
    return svgWrap(w, h, s);
  },
  // 10: bezdětné vysokoškolačky podle věku (SLDB 2021): 30–34 let 42,2 %, 45–49 let 11,1 %; 1 tečka = 1 %
  dvewaffle(w, h, spec) {
    const f = fsOf(w), k = Math.min((w * 0.44) / 10, (h - f * 4.2) / 10), gap = w * 0.08, gw = k * 10, x0 = (w - 2 * gw - gap) / 2;
    let s = '';
    spec.mrizky.forEach(({ nazev, n }, j) => {
      const gx = x0 + j * (gw + gap);
      for (let i = 0; i < 100; i++) { const cx = gx + (i % 10 + 0.5) * k, cy = k * 10 - (Math.floor(i / 10) + 0.5) * k; s += i < n ? C(cx, cy, k * 0.4, CRIMSON) : C(cx, cy, k * 0.3, SED, ' opacity=".55"'); }
      s += T(gx + gw / 2, k * 10 + f * 1.5, nazev, 'middle', BILA, f, 600) + T(gx + gw / 2, k * 10 + f * 3.1, n + ' %', 'middle', CORAL, f * 1.6, 700);
    });
    return svgWrap(w, h, s);
  },
  // 12: plodnost 2023: Švédsko 1,45, Maďarsko ≈1,57, Francie ≈1,72, Kanada 1,4–1,5; hranice obnovy 2,1
  zebrik(w, h) {
    const f = fsOf(w), L = f * 8.5, R = f * 1.5, x = (v) => L + ((v - 1.0) / 1.1) * (w - L - R), lane = h / 4.9;
    let s = `<line x1="${x(2.1)}" x2="${x(2.1)}" y1="0" y2="${h - f * 2}" stroke="${ZLU}" stroke-width="${f * 0.14}" stroke-dasharray="${f * 0.6} ${f * 0.4}"/>` + T(x(2.1), h - f * 0.3, '2,1 = hranice obnovy', 'end', ZLU, f * 0.95, 700);
    [['Švédsko', 1.45, CORAL], ['Maďarsko', 1.57, CORAL], ['Francie', 1.72, CORAL], ['Kanada', null, MOD]].forEach(([n, v, b], i) => {
      const cy = lane * (i + 0.95);
      s += `<line x1="${L}" x2="${x(2.1)}" y1="${cy}" y2="${cy}" stroke="${SED}" stroke-width="${f * 0.12}" stroke-opacity=".7"/>` + T(0, cy + f * 0.4, n, 'start', BILA, f * 1.15, 700);
      if (v) s += C(x(v), cy, f * 0.75, b, ` stroke="${NAVY}" stroke-width="${f * 0.16}"`) + T(x(v) - f * 1.1, cy - f * 0.75, String(v).replace('.', ','), 'end', BILA, f * 1.05, 700);
      else s += `<rect x="${x(1.4)}" y="${cy - f * 0.55}" width="${x(1.5) - x(1.4)}" height="${f * 1.1}" rx="${f * 0.5}" fill="${b}"/>` + T(x(1.4) - f * 0.5, cy - f * 0.75, '1,4–1,5', 'end', BILA, f * 1.05, 700);
    });
    return svgWrap(w, h, s);
  },
  // 08: v jeslích a školkách je 7,9 % dětí do tří let, v EU 40,6 % (Eurostat 2025); 1 tečka = 1 % (zaokrouhleno)
  bloky(w, h) {
    const f = fsOf(w), R = 5, cols = [2, 9], mez = 2.2, celkem = cols[0] + cols[1] + mez, k = Math.min(w / celkem, (h - f * 4) / R), x0 = (w - k * celkem) / 2;
    let s = '', gx = x0;
    [['Česko', 8, '7,9 %', CORAL, 2], ['EU', 41, '40,6 %', MOD, 9]].forEach(([n, pocet, lab, b, c]) => {
      for (let i = 0; i < pocet; i++) s += C(gx + (Math.floor(i / R) + 0.5) * k, k * R - (i % R + 0.5) * k, k * 0.4, b);
      s += T(gx + (c * k) / 2, k * R + f * 1.6, n, 'middle', BILA, f * 1.1, 600) + T(gx + (c * k) / 2, k * R + f * 3.1, lab, 'middle', b === MOD ? '#c9d0f5' : CORAL, f * 1.45, 700);
      gx += (c + mez) * k;
    });
    return svgWrap(w, h, s);
  },
};

// ---------- zadání deseti coverů (každé číslo je v textu článku; odvozená čísla jsou v komentáři) ----------
const DEF = {
  '01-proc-klesa-plodnost': { motiv: 'deti', titulek: 'Rodí se nejméně dětí za 240 let', pod: 'Plodnost klesla z 1,89 dítěte na ženu v roce 1990 na 1,28' },
  '02-co-znamena-plodnost': { rubrika: 'Explainer', motiv: 'waffle', titulek: 'Na čtyři ženy<br>připadá pět dětí', pod: 'K tomu, aby populace neubývala,<br>je třeba statisticky 2,1 dítěte na ženu' },
  '03-svet-populace': { rubrika: 'Svět', motiv: 'krizeni', titulek: 'Togo předstihne Česko kolem roku 2036', pod: 'Togo má 8,4 milionu obyvatel a roste o 2,2 % ročně, Česko 10,9 milionu a stagnuje' },
  '04-skandinavska-past': { rubrika: 'Evropa', motiv: 'hantle', titulek: 'Švédsko, Francie i Maďarsko vzestup plodnosti neudržely', pod: 'Plodnost po vrcholu klesla o 0,3 až 0,6 dítěte na ženu',
    spec: { min: 1.1, max: 2.2, hlavicka: ['vrchol', 'dnes'], rady: [{ n: 'Švédsko', a: 1.98, b: 1.42 }, { n: 'Francie', a: 2.03, b: 1.56, barva: '#899aeb' }, { n: 'Maďarsko', a: 1.61, b: 1.31, barva: '#ffcf02' }] } },
  '05-cas-rodicovstvi': { motiv: 'vek', titulek: 'Prvorodičky jsou o 6,7 roku starší než v roce 1990', pod: 'Průměrný věk matky při prvním dítěti vzrostl z 22,5 na 29,2 roku' },
  '16-starnuti-populace': { motiv: 'rady', logoVpravo: true, titulek: 'Na jednoho seniora dnes tři lidé v produktivním věku, v roce 2050 dva', pod: 'Poměr lidí ve věku 15–64 let k seniorům 65+: 3,1 v roce 2023, 2,5 v roce 2040, 2,0 v roce 2050' },
  '11-vylidnovani-obci': { motiv: 'mapa', bok: true, titulek: 'Od roku 2000 přibylo lidí ve 72 % obcí', pod: 'Karviná ztratila pětinu obyvatel,<br>Říčany o 47 % vyrostly' },
  '10-data-porody': { rubrika: 'Investigace', motiv: 'dvewaffle', titulek: 'Ve 30–34 letech je bezdětných 42 % vysokoškolaček', pod: 'Ve 45–49 letech jen 11 %: vzdělání mateřství hlavně odkládá',
    spec: { mrizky: [{ nazev: '30–34 let', n: 42 }, { nazev: '45–49 let', n: 11 }] } },
  '12-mezinarodni-srovnani': { rubrika: 'Komparace', motiv: 'hantle', titulek: 'Čtyři různé politiky, podobný pokles plodnosti', pod: 'Švédsko, Francie, Maďarsko i Kanada ztratily v letech 2021–2024 asi 0,2 dítěte na ženu, Česko 0,47',
    spec: { min: 1.1, max: 2.0, hlavicka: ['2021', '2024'], rady: [{ n: 'Švédsko', a: 1.67, b: 1.43 }, { n: 'Francie', a: 1.83, b: 1.61, barva: '#899aeb' }, { n: 'Maďarsko', a: 1.63, b: 1.41, barva: '#ffcf02' }, { n: 'Kanada', a: 1.44, b: 1.25, barva: '#4fd6b4' }] } },
  '08-politicke-sliby': { motiv: 'bloky', titulek: 'Jesle a školky má v Česku 8 % dětí do tří let', pod: 'V Evropské unii je to 40,6 %, dostupná péče o děti patří k nejúčinnějším opatřením' },
};

// ---------- sestavení stránky ----------
const BG = (bez) => bez ? '' : `background:radial-gradient(ellipse 80% 70% at 0% 0%,#272a59cc 0%,#272a5900 60%),radial-gradient(ellipse 70% 60% at 100% 100%,#431320 0%,#43132000 70%),${NAVY}`;

function coverHtml(F, d, bez) {
  const { W, H, m } = F;
  return `<div id="cv" style="position:relative;width:${W}px;height:${H}px;overflow:hidden;${BG(bez)};font-family:'IBM Plex Sans',Arial,sans-serif;color:#fff;display:flex;flex-direction:column;padding:${F.top}px ${m}px ${F.bot}px ${m}px;box-sizing:border-box">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:${F.head * 0.14}px;flex:none;height:${F.head}px">
     <div style="display:flex;align-items:center;gap:${F.head * 0.14}px;height:${F.head}px">
      <div style="height:${F.head}px;width:${F.head * 0.78}px;flex:none">${hlava}</div>
      <div style="font:700 ${F.hl}px/1.05 'IBM Plex Serif',Georgia,serif;color:${CORAL}">Data pro budoucí<br>premiérku</div>
     </div>
     <div style="font:600 ${F.kick}px 'IBM Plex Sans';letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;text-align:right;line-height:1.9"><span style="color:${CORAL};border-bottom:3px solid ${CORAL};padding-bottom:6px">${d.rubrika || 'Analýza'}</span><br>01 Demografie</div>
    </div>
    <div style="margin-top:${F.head * 0.2}px;font:700 ${F.t}px/1.06 'IBM Plex Serif',Georgia,serif;flex:none">${typo(d.titulek)}</div>
    <div style="margin-top:${F.t * 0.22}px;font:500 ${F.sub}px/1.3 'IBM Plex Sans';color:#ffd0da;max-width:${(W - 2 * m) * (d.bok ? 0.62 : 0.94)}px;flex:none">${typo(d.pod).replace(/[.]$/, '')}</div>
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
      const inner = coverHtml(F, d, og);
      const wrap = og
        ? `<div style="position:relative;width:1200px;height:630px;overflow:hidden;${BG()}"><div style="position:absolute;left:285px;top:0;width:630px;height:630px;overflow:hidden"><div style="transform:scale(${630 / 1080});transform-origin:0 0">${inner}</div></div></div>`
        : inner;
      const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,700;1,400&family=IBM+Plex+Sans:wght@500;600;700&display=swap" rel="stylesheet"><style>html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden}</style></head><body>${wrap}</body></html>`;
      const pg = await b.newPage({ viewport: { width: W, height: H } });
      await pg.setContent(html, { waitUntil: 'networkidle' });
      await pg.evaluate(() => document.fonts.ready);
      const box = await pg.evaluate(() => { const m = document.querySelector('#motiv'); return [m.offsetWidth, m.offsetHeight]; });
      const scale = og ? 1080 / 1080 : 1;
      const html2 = MOTIVY[d.motiv](Math.floor(box[0]), Math.floor(box[1]), d.spec);
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
