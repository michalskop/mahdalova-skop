// Motiv coveru: Západní břeh, osady a outposty (sourozenec bublinové mapy obcí z rozboru izraelských voleb).
// Obrys OCHA COD-AB, body ze seznamu Peace Now (priprav_mapu.py → mapa.json).
// Osady = kolečka s plochou podle počtu obyvatel (brandNavy.3), outposty od roku 2023 karmínově (brand.4),
// starší outposty tlumeně (brandNavy.5). Lokátor: tečková zeměkoule (globus.py → globus.json), Izrael a Palestina
// karmínově v kroužku, oblá šipka od Západního břehu k místu na zeměkouli.
// node motiv.cjs → motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg')
const fs = require('fs');
const path = require('path');

const { obrys, osady, outposty } = JSON.parse(fs.readFileSync(path.join(__dirname, 'mapa.json'), 'utf8'));
const globus = JSON.parse(fs.readFileSync(path.join(__dirname, 'globus.json'), 'utf8'));
const OSADA = '#bcc4df', NOVY = '#ff1a4a', STARY = '#7889be', OBRYS = '#d2d8e9', PLOCHA = '#2f325c';

// [šířka, výška, box mapy [x0, y0, x1, y1], poloměr největší osady, poloměr outpostu]
const FORMATY = {
  homepage: [1500, 1200, [780, 110, 1470, 1170], 34, 6.5],
  og: [1200, 630, [760, 20, 1180, 610], 18, 3.6],
  square: [1080, 1080, [600, 60, 1060, 1050], 30, 5.6],
  instagram: [1080, 1350, [590, 110, 1060, 1260], 32, 5.8],
  story: [1080, 1920, [130, 20, 1080, 1900], 50, 8.5], // mapa přes celou výšku, text ji smí překrýt
};

// zeměkoule: [střed x, střed y, poloměr, ohyb šipky (+ doleva / − doprava vzhledem ke směru od mapy)]
const GLOBUS = {
  homepage: [610, 955, 88, 0.35],
  og: [155, 470, 95, -0.45],
  square: [455, 905, 80, 0.35],
  instagram: [460, 1150, 88, 0.35],
  story: [905, 1560, 115, -0.4],
};
const L0 = (28 * Math.PI) / 180, F0 = (27 * Math.PI) / 180; // střed pohledu na zeměkouli (28° v. d., 27° s. š.)
const IZRAEL = [35.0, 31.6];
function orto(lon, lat) {
  const l = (lon * Math.PI) / 180 - L0, p = (lat * Math.PI) / 180;
  const cosc = Math.sin(F0) * Math.sin(p) + Math.cos(F0) * Math.cos(p) * Math.cos(l);
  return [Math.cos(p) * Math.sin(l), Math.cos(F0) * Math.sin(p) - Math.sin(F0) * Math.cos(p) * Math.cos(l), cosc];
}

