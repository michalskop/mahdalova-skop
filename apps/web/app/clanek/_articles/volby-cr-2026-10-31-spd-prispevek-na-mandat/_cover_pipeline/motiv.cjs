// Cover motif: 490 dots = SPD councillors in municipalities and city districts after the 2022 election;
// 166 paper-white = kept in 2026, 2 crimson = the two Prague city councillors (the only lost seats the state paid for,
// 250 000 CZK a year each), 322 brandNavy.7 outlines = other lost seats (no state contribution).
// Numbers from the article text (volby.gov.cz registers, state 11 Oct 2026; DataTimes 14 Oct 2026).
// node motiv.cjs → motiv-<format>.svg (not in git); then node tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');

const PAPER = '#f8f6f0';
const RED = '#de1743';
const DIM = '#4c4f8e'; // brandNavy.7
const PRED = 490, ZUSTALO = 166, PRAHA = 2;

// [W, H, left x, top y, columns, step]
const POLOHA = {
  homepage: [1500, 1200, 890, 330, 20, 28],
  og: [1200, 630, 660, 62, 20, 21],
  square: [1080, 1080, 575, 610, 25, 17.4],
  instagram: [1080, 1350, 530, 770, 25, 19],
  story: [1080, 1920, 300, 960, 20, 24],
};

for (const [k, [W, H, x0, y0, cols, s]] of Object.entries(POLOHA)) {
  let g = '';
  for (let i = 0; i < PRED; i++) {
    const x = x0 + (i % cols) * s + s / 2, y = y0 + Math.floor(i / cols) * s + s / 2;
    if (i < ZUSTALO) g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(s * 0.36).toFixed(1)}" fill="${PAPER}"/>`;
    else if (i < ZUSTALO + PRAHA) g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(s * 0.46).toFixed(1)}" fill="${RED}"/>`;
    else g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(s * 0.3).toFixed(1)}" fill="none" stroke="${DIM}" stroke-width="${(s * 0.1).toFixed(1)}"/>`;
  }
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`);
  console.log(`motiv-${k}.svg`);
}
