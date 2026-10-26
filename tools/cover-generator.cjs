// Společný generátor sady coverů DataTimes (tools/COVER-EDITOR.md → „Sada pro web a sociální sítě“).
// Z jednoho konfiguračního souboru článku vyrobí všech pět formátů se stejnými kotvami a písmy:
//   titulek            IBM Plex Serif Bold (jediný patkový text kromě loga)
//   kicker, nadtitulek, podtitulek, štítek, legenda   IBM Plex Sans
//   logo DataTimes.cz  donut + IBM Plex Serif Bold, vpravo dole v bezpečné zóně
// Kotvy homepage 1500×1200: text od x 180 / y 120, logo pravý dolní roh zóny (1320, 1080),
// oblast x ≥ 950, y ≤ 280 prázdná (štítek rubriky v malých kartách webu); ikona coveru až pod ní.
// OG 1200×630: titulek a logo ve středním čtverci 630×630 (WhatsApp, Bluesky a Messenger ořezávají).
// Barvy jen přesně ze závazné palety (packages/ui/DESIGN.md → Full palette).
//
// node tools/cover-generator.cjs <cesta ke cover.config.cjs> [formát…]
// (PW_PATH = cesta k balíčku playwright, výchozí 'playwright'; prohlížeč: nainstalovaný Microsoft Edge)
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const REPO = path.join(__dirname, '..');
const DONUT = fs.readFileSync(path.join(REPO, 'apps', 'web', 'public', 'images', 'datatimes-donut.svg'), 'utf8');
const NAVY = '#101432'; // brandNavy.9

// box = bezpečná zóna textu a loga [x0, y0, x1, y1]; mapa = kam se kreslí tečková mapa;
// ikona = [pravý okraj ČTVERCE ikony, horní hrana čtverce, strana čtverce] – zarovnává se podle čtverce piktogramu,
// ne podle okraje souboru (ikony mají uvnitř různé okraje, štítky, stíny); kick = štítek coveru, volený tak, aby se
// i nejdelší štítek série (VOLEBNÍ KALKULAČKA • KOMUNÁLNÍ A SENÁTNÍ VOLBY 2026) vešel na jeden řádek ve stejné velikosti; t/sub/kick/logo = velikosti písma; stred = vše na střed (OG)
const FORMATY = {
  homepage: { soubor: 'cover-homepage.png', w: 1500, h: 1200, box: [180, 120, 1320, 1080], mapa: [60, 400, 1480, 1150], ikona: [1280, 480, 150], t: 100, sub: 38, kick: 20, leg: 27, logo: 44 },
  og: { soubor: 'cover-og.jpg', w: 1200, h: 630, box: [285, 40, 915, 590], mapa: [0, 0, 1200, 630], ikona: null, t: 60, sub: 26, kick: 16, logo: 30, stred: true },
  square: { soubor: 'cover-square.png', w: 1080, h: 1080, box: [70, 70, 1010, 1010], mapa: [20, 470, 1070, 1050], ikona: [970, 80, 125], t: 88, sub: 34, kick: 24, leg: 24, logo: 40 },
  instagram: { soubor: 'cover-instagram.png', w: 1080, h: 1350, box: [70, 110, 1010, 1240], mapa: [20, 560, 1070, 1260], ikona: [970, 120, 125], t: 92, sub: 36, kick: 24, leg: 24, logo: 40 },
  story: { soubor: 'cover-story.png', w: 1080, h: 1920, box: [80, 260, 1000, 1570], mapa: [0, 860, 1080, 1580], ikona: [960, 280, 135], t: 104, sub: 40, kick: 24, leg: 26, logo: 44 },
};

const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const dataUri = (p) => `data:${MIME[path.extname(p)]};base64,${fs.readFileSync(p).toString('base64')}`;