const xs = obrys.map((p) => p[0]), ys = obrys.map((p) => p[1]);
const [X0, X1, Y0, Y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
const kx = Math.cos((31.9 * Math.PI) / 180);
const maxPop = Math.max(...osady.map((o) => o[2]));

for (const [klic, [W, H, [bx0, by0, bx1, by1], rMax, rOut]] of Object.entries(FORMATY)) {
  const sc = Math.min((bx1 - bx0) / ((X1 - X0) * kx), (by1 - by0) / (Y1 - Y0));
  const ox = bx0 + (bx1 - bx0 - (X1 - X0) * kx * sc) / 2, oy = by0 + (by1 - by0 - (Y1 - Y0) * sc) / 2;
  const P = (lo, la) => [ox + (lo - X0) * kx * sc, oy + (Y1 - la) * sc];
  const f = (v) => v.toFixed(1);
  const d = obrys.map(([lo, la], i) => { const [x, y] = P(lo, la); return `${i ? 'L' : 'M'}${f(x)},${f(y)}`; }).join('') + 'Z';
  const sOsady = [...osady].sort((a, b) => b[2] - a[2]).map(([lo, la, v]) => {
    const [x, y] = P(lo, la);
    const r = Math.max(rOut * 0.8, Math.sqrt(v / maxPop) * rMax);
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${r.toFixed(2)}" fill="${OSADA}" opacity="0.55"/>`;
  }).join('');
  // starší pod nové, aby nové outposty byly vidět všechny
  const sOut = [...outposty].sort((a, b) => a[2] - b[2]).map(([lo, la, rok]) => {
    const [x, y] = P(lo, la);
    const novy = rok >= 2023;
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${(novy ? rOut : rOut * 0.8).toFixed(2)}" fill="${novy ? NOVY : STARY}" opacity="${novy ? 0.95 : 0.8}"/>`;
  }).join('');
  // zeměkoule s tečkami pevniny, Izrael a Palestina karmínově
  const [gx, gy, R, ohyb] = GLOBUS[klic];
  const rt = Math.max(1.2, R * 0.03);
  const blizko = (lo, la) => lo > 34 && lo < 36 && la > 29.4 && la < 33.4;
  const sGlob = globus.map(([lo, la]) => {
    const [u, v, c] = orto(lo, la);
    if (c <= 0) return '';
    const hl = blizko(lo, la);
    return `<circle cx="${f(gx + u * R)}" cy="${f(gy - v * R)}" r="${(hl ? rt * 1.3 : rt).toFixed(2)}" fill="${hl ? NOVY : '#8f9dc9'}" opacity="${hl ? 1 : 0.75}"/>`;
  }).join('');
  const [iu, iv] = orto(...IZRAEL);
  const ix = gx + iu * R, iy = gy - iv * R, rk = R * 0.13;
  // šipka: z nejbližšího bodu obrysu Západního břehu obloukem ke kroužku kolem Izraele na zeměkouli
  const [sx, sy] = obrys.map(([lo, la]) => P(lo, la)).reduce((a, b) => (Math.hypot(b[0] - ix, b[1] - iy) < Math.hypot(a[0] - ix, a[1] - iy) ? b : a));
  const dx = ix - sx, dy = iy - sy, L = Math.hypot(dx, dy);
  const cx = (sx + ix) / 2 - dy * ohyb, cy = (sy + iy) / 2 + dx * ohyb;
  // konec šipky na okraji kroužku, ve směru tečny oblouku
  const tx = ix - cx, ty = iy - cy, tl = Math.hypot(tx, ty);
  const ex = ix - (tx / tl) * (rk + 4), ey = iy - (ty / tl) * (rk + 4);
  const zac = 10 + rOut;
  const bx = sx + ((cx - sx) / Math.hypot(cx - sx, cy - sy)) * zac, by = sy + ((cy - sy) / Math.hypot(cx - sx, cy - sy)) * zac;
  const sw = Math.max(2, R * 0.035), hr = sw * 4.2, ang = Math.atan2(ey - cy, ex - cx);
  const hrot = [[ex, ey], [ex - Math.cos(ang - 0.42) * hr, ey - Math.sin(ang - 0.42) * hr], [ex - Math.cos(ang + 0.42) * hr, ey - Math.sin(ang + 0.42) * hr]]
    .map(([a, b]) => `${f(a)},${f(b)}`).join(' ');
  const SIPKA = '#f8f6f0';
  const sLok = `<circle cx="${f(gx)}" cy="${f(gy)}" r="${f(R)}" fill="#101432" fill-opacity="0.85" stroke="${OBRYS}" stroke-opacity="0.6" stroke-width="${f(sw * 0.6)}"/>${sGlob}` +
    `<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(rk)}" fill="none" stroke="${NOVY}" stroke-width="${f(sw)}"/>` +
    `<path d="M${f(bx)},${f(by)} Q${f(cx)},${f(cy)} ${f(ex - Math.cos(ang) * hr * 0.6)},${f(ey - Math.sin(ang) * hr * 0.6)}" fill="none" stroke="${SIPKA}" stroke-width="${f(sw)}" stroke-linecap="round" opacity="0.9"/>` +
    `<polygon points="${hrot}" fill="${SIPKA}" opacity="0.9"/>`;
  void L;
  fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<path d="${d}" fill="${PLOCHA}" fill-opacity="0.55" stroke="${OBRYS}" stroke-opacity="0.55" stroke-width="${(rOut * 0.35).toFixed(1)}"/>${sOsady}${sOut}${sLok}</svg>`);
}
console.log('motiv hotový:', osady.length, 'osad,', outposty.length, 'outpostů,', outposty.filter((o) => o[2] >= 2023).length, 'od roku 2023');
