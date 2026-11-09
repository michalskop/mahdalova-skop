// Cover motif: 100 dots = respondents of the Bectu 2024 survey (225 people from UK creative industries);
// 60 crimson = "more than 60 % did not report an incident for fear for their career" (Bectu, 30 May 2024),
// 40 in brandNavy.7. Values from _data_pipeline/bectu.py. Each dot is a small figure (head + shoulders),
// the crimson figures have a "zipped" mouth line = silence.
// node motiv.cjs → motiv-<format>.svg (not in git, see article .gitignore); then node tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');

const RED = '#de1743'; // brand vivid red
const GREY = '#4c4f8e'; // brandNavy.7
const NENAHLASILI = 60; // of 100

// [format width, height, grid left x, top y, step]
const POLOHA = {
  homepage: [1500, 1200, 880, 330, 58],
  og: [1200, 630, 640, 70, 50],
  square: [1080, 1080, 600, 580, 41],
  instagram: [1080, 1350, 560, 720, 45],
  story: [1080, 1920, 270, 1000, 54],
};

function figurka(x, y, s, barva) {
  // head + shoulders, s = step of the grid
  const r = s * 0.17;
  const hy = y - s * 0.13;
  const body = `M ${(x - s * 0.3).toFixed(1)} ${(y + s * 0.36).toFixed(1)} Q ${(x - s * 0.3).toFixed(1)} ${(y + s * 0.08).toFixed(1)} ${x.toFixed(1)} ${(y + s * 0.08).toFixed(1)} Q ${(x + s * 0.3).toFixed(1)} ${(y + s * 0.08).toFixed(1)} ${(x + s * 0.3).toFixed(1)} ${(y + s * 0.36).toFixed(1)} Z`;
  return `<circle cx="${x.toFixed(1)}" cy="${hy.toFixed(1)}" r="${r.toFixed(1)}" fill="${barva}"/><path d="${body}" fill="${barva}"/>`;
}

for (const [k, [W, H, x0, y0, s]] of Object.entries(POLOHA)) {
  let g = '';
  for (let i = 0; i < 100; i++) {
    const row = Math.floor(i / 10), col = i % 10;
    g += figurka(x0 + col * s + s / 2, y0 + row * s + s / 2, s, i < NENAHLASILI ? RED : GREY);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`;
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`), svg);
  console.log(`motiv-${k}.svg`);
}