// Projekce tečkové mapy do formátu: P(lon, lat) → [x, y] v pixelech, sc = měřítko.
function projekce(c, f) {
  const m = c.motiv;
  const [mx0, my0, mx1, my1] = f.mapa;
  const lon = m.dots.map((d) => d[0]), lat = m.dots.map((d) => d[1]);
  const [x0, x1, y0, y1] = [Math.min(...lon), Math.max(...lon), Math.min(...lat), Math.max(...lat)];
  const kx = Math.cos((49.8 * Math.PI) / 180);
  const sc = Math.min((mx1 - mx0) / ((x1 - x0) * kx), (my1 - my0) / (y1 - y0));
  const ox = mx0 + (mx1 - mx0 - (x1 - x0) * kx * sc) / 2, oy = my0 + (my1 - my0 - (y1 - y0) * sc) / 2;
  return { P: (lo, la) => [ox + (lo - x0) * kx * sc, oy + (y1 - la) * sc], sc };
}

function tecky(c, f) {
  const m = c.motiv;
  const { P, sc } = projekce(c, f);
  const r = Math.max(1.6, sc * 0.018);
  const op = f.stred ? 0.35 : 1; // u OG je mapa jen pozadí za textem
  const vol = new Set(m.vol);
  // m.otaznicky = [[lon, lat], …] – kandidátní tečky mapy (přesně ze seznamu dots, v pořadí priority). Po načtení
  // písem vybere vykresliOtaznicky() prvních m.pocetOtazniku, jejichž otazníček nekoliduje s textem, logem ani
  // velkým znakem, přebarví je na barvaBod a dokreslí nad ně horní oblouk „?“; tečkou otazníku je sama tečka mapy.
  const oz = new Map((m.otaznicky ?? []).map(([lo, la], i) => [`${lo},${la}`, i]));
  const d = m.dots.map(([lo, la, o]) => { const [x, y] = P(lo, la); const q = oz.has(`${lo},${la}`), qi = oz.get(`${lo},${la}`); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${vol.has(o) ? m.barvaObvod : m.barvaTecka}" opacity="${op}"${q ? ` data-otaznik="${m.barvaBod}" data-pocet="${m.pocetOtazniku ?? 8}" data-poradi="${qi}" data-ll="${lo},${la}"` : ''}/>`; }).join('');
  // bod může mít vlastní velikost (k = násobek poloměru tečky, výchozí 2,3), barvu a průhlednost – bublinová mapa
  // bod se znakem (o.znak, např. '?') se kreslí jako malý glyf IBM Plex Serif Bold s obrysem v barvě pozadí
  // o.popisek = nápis vedle bodu (Plex Sans, obrys v barvě pozadí; vždy plně, i v OG – místo musí být čitelné)
  // (u OG pod bodem na střed, ať nenaráží do titulku uprostřed)
  const popisek = (o, x, y) => { if (!o.popisek) return ''; const fs = (f.leg ?? 22) * 1.3, R = r * (o.k ?? 2.3); const pod = f.stred; return `<text x="${(pod ? x : x + R + fs * 0.45).toFixed(1)}" y="${(pod ? y + R + fs * 1.1 : y + fs * 0.35).toFixed(1)}"${pod ? ' text-anchor="middle"' : ''} font-family="IBM Plex Sans, Arial, sans-serif" font-weight="600" font-size="${fs}" fill="#f8f6f0" stroke="${NAVY}" stroke-width="${(fs * 0.28).toFixed(1)}" stroke-linejoin="round" paint-order="stroke">${o.popisek}</text>`; };
  const b = m.body.map((o) => { const [x, y] = P(o.lon, o.lat); return bod(o, x, y) + popisek(o, x, y); }).join('');
  function bod(o, x, y) { if (o.znak) { const fs = r * (o.k ?? 2.3) * 3.2; return `<text x="${x.toFixed(1)}" y="${(y + fs * 0.36).toFixed(1)}" text-anchor="middle" font-family="IBM Plex Serif, Georgia, serif" font-weight="700" font-size="${fs.toFixed(1)}" fill="${o.barva ?? m.barvaBod}" stroke="${o.obrys ?? m.obrysBod}" stroke-width="${(r * 0.7).toFixed(1)}" paint-order="stroke" opacity="${op * (o.op ?? 1)}">${o.znak}</text>`; } return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * (o.k ?? 2.3)).toFixed(1)}" fill="${o.barva ?? m.barvaBod}" stroke="${o.obrys ?? m.obrysBod}" stroke-width="${(r * 0.7).toFixed(1)}" opacity="${op * (o.op ?? 1)}"/>`; }
  return `<svg id="mapa" style="position:absolute;left:0;top:0" width="${f.w}" height="${f.h}">${d}${b}</svg>`;
}

function obrazek(c, f, klic) {
  const m = c.motiv;
  const [x, y, h] = m.pozice[klic];
  const op = f.stred ? m.opacityOg ?? 0.45 : 1;
  return `<img src="${dataUri(m.src)}" style="position:absolute;left:${x}px;top:${y}px;height:${h}px;mix-blend-mode:screen;opacity:${op};filter:brightness(${m.jas ?? 0.75})">`;
}

// motiv.typ 'svg': hotová vrstva motivu pro každý formát (soubory[klic] = SVG o rozměrech formátu, vkládá se inline,
// takže texty v ní berou IBM Plex ze stránky); u OG volitelně ztlumená (opacityOg).
// m.svg[klic] = SVG jako řetězec místo souboru (animation-generator.cjs mění obsah vrstvy #motiv snímek po snímku)
function svgVrstva(c, f, klic) {
  const m = c.motiv;
  const op = f.stred ? m.opacityOg ?? 1 : 1;
  const svg = m.svg?.[klic] ?? fs.readFileSync(m.soubory[klic], 'utf8');
  return `<div id="motiv" style="position:absolute;left:0;top:0;width:${f.w}px;height:${f.h}px;opacity:${op}">${svg}</div>`;
}

// Volitelný tečkovaný znak přes motiv (např. velký otazník): c.znak = { text, barva, opacity, opacityOg,
// pozice: { homepage: [střed x, účaří y, velikost písma], … }, teckaNaObvodu }. Znak se skládá jen z celých
// koleček na pravidelné mřížce (jako tečková mapa): glyf IBM Plex Serif Bold (ztučněný obrysem) se po načtení
// písem vykreslí do skrytého canvasu a kolečko vznikne v každém bodě mřížky, jehož střed leží uvnitř.
// teckaNaObvodu: tečku otazníku tvoří zvýrazněný obvod mapy (motiv.vol) – znak se zvětší tak, aby jeho tečka
// měla šířku obvodu, posune se tak, aby na obvod dosedla, a kolečka tečky se nekreslí (pozice pak nese jen
// [velikost] jako výchozí odhad, nebo se vynechá). meritkoTecky > 1 = tečka větší než obvod (větší znak), číslo nebo { formát: číslo };
// ruční pozice formátu má přednost před ukotvením (např. OG, kde text drží střed).
function znak(c, f, klic) {
  const z = c.znak;
  const rucne = z?.pozice?.[klic];
  const p = rucne ?? (z?.teckaNaObvodu ? [] : null);
  if (!p) return '';
  const op = f.stred ? z.opacityOg ?? 0.3 : z.opacity ?? 0.55;
  const data = { text: z.text, cx: p[0], y: p[1], size: p[2], barva: z.barva, krokPomer: z.krok ?? 0.03 };
  if (z.teckaNaObvodu && !rucne) {
    const { P } = projekce(c, f);
    const vol = new Set(c.motiv.vol);
    const body = c.motiv.dots.filter((d) => vol.has(d[2])).map(([lo, la]) => P(lo, la));
    const xs = body.map((b) => b[0]), ys = body.map((b) => b[1]);
    data.kotva = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2,
      sirka: Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * ((typeof z.meritkoTecky === 'object' ? z.meritkoTecky[klic] : z.meritkoTecky) ?? 1) };
  }
  return `<svg id="znak" data-znak='${JSON.stringify(data)}' style="position:absolute;left:0;top:0" width="${f.w}" height="${f.h}" opacity="${op}"></svg>`;
}

