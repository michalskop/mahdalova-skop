// Motiv coveru: dlaždicová mapa USA, dlaždice = stát, barva = výsledek voleb do Senátu 3. 11. 2026 podle výroků AP
// (stav 4. 11. 2026 dopoledne SEČ). Tmavě modrá = demokraté získali křeslo od republikánů, světle modrá = udrželi,
// vínová = republikáni udrželi, béžová = nerozhodnuto, tmavá dlaždice = letos se nevolilo.
// Spuštění: node motiv.cjs → motiv-<format>.svg; pak node tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');
const POZ = require('./mapa-pozice.json');
const LAYOUT = {
  AK:[0,0], ME:[10,0], VT:[9,1], NH:[10,1],
  WA:[0,2], ID:[1,2], MT:[2,2], ND:[3,2], MN:[4,2], IL:[5,2], WI:[6,2], MI:[7,2], NY:[8,2], RI:[9,2], MA:[10,2],
  OR:[0,3], NV:[1,3], WY:[2,3], SD:[3,3], IA:[4,3], IN:[5,3], OH:[6,3], PA:[7,3], NJ:[8,3], CT:[9,3],
  CA:[0,4], UT:[1,4], CO:[2,4], NE:[3,4], MO:[4,4], KY:[5,4], WV:[6,4], VA:[7,4], MD:[8,4], DE:[9,4],
  AZ:[1,5], NM:[2,5], KS:[3,5], AR:[4,5], TN:[5,5], NC:[6,5], SC:[7,5],
  OK:[3,6], LA:[4,6], MS:[5,6], AL:[6,6], GA:[7,6],
  HI:[0,7], TX:[3,7], FL:[8,7],
};
const ZISK = ['NC', 'SC', 'TX', 'OH', 'KS', 'IA', 'ME'];
const D = ['CO', 'DE', 'GA', 'IL', 'MA', 'MI', 'MN', 'NH', 'NJ', 'NM', 'OR', 'RI', 'VA'];
const R = ['AL', 'AR', 'ID', 'KY', 'LA', 'MT', 'NE', 'OK', 'SD', 'TN', 'WV', 'WY', 'FL'];
const OTEV = ['MS', 'AK'];
// brandRoyalBlue.6 / .2, brandDeepRed.6, background.2
const barva = (st) => ZISK.includes(st) ? ['#4a51ab', '#f8f6f0'] : D.includes(st) ? ['#a9b5f0', '#101432'] : R.includes(st) ? ['#a03250', '#f8f6f0'] : OTEV.includes(st) ? ['#ece6d3', '#101432'] : null;
if (ZISK.length + D.length + R.length + OTEV.length !== 35) throw new Error('35 senátních voleb');
for (const [k, [x0, y0, x1, y1]] of Object.entries(POZ)) {
  const W = { homepage: [1500, 1200], og: [1200, 630], square: [1080, 1080], instagram: [1080, 1350], story: [1080, 1920] }[k];
  const s = Math.min((x1 - x0) / 11, (y1 - y0) / 8);
  const t = s * 0.92;
  const ox = x0 + ((x1 - x0) - 11 * s) / 2, oy = y0 + ((y1 - y0) - 8 * s) / 2;
  let g = '';
  for (const [st, [cx, cy]] of Object.entries(LAYOUT)) {
    const x = ox + cx * s, y = oy + cy * s, b = barva(st);
    const fill = b ? b[0] : 'rgba(248,246,240,0.10)', txt = b ? b[1] : 'rgba(248,246,240,0.35)';
    g += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${t.toFixed(1)}" height="${t.toFixed(1)}" rx="${(t * 0.1).toFixed(1)}" fill="${fill}"/>`;
    g += `<text x="${(x + t / 2).toFixed(1)}" y="${(y + t / 2 + t * 0.13).toFixed(1)}" text-anchor="middle" font-family="IBM Plex Sans" font-weight="700" font-size="${(t * 0.36).toFixed(1)}" fill="${txt}">${st}</text>`;
  }
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W[0]}" height="${W[1]}" viewBox="0 0 ${W[0]} ${W[1]}">${g}</svg>`);
}
console.log('motivy hotové');
