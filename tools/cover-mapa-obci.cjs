// Sdílený motiv volebních coverů: mapa obcí ČR jako kolečka přes nenápadný modrý stín republiky
// (vzor: volby-cr-2026-10-19-komu-patri-cesko-po-komunalnich-volbach). Vrací SVG vrstvu pro každý formát,
// do cover.config.cjs jako motiv: { typ: 'svg', svg: mapaObci({...}) }.
//
//   const { obce, mapaObci } = require('<repo>/tools/cover-mapa-obci.cjs');
//   obce()            → [{ kod, n, lon, lat, p }] všech 6 249 obcí (těžiště, počet obyvatel)
//   mapaObci({ body, popisky, mapaPozice, stin })
//     body     [{ lon, lat, k, barva, op?, obrys? }] – k = poloměr v násobcích tečky mapy; kreslí se v pořadí pole
//     popisky  [{ lon, lat, text, strana?: 'vpravo'|'vlevo'|'pod' }] – jména míst (Plex Sans, halo v barvě pozadí)
//     mapaPozice { formát: [x0, y0, x1, y1] } – posun plochy mapy proti výchozím plochám cover-generatoru
//     stin     barva stínu republiky (výchozí brandRoyalBlue.7), false = bez stínu
const fs = require('fs');
const path = require('path');

const ART = path.join(__dirname, '..', 'apps', 'web', 'app', 'clanek', '_articles');
const DOTS = require(path.join(ART, 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'senat-mapa.json')).dots;
const POLOHY = path.join(ART, 'volby-cr-2026-10-19-komu-patri-cesko-po-komunalnich-volbach', '_cover_pipeline', 'body.json');
const NAVY = '#101432'; // brandNavy.9
const KREM = '#f8f6f0';

// stejné plochy mapy jako tools/cover-generator.cjs (FORMATY[].mapa)
const MAPA = {
  homepage: [1500, 1200, [60, 400, 1480, 1150]], og: [1200, 630, [0, 0, 1200, 630]],
  square: [1080, 1080, [20, 470, 1070, 1050]], instagram: [1080, 1350, [20, 560, 1070, 1260]],
  story: [1080, 1920, [0, 860, 1080, 1580]],
};
const LEG = { homepage: 27, og: 22, square: 24, instagram: 24, story: 26 };

const obce = () => JSON.parse(fs.readFileSync(POLOHY, 'utf8'));

function mapaObci({ body = [], popisky = [], mapaPozice = {}, stin = '#383d82' } = {}) {
  const lon = DOTS.map((d) => d[0]), lat = DOTS.map((d) => d[1]);
  const [x0, x1, y0, y1] = [Math.min(...lon), Math.max(...lon), Math.min(...lat), Math.max(...lat)];
  const kx = Math.cos((49.8 * Math.PI) / 180);
  const f1 = (v) => v.toFixed(1);
  const out = {};
  for (const [klic, [W, H, vychozi]] of Object.entries(MAPA)) {
    const [mx0, my0, mx1, my1] = mapaPozice[klic] ?? vychozi;
    const sc = Math.min((mx1 - mx0) / ((x1 - x0) * kx), (my1 - my0) / (y1 - y0));
    const ox = mx0 + (mx1 - mx0 - (x1 - x0) * kx * sc) / 2, oy = my0 + (my1 - my0 - (y1 - y0) * sc) / 2;
    const P = (lo, la) => [ox + (lo - x0) * kx * sc, oy + (y1 - la) * sc];
    const r = Math.max(1.6, sc * 0.018);
    const c = (x, y, rr, fill, op, obrys) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr)}" fill="${fill}"${op != null ? ` opacity="${op}"` : ''}${obrys ? ` stroke="${obrys}" stroke-width="${f1(r * 0.5)}"` : ''}/>`;
    const s = stin ? `<g filter="url(#stin-${klic})" opacity="0.55">${DOTS.map(([lo, la]) => c(...P(lo, la), r * 2.6, stin)).join('')}</g>` : '';
    const b = body.map((o) => c(...P(o.lon, o.lat), r * o.k, o.barva, o.op, o.obrys)).join('');
    const fs_ = LEG[klic] * 1.25;
    const t = popisky.map((p) => {
      const [x, y] = P(p.lon, p.lat);
      const pos = p.strana === 'vlevo' ? [x - fs_ * 0.7, y + fs_ * 0.35, 'end'] : p.strana === 'pod' ? [x, y + fs_ * 1.5, 'middle'] : [x + fs_ * 0.7, y + fs_ * 0.35, 'start'];
      return `<text x="${f1(pos[0])}" y="${f1(pos[1])}" text-anchor="${pos[2]}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="600" font-size="${f1(fs_)}" fill="${KREM}" stroke="${NAVY}" stroke-width="${f1(fs_ * 0.28)}" stroke-linejoin="round" paint-order="stroke">${p.text}</text>`;
    }).join('');
    out[klic] = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
      + `<defs><filter id="stin-${klic}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${f1(r * 2.2)}"/></filter></defs>`
      + `${s}${b}${t}</svg>`;
  }
  return out;
}

module.exports = { obce, mapaObci, MAPA };