// Běží ve stránce po document.fonts.ready – nad každou tečku mapy s data-otaznik vykreslí horní oblouk „?“
// (IBM Plex Serif Bold, bez obrysu) tak, aby vlastní tečka glyfu ležela přesně na tečce mapy a byla oříznutá.
function vykresliOtaznicky() {
  const mapa = document.getElementById('mapa');
  const poradi = (c) => +c.dataset.poradi;
  const tecky = mapa ? [...mapa.querySelectorAll('circle[data-otaznik]')].sort((a, b) => poradi(a) - poradi(b)) : [];
  if (!tecky.length) return;
  const REF = 400, W = 400, H = 500;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.font = `700 ${REF}px 'IBM Plex Serif'`;
  ctx.textAlign = 'center';
  ctx.fillText('?', W / 2, H * 0.85);
  const px = ctx.getImageData(0, 0, W, H).data;
  const ink = (x, y) => px[(y * W + x) * 4 + 3] > 127;
  // tečka glyfu = nejspodnější souvislý pás řádků s inkoustem
  let y1 = -1, y0 = -1, x0 = W, x1 = -1;
  for (let y = H - 1; y >= 0; y--) {
    let radek = false;
    for (let x = 0; x < W; x++) if (ink(x, y)) { radek = true; if (y1 >= 0 || true) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); } }
    if (radek && y1 < 0) y1 = y;
    if (!radek && y1 >= 0) { y0 = y + 1; break; }
  }
  const dotW = x1 - x0, dotCx = (x0 + x1) / 2 - W / 2, dotCy = (y0 + y1) / 2 - H * 0.85, dotTop = y0 - H * 0.85;
  // překážky: texty, logo, legenda a obálka velkého znaku (s rezervou)
  const prekazky = [...document.querySelectorAll('.kick, h1, .sub span, .logo, .leg, .nad')].map((e) => e.getBoundingClientRect());
  const velky = document.getElementById('znak');
  if (velky && velky.childElementCount) { const b = velky.getBBox(); prekazky.push({ left: b.x, top: b.y, right: b.x + b.width, bottom: b.y + b.height }); }
  const vybrane = [];
  const pocet = +(tecky[0].dataset.pocet);
  const ns = 'http://www.w3.org/2000/svg';
  for (const c of tecky) {
    if (vybrane.length >= pocet) break;
    const cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy'), r = +c.getAttribute('r');
    const k = (2 * r * 1.15) / dotW;
    const vyska = REF * 0.75 * k, sirka = REF * 0.5 * k; // přibližná obálka celého „?“ (výška versálky, šířka glyfu)
    const box = { left: cx - sirka / 2 - 12, right: cx + sirka / 2 + 12, top: cy - vyska - 12, bottom: cy + r + 12 };
    const w = +mapa.getAttribute('width'), h = +mapa.getAttribute('height');
    if (box.left < 0 || box.right > w || box.top < 0 || box.bottom > h) continue;
    if (prekazky.some((p) => !(box.right < p.left || box.left > p.right || box.bottom < p.top || box.top > p.bottom))) continue;
    if (vybrane.some((v) => Math.hypot(v[0] - cx, v[1] - cy) < vyska * 2.2)) continue;
    vybrane.push([cx, cy, c]);
  }
  vybrane.forEach(([cx, cy, c], i) => {
    const r = +c.getAttribute('r');
    c.setAttribute('fill', c.dataset.otaznik);
    const k = (2 * r * 1.15) / dotW;                // tečka glyfu ≈ tečka mapy
    const bx = cx - dotCx * k, by = cy - dotCy * k;  // účaří tak, aby tečka glyfu seděla na tečce mapy
    const clip = document.createElementNS(ns, 'clipPath');
    clip.setAttribute('id', `oz${i}`);
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', 0); rect.setAttribute('y', 0);
    rect.setAttribute('width', mapa.getAttribute('width'));
    rect.setAttribute('height', (by + dotTop * k - r * 0.15).toFixed(1)); // vše nad tečkou glyfu
    clip.appendChild(rect);
    mapa.appendChild(clip);
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', bx.toFixed(1)); t.setAttribute('y', by.toFixed(1));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-family', 'IBM Plex Serif, Georgia, serif');
    t.setAttribute('font-weight', '700');
    t.setAttribute('font-size', (REF * k).toFixed(1));
    t.setAttribute('fill', c.dataset.otaznik);
    t.setAttribute('opacity', c.getAttribute('opacity'));
    t.setAttribute('clip-path', `url(#oz${i})`);
    t.textContent = '?';
    mapa.appendChild(t);
  });
  return vybrane.map(([, , c]) => c.dataset.ll);
}

