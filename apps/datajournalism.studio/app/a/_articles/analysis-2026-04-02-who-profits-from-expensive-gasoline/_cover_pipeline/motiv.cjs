// English cover (datatimes.org) for "Capping gas station margins…" – převod českého coveru z Canvy
// („Babiš neumí počítat: regulace benzínek lidem neuleví“). Podkladová fotka bez textu od Kateřiny (31. 10. 2026):
// foto.jpg = Andrej Babiš na tiskové konferenci vlády (630 × 421 px). Fotka je malá, proto zabírá jen pravou část
// coveru, zleva přechází do tmavého pozadí a je tónovaná do červené jako původní cover (brand.6 #de1743).
// funkce svg(klic) vrací vrstvu motivu pro cover.config.cjs (motiv.typ 'svg').
const fs = require('fs');
const path = require('path');

const FOTO = `data:image/jpeg;base64,${fs.readFileSync(path.join(__dirname, 'foto.jpg')).toString('base64')}`;
const FW = 630, FH = 421;

// foto = [x, y, výška]; fotka se ořízne na plochu [x, W] × [y, y + výška]
const FORMATY = {
  homepage: { W: 1500, H: 1200, foto: [560, 300, 940] },
  og: { W: 1200, H: 630, foto: [560, 0, 630] },
  square: { W: 1080, H: 1080, foto: [180, 470, 610] },
  instagram: { W: 1080, H: 1350, foto: [140, 560, 690] },
  story: { W: 1080, H: 1920, foto: [0, 900, 720] },
};

function svg(klic) {
  const F = FORMATY[klic];
  const [x, y, h] = F.foto;
  const w = Math.round(h * FW / FH);
  // fotka vystředěná na pravou stranu plochy; vlevo a dole měkký přechod do pozadí
  const fx = Math.max(x, F.W - w + Math.round((w - (F.W - x)) / 2) - Math.round((w - (F.W - x)) / 2));
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${F.W}" height="${F.H}" viewBox="0 0 ${F.W} ${F.H}">
<defs>
  <filter id="red" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.45 0.45 0.15 0 0.12  0.10 0.10 0.04 0 0.01  0.12 0.12 0.05 0 0.03  0 0 0 1 0"/></filter>
  <linearGradient id="fadeL" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.35" stop-color="#fff" stop-opacity="1"/></linearGradient>
  <linearGradient id="fadeV" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.12" stop-color="#fff" stop-opacity="1"/><stop offset="0.85" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <mask id="m"><rect x="${fx}" y="${y}" width="${w}" height="${h}" fill="url(#fadeL)"/></mask>
  <mask id="m2"><rect x="${fx}" y="${y}" width="${w}" height="${h}" fill="url(#fadeV)"/></mask>
</defs>
<g mask="url(#m2)"><g mask="url(#m)"><image href="${FOTO}" x="${fx}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" filter="url(#red)"/></g></g>
</svg>`;
}

module.exports = { svg };