// Běží ve stránce po document.fonts.ready – doplní kolečka do <svg id="znak">.
function vykresliZnak() {
  const svg = document.getElementById('znak');
  if (!svg) return;
  const d = JSON.parse(svg.dataset.znak);
  const w = +svg.getAttribute('width'), h = +svg.getAttribute('height');
  const maska = (size, cx, y) => {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.font = `700 ${size}px 'IBM Plex Serif'`;
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.05;
    ctx.fillText(d.text, cx, y);
    ctx.strokeText(d.text, cx, y);
    const px = ctx.getImageData(0, 0, w, h).data;
    return (x, yy) => x >= 0 && yy >= 0 && x < w && yy < h && px[(Math.round(yy) * w + Math.round(x)) * 4 + 3] > 127;
  };
  // Tečka glyfu = nejspodnější souvislý pás řádků s inkoustem (u „?“ a „!“ oddělený mezerou).
  const tecka = (uvnitr) => {
    let y1 = -1, y0 = -1, x0 = w, x1 = -1;
    for (let y = h - 1; y >= 0; y--) {
      let radek = false;
      for (let x = 0; x < w; x += 2) if (uvnitr(x, y)) { radek = true; x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
      if (radek && y1 < 0) y1 = y;
      if (!radek && y1 >= 0) { y0 = y + 1; break; }
    }
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, sirka: Math.max(x1 - x0, y1 - y0), y0, y1, x0, x1 };
  };
  let { size, cx, y } = d;
  if (d.kotva) {
    // velikost tak, aby tečka měla šířku obvodu; pak posun, aby na něj dosedla
    const ref = 600;
    const t0 = tecka(maska(ref, w / 2, h * 0.8));
    size = ref * d.kotva.sirka / t0.sirka;
    const t1 = tecka(maska(size, w / 2, h * 0.8));
    cx = w / 2 + (d.kotva.x - t1.x);
    y = h * 0.8 + (d.kotva.y - t1.y);
  }
  const uvnitr = maska(size, cx, y);
  const t = d.kotva ? tecka(uvnitr) : null;
  const krok = Math.max(12, size * d.krokPomer), r = krok * 0.36;
  let out = '';
  for (let yy = krok / 2; yy < h; yy += krok) {
    for (let x = krok / 2; x < w; x += krok) {
      // kolečko i tam, kde do glyfu padne aspoň část buňky – oblouky se prokreslí, nezůstanou osamělé tečky
      const q = krok * 0.3;
      const zasah = [[0, 0], [q, 0], [-q, 0], [0, q], [0, -q]].filter(([a, b]) => uvnitr(x + a, yy + b)).length;
      if (zasah < 2) continue;
      if (t && yy >= t.y0 - krok * 0.5) continue; // tečku tvoří obvod
      out += `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="${r.toFixed(1)}" fill="${d.barva}"/>`;
    }
  }
  svg.innerHTML = out;
}

function html(c, klic) {
  // c.ikonaPozice = { homepage: [pravý okraj, horní hrana, šířka] } – když dlouhý titulek koliduje s ikonou
  // c.mapaPozice = { homepage: [x0, y0, x1, y1] } – posun mapy, když bod koliduje s logem nebo legendou
  // c.format = { story: { t: 90 } } – úprava velikostí jednoho formátu (např. menší titulek, aby zalomení řádků
  // vyšlo ve všech formátech stejně)
  const f = { ...FORMATY[klic], ...(c.ikonaPozice?.[klic] ? { ikona: c.ikonaPozice[klic] } : {}), ...(c.mapaPozice?.[klic] ? { mapa: c.mapaPozice[klic] } : {}), ...(c.format?.[klic] ?? {}) };
  const { w, h } = f;
  const [bx0, by0, bx1, by1] = f.box;
  const motiv = c.motiv.typ === 'tecky' ? tecky(c, f) : c.motiv.typ === 'svg' ? svgVrstva(c, f, klic) : obrazek(c, f, klic);
  const scrim = !f.stred && c.motiv.scrim ? `<div style="position:absolute;inset:0;background:linear-gradient(90deg,${NAVY} 0%,${NAVY}e6 ${c.motiv.scrim[0]}%,${NAVY}00 ${c.motiv.scrim[1]}%)"></div>` : '';
  const ogScrim = f.stred ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 34% 60% at 50% 50%,${NAVY}cc,${NAVY}00)"></div>` : '';
  const stitek = c.stitek ? `<span class="stitek">${c.stitek}</span>` : '';
  // Štítek coveru (redakční standard): verzálky Plex Sans, první část karmínově s podtržením končícím
  // v půlce posledního písmene, pak „•“ a zbytek bíle. c.kicker = { cervene, dal } (nebo prostý text).
  const k = typeof c.kicker === 'string' ? { dal: c.kicker } : c.kicker;
  const kicker = `<div class="kick">${k.cervene ? `<span class="cerv">${k.cervene}</span>` : ''}${k.cervene && k.dal ? `<span class="sep">${k.oddelovac ?? '•'}</span>` : ''}${k.dal ? `<span>${k.dal}</span>` : ''}${stitek}</div>`;
  const nad = c.nad ? `<div class="nad">${c.nad}</div>` : '';
  const pod = c.pod ? `<div class="sub"><span class="halo" style="display:inline-block;position:relative">${c.pod}</span></div>` : '';
  const logo = `<div class="logo">${DONUT}<span>DataTimes.cz</span></div>`;
  // SVG ikona se vkládá přímo (písmo v ní pak bere IBM Plex ze stránky), rastr jako <img>
  const ikonaEl = (style) => c.ikona.endsWith('.svg')
    ? `<div style="${style};line-height:0">${fs.readFileSync(c.ikona, 'utf8').replace('<svg ', '<svg style="width:100%;height:auto" ')}</div>`
    : `<img src="${dataUri(c.ikona)}" style="${style}">`;
  // Zarovnání podle čtverce piktogramu: c.ikonaCtverec = [x0, y0, x1] v pixelech zdroje (výchozí pro SVG ikony sérií).
  let ikona = '', ikonaOg = '';
  if (c.ikona) {
    const zdroj = fs.readFileSync(c.ikona);
    const srcW = c.ikona.endsWith('.svg') ? +zdroj.toString().match(/width="(\d+)"/)[1] : zdroj.readUInt32BE(16);
    const [qx0, qy0, qx1] = c.ikonaCtverec ?? [60, 30, 310];
    const umisti = (prava, horni, strana) => {
      const s = strana / (qx1 - qx0);
      return `position:absolute;left:${(prava - qx1 * s).toFixed(1)}px;top:${(horni - qy0 * s).toFixed(1)}px;width:${(srcW * s).toFixed(1)}px`;
    };
    if (f.ikona) ikona = ikonaEl(umisti(...f.ikona));
    if (f.stred) {
      // OG: čtverec ikony na středu nad štítkem
      const strana = f.t * 0.95, s = strana / (qx1 - qx0);
      ikonaOg = `<div style="position:relative;width:${strana}px;height:${strana * 1.3}px;flex:none">${ikonaEl(umisti(strana, 0, strana))}</div>`;
    }
  }
  // Logo jde do toho dolního rohu, kde je motiv klidnější (c.logo = 'vlevo' | 'vpravo', výchozí vpravo);
  // legenda si vezme opačný roh. U mapy ČR je volněji vlevo dole pod Šumavou.
  // c.logo = 'nahore': logo vpravo na řádku štítku (animace a karty pro sítě – dole ho překrývá ovládání
  // Instagramu a Reels); legenda pak zůstává v levém dolním rohu
  const logoNahore = c.logo === 'nahore';
  const logoVlevo = c.logo === 'vlevo';
  const okraj = Math.max(Math.round(w * 0.032), w - bx1);
  // c.logoPodLegendou: logo vlevo dole a legenda nad ním o dva řádky výš (motiv vpravo dole, např. jih Brazílie)
  const logoPod = c.logoPodLegendou && !logoVlevo;
  const rohLogo = logoVlevo || logoPod ? `left:${bx0}px` : `right:${okraj}px`;
  const rohLeg = logoVlevo ? `right:${okraj}px;text-align:right` : `left:${bx0}px`;
  const legDole = logoPod ? h - by1 + 2 * (f.leg ?? 26) * 1.6 : h - by1;
  // c.legendaPodTextem: legenda v toku textu pod podtitulkem (karty, kde dolní roh zabírá motiv)
  const legTok = c.legenda && c.legendaPodTextem && !f.stred ? `<div class="leg" style="position:static;margin-top:${f.t * 0.25}px">${c.legenda.map(([b, t]) => `<div><i style="background:${b};box-shadow:0 0 0 2px #f8f6f0"></i>${t}</div>`).join('')}</div>` : '';
  const leg = c.legenda && !c.legendaPodTextem && !f.stred ? `<div class="leg halo" style="${rohLeg};bottom:${legDole}px">${c.legenda.map(([b, t]) => logoVlevo ? `<div>${t}<i style="background:${b};margin:0 0 0 .4em"></i></div>` : `<div><i style="background:${b}"></i>${t}</div>`).join('')}</div>` : '';
  const text = f.stred
    ? `<div style="position:absolute;left:${bx0}px;top:${by0}px;width:${bx1 - bx0}px;height:${by1 - by0}px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:${f.t * 0.22}px">
         ${ikonaOg}${kicker}${nad}<h1>${c.titulek}</h1>${pod}<div style="margin-top:${f.t * 0.2}px">${logo}</div></div>`
    : `<div style="position:absolute;left:${bx0}px;top:${by0}px;width:${bx1 - bx0}px">
         ${kicker}
         ${nad ? `<div style="margin-top:${f.t * 0.45}px">${nad}</div>` : ''}
         <h1 style="margin-top:${f.t * (nad ? 0.15 : 0.3)}px">${c.titulek}</h1>
         ${pod ? `<div style="margin-top:${f.t * 0.3}px">${pod}</div>` : ''}
         ${legTok}
       </div>
       ${leg}
       <div class="halo${logoNahore ? ' logo-nahore' : ''}" style="position:absolute;${logoNahore ? `right:${w - bx1}px;top:${(by0 - (f.logo * 1.5 - f.kick * 1.3) / 2).toFixed(1)}px` : `${rohLogo};bottom:${h - by1}px`}">${logo}</div>`;
  const b = c.barvy;
  return `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@700&family=IBM+Plex+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;color:#fff}
  body{position:relative;background:radial-gradient(ellipse at ${b.glowPosA ?? '0% 20%'},${b.glowA} 0%,${b.glowA}00 ${b.glowDosah ?? 55}%),radial-gradient(ellipse at ${b.glowPosB ?? '100% 100%'},${b.glowB} 0%,${b.glowB}00 ${b.glowDosah ?? 55}%),${NAVY}}
  .kick{font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:600;font-size:${f.kick}px;letter-spacing:.12em;text-transform:uppercase;color:#f8f6f0;display:flex;align-items:center;gap:${f.kick * 0.5}px;white-space:nowrap;width:max-content;max-width:none;justify-content:${f.stred ? 'center' : 'flex-start'};${f.stred ? 'margin:0 auto;' : ''}padding-bottom:.5em}
  .kick .cerv{color:#de1743;position:relative}
  .kick .cerv::after{content:'';position:absolute;left:0;bottom:-.42em;height:max(3px,.11em);width:calc(100% - .5em);background:#de1743}
  .kick .sep{color:#de1743}
  .kick.dva{flex-wrap:wrap;row-gap:.75em;width:auto}
  .kick.dva .sep{display:none}
  .kick.dva .zlom{flex-basis:100%;height:0}
  .stitek{font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:700;letter-spacing:.08em;font-size:${f.kick}px;padding:${f.kick * 0.25}px ${f.kick * 0.6}px;border-radius:${f.kick}px;background:${b.stitek};color:#fff}
  .nad{font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:600;font-size:${f.sub}px;line-height:1.3;color:#fff}
  h1{margin:0;font-family:'IBM Plex Serif',Georgia,serif;font-weight:700;font-size:${f.t}px;line-height:1.06;text-shadow:0 2px 10px rgba(0,0,0,.35)}
  .sub{font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:500;font-size:${f.sub}px;line-height:1.3;color:${b.sub}}
  .leg{position:absolute;text-shadow:0 0 8px ${NAVY},0 0 3px ${NAVY},0 1px 2px ${NAVY};font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:500;font-size:${f.leg ?? 26}px;line-height:1.6}
  /* Mapa smí běžet pod textem; drobné texty dostanou rozmazaný podklad v barvě pozadí, ať vždy vyhrají. */
  .halo{isolation:isolate}
  .halo::before{content:'';position:absolute;inset:-.45em -.7em;background:${NAVY};opacity:.9;filter:blur(16px);border-radius:1em;z-index:-1}
  .leg i{display:inline-block;width:${(f.leg ?? 26) * 0.6}px;height:${(f.leg ?? 26) * 0.6}px;border-radius:50%;margin-right:${(f.leg ?? 26) * 0.4}px}
  .logo{display:flex;align-items:center;gap:${f.logo * 0.3}px;font-family:'IBM Plex Serif',Georgia,serif;font-weight:700;font-size:${f.logo}px;text-shadow:0 1px 6px rgba(0,0,0,.4)}
  .logo svg{width:${f.logo * 1.5}px;height:${f.logo * 1.5}px}
</style></head><body>
${motiv}${c.znak ? znak(c, f, klic) : ''}${scrim}${ogScrim}${ikona}
${text}
</body></html>`;
}

// Štítek coveru se zmenší, dokud se nevejde: homepage končí před zónou štítku rubriky (x 950),
// ostatní formáty v šířce bezpečné zóny. Zmenšuje se nejvýš na 70 %; když se ani tak nevejde, zlomí se
// za karmínovou částí na dva řádky (bez „•“) v plné velikosti.
async function upravStitek(page, klic, f) {
  const maxW = klic === 'homepage' ? 950 - f.box[0] : f.box[2] - f.box[0];
  await page.evaluate((maxW) => {
    // logo na řádku štítku: štítek musí skončit aspoň 1,5 em před ním
    const lg = document.querySelector('.logo-nahore');
    if (lg) maxW -= lg.getBoundingClientRect().width + 36;
    const el = document.querySelector('.kick');
    const s0 = parseFloat(getComputedStyle(el).fontSize);
    let s = s0;
    while (el.scrollWidth > maxW && s > s0 * 0.7) { s -= 1; el.style.fontSize = `${s}px`; }
    if (el.scrollWidth > maxW) {
      el.style.fontSize = `${s0}px`;
      el.classList.add('dva');
      const zlom = document.createElement('span');
      zlom.className = 'zlom';
      el.querySelector('.sep')?.after(zlom);
    }
  }, maxW);
}

// Sdílené s tools/animation-generator.cjs (stejné pozadí, písma, štítek a logo i v animacích).
module.exports = { FORMATY, html, upravStitek, vykresliZnak };

if (require.main === module) (async () => {
  const cfgPath = path.resolve(process.argv[2]);
  const c = require(cfgPath);
  const jen = process.argv.slice(3);
  const browser = await chromium.launch({ channel: 'msedge' });
  for (const klic of Object.keys(FORMATY).filter((k) => !jen.length || jen.includes(k))) {
    const f = FORMATY[klic];
    const page = await browser.newPage({ viewport: { width: f.w, height: f.h } });
    await page.setContent(html(c, klic), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(vykresliZnak);
    const otaznicky = await page.evaluate(vykresliOtaznicky);
    if (otaznicky?.length) console.log(`  otazníčky (${klic}):`, otaznicky.join(' | '));
    await upravStitek(page, klic, f);
    const out = path.join(c.vystup, f.soubor);
    await page.screenshot(f.soubor.endsWith('.jpg') ? { path: out, type: 'jpeg', quality: 88 } : { path: out });
    await page.close();
    console.log(path.relative(REPO, out), `${f.w}×${f.h}`, `${Math.round(fs.statSync(out).size / 1024)} kB`);
  }
  await browser.close();
})();
