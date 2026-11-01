// Piktogramy a scény pro covery kapitoly 2 (30. 10. 2026): místo holých sloupečků velké ikony, které sdělení ukážou.
// Použití: const { MOTIVY, ZADANI } = require('./piktogramy-02.cjs')(pomocne); MOTIVY se přidají k motivům generátoru, ZADANI = { id: { motiv, arg } }.
// Pravidla: jedna zpráva na cover, zvýrazněná žlutě; ostatní barvou kapitoly; „chybějící“ část = přerušovaný obrys.
module.exports = ({ T, C, svgWrap, fsOf, CH, NAVY, BILA, ZLU, CORAL }) => {
  const halo = (fs_) => `stroke="${NAVY}" stroke-width="${(fs_ * 0.3).toFixed(1)}" paint-order="stroke" stroke-linejoin="round"`;
  const sk = (barva, duch, w = 3) => (duch ? `fill="none" stroke="${BILA}" stroke-opacity=".6" stroke-width="${w}" stroke-dasharray="7 6" vector-effect="non-scaling-stroke"` : `fill="${barva}"`);
  const nav = (duch) => (duch ? 'none' : NAVY);
  const g = (cx, cy, s, inner) => `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${s.toFixed(1)})">${inner}</g>`;
  const bust = (a, duch) => `<circle cx="0" cy="-0.27" r="0.17" ${a}/><path d="M -0.3 0.42 V 0.12 Q -0.3 -0.02 -0.17 -0.02 H 0.17 Q 0.3 -0.02 0.3 0.12 V 0.42 Z" ${a}/>`;

  // ikony v jednotkovém čtverci −0.5…0.5, vykreslují se se středem v (cx, cy) a velikostí s
  const IKONY = {
    lekar: (a, d) => bust(a, d) + (d ? '' : `<path d="M -0.12 0 Q -0.12 0.2 0 0.2 Q 0.12 0.2 0.12 0" fill="none" stroke="${NAVY}" stroke-width="0.035"/><circle cx="0" cy="0.27" r="0.045" fill="${NAVY}"/>`),
    sestra: (a, d) => bust(a, d) + (d ? '' : `<path d="M -0.17 -0.34 H 0.17 L 0.12 -0.5 H -0.12 Z" ${a}/><rect x="-0.1" y="0.17" width="0.2" height="0.06" fill="${NAVY}"/><rect x="-0.03" y="0.1" width="0.06" height="0.2" fill="${NAVY}"/>`),
    clovek: (a, d) => bust(a, d),
    student: (a, d) => bust(a, d) + `<path d="M -0.3 -0.42 L 0 -0.54 L 0.3 -0.42 L 0 -0.3 Z" ${a}/>`,
    senior: (a, d) => bust(a, d) + `<path d="M 0.4 0.42 V 0.16 Q 0.4 0.08 0.47 0.08" fill="none" ${d ? `stroke="${BILA}" stroke-opacity=".6"` : a.replace('fill=', 'stroke=')} stroke-width="0.05"/>`,
    postel: (a, d) => `<rect x="-0.47" y="-0.22" width="0.07" height="0.55" rx="0.02" ${a}/><rect x="-0.47" y="0.02" width="0.94" height="0.15" rx="0.04" ${a}/><rect x="0.4" y="0.1" width="0.07" height="0.23" rx="0.02" ${a}/><ellipse cx="-0.3" cy="-0.04" rx="0.11" ry="0.06" ${a}/>`,
    zub: (a) => `<path d="M -0.3 -0.3 Q -0.3 -0.48 -0.14 -0.48 Q 0 -0.42 0.14 -0.48 Q 0.3 -0.48 0.3 -0.3 Q 0.3 -0.08 0.2 0.1 L 0.15 0.44 Q 0.1 0.5 0.06 0.44 L 0.02 0.14 Q 0 0.08 -0.02 0.14 L -0.06 0.44 Q -0.1 0.5 -0.15 0.44 L -0.2 0.1 Q -0.3 -0.08 -0.3 -0.3 Z" ${a}/>`,
    mince: (a, d) => `<circle cx="0" cy="0" r="0.42" ${a}/>` + (d ? '' : `<circle cx="0" cy="0" r="0.31" fill="none" stroke="${NAVY}" stroke-opacity=".35" stroke-width="0.035"/>`),
    dum: (a, d) => `<path d="M -0.42 0.4 V -0.02 L 0 -0.42 L 0.42 -0.02 V 0.4 Z" ${a}/>` + (d ? '' : `<rect x="-0.08" y="0.14" width="0.16" height="0.26" fill="${NAVY}"/>`),
    rok: (a, d) => `<rect x="-0.38" y="-0.34" width="0.76" height="0.74" rx="0.08" ${a}/>` + (d ? '' : `<rect x="-0.38" y="-0.34" width="0.76" height="0.2" rx="0.08" fill="${NAVY}" fill-opacity=".4"/>`),
    svicka: (a, d) => `<rect x="-0.16" y="-0.08" width="0.32" height="0.5" rx="0.03" ${a}/><path d="M 0 -0.44 Q 0.13 -0.26 0 -0.14 Q -0.13 -0.26 0 -0.44 Z" ${a}/>`,
  };
  const ikona = (typ, cx, cy, s, barva, duch = false) => g(cx, cy, s, IKONY[typ](sk(barva, duch), duch));

  // legenda: [[barva|null (prázdný obrys), text]]
  const legenda = (x, y, f, polozky, typ) => polozky.map(([b, t], i) => ikona(typ, x + f * 0.65, y + i * f * 2.0 - f * 0.4, f * 1.5, b || BILA, !b) + T(x + f * 1.7, y + i * f * 2.0, t, 'start', BILA, f * 1.25, 600)).join('');

  // vlaječky (poměr 3:2): CZ a JP
  const vlajka = (kod, x, y, w, h) => {
    const r = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.1}" fill="#f8f6f0"/>`;
    if (kod === 'cz') return r + `<path d="M ${x} ${y + h / 2} H ${x + w} V ${y + h - h * 0.1} Q ${x + w} ${y + h} ${x + w - h * 0.1} ${y + h} H ${x + h * 0.1} Q ${x} ${y + h} ${x} ${y + h - h * 0.1} Z" fill="#d7141a"/><path d="M ${x} ${y} L ${x + w * 0.5} ${y + h / 2} L ${x} ${y + h} Z" fill="#11457e"/>`;
    if (kod === 'no') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.1}" fill="#ba0c2f"/><rect x="${x}" y="${y + h * 0.375}" width="${w}" height="${h * 0.25}" fill="#f8f6f0"/><rect x="${x + w * 0.27}" y="${y}" width="${h * 0.25}" height="${h}" fill="#f8f6f0"/><rect x="${x}" y="${y + h * 0.44}" width="${w}" height="${h * 0.12}" fill="#00205b"/><rect x="${x + w * 0.27 + h * 0.065}" y="${y}" width="${h * 0.12}" height="${h}" fill="#00205b"/>`;
    return r + `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${h * 0.3}" fill="#bc002d"/>`;
  };

  const MOTIVY = {
    // jedna mřížka ikon: skupiny = [[počet, barva, duch]], legenda dole
    mrizka(w, h, { ikona: typ, skupiny, legenda: lg, sloupce, bok }) {
      const f = fsOf(w), n = skupiny.reduce((a, s) => a + s[0], 0), W = bok ? w * 0.46 : w, rez = lg ? lg.length * f * 2.0 + f * 0.8 : 0;
      let best = { k: 0, c: 1 };
      for (let c = 1; c <= n; c++) { if (sloupce && c !== sloupce) continue; const k = Math.min(W / c, (h - rez) / Math.ceil(n / c)); if (k > best.k) best = { k, c }; }
      const { k, c } = best, rows = Math.ceil(n / c), gx = bok ? 0 : (w - k * c) / 2, gy = bok ? (h - rows * k) / 2 : 0;
      let s = '', idx = 0;
      for (const [cnt, b, duch] of skupiny) for (let j = 0; j < cnt; j++, idx++) s += ikona(typ, gx + (idx % c + 0.5) * k, gy + (Math.floor(idx / c) + 0.5) * k, k * 0.84, b, duch);
      if (lg) s += legenda(gx, rows * k + f * 1.7, f, lg, typ);
      if (bok) {
        const tot = bok.reduce((a, r) => a + r[1] * f * 1.2, 0); let y = (h - tot) / 2;
        for (const [t, m, b, wt] of bok) { y += m * f * 1.2; s += T(w * 0.5, y - m * f * 0.2, t, 'start', b, m * f, wt || 700); }
      }
      return svgWrap(w, h, s);
    },
    // řady ikon pod sebou, každá s nadpisem a výsledkem vpravo
    rady2(w, h, { radky, jednotka }) {
      const f = fsOf(w), n = radky.length, N = Math.max(...radky.map((r) => r.skupiny.reduce((a, s) => a + s[0], 0)));
      const hh = f * 1.6, rez = jednotka ? f * 1.7 : 0, k = Math.min(w / N, (h - rez) / n - hh);
      const kk = Math.max(k, 10), lane = (h - rez) / n;
      let s = '';
      radky.forEach((r, i) => {
        const y0 = i * lane + (lane - hh - kk) / 2;
        const fw = r.vlajka ? f * 2.4 : 0; if (r.vlajka) s += vlajka(r.vlajka, 0, y0 + f * 0.1, fw, fw / 1.5); s += T(r.vlajka ? fw + f * 0.6 : 0, y0 + f * 1.3, r.nazev, 'start', BILA, f * 1.3, 700) + (r.pozn ? T(w, y0 + f * 1.4, r.pozn, 'end', r.zv ? ZLU : BILA, f * 1.7, 700) : '');
        let idx = 0;
        for (const [cnt, b, duch, typ] of r.skupiny) for (let j = 0; j < cnt; j++, idx++) s += ikona(typ || r.ikona, (idx + 0.5) * kk, y0 + hh + kk / 2, kk * 0.86, b, duch);
      });
      if (jednotka) s += T(0, h - f * 0.3, jednotka, 'start', BILA, f * 1.1, 500);
      return svgWrap(w, h, s);
    },
    // jedna řada = jeden řádek: vlaječka, název, řada ikon, výsledek vpravo
    radyVRadku(w, h, { radky, jednotka }) {
      const f = fsOf(w), n = radky.length, rez = jednotka ? f * 1.9 : 0, lane = (h - rez) / n, fw = f * 2.0;
      const nameW = f * 4.6, R = f * 4.9, L = fw + f * 0.6 + nameW, N = Math.max(...radky.map((r) => r.skupiny.reduce((a, g) => a + g[0], 0)));
      const k = Math.min((w - L - R) / N, lane * 0.8);
      let s = '';
      radky.forEach((r, i) => {
        const cy = lane * (i + 0.5);
        if (r.vlajka) s += vlajka(r.vlajka, 0, cy - fw / 3, fw, fw / 1.5);
        s += T(fw + f * 0.6, cy + f * 0.4, r.nazev, 'start', BILA, f * 1.15, 700);
        let idx = 0;
        for (const [cnt, b, duch] of r.skupiny) for (let j = 0; j < cnt; j++, idx++) s += ikona(r.ikona, L + (idx + 0.5) * k, cy, k * 0.9, b, duch);
        if (r.pozn) { const fs_ = f * 1.75; s += `<text x="${w}" y="${(cy + fs_ * 0.35).toFixed(1)}" text-anchor="end" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="${fs_.toFixed(1)}" ${halo(fs_)}>${[].concat(r.pozn).map(([t, b]) => `<tspan fill="${b}">${t}</tspan>`).join('')}</text>`; }
      });
      if (jednotka) s += T(0, h - f * 0.3, jednotka, 'start', BILA, f * 1.1, 500);
      return svgWrap(w, h, s);
    },
    // zub a velké číslo
    zub(w, h, { cislo, popis }) {
      const f = fsOf(w), k = Math.min(h * 0.92, w * 0.34);
      let s = ikona('zub', k * 0.5, h / 2, k, CORAL);
      const fs_ = Math.min(h * 0.4, (w - k * 1.15) / (cislo.length * 0.58));
      s += T(k * 1.15, h / 2 + fs_ * 0.05, cislo, 'start', ZLU, fs_, 700) + [].concat(popis).map((l, i) => T(k * 1.15, h / 2 + fs_ * 0.05 + f * 1.8 + i * f * 1.5, l, 'start', BILA, f * 1.25, 600)).join('');
      return svgWrap(w, h, s);
    },
    // dvě velká čísla vedle sebe: sloupce = [{ n, jmeno, b }], pod = text pod jmény
    dveCisla(w, h, { sloupce, pod }) {
      const f = fsOf(w), col = w / sloupce.length, fs_ = Math.min(h * 0.6, col * 0.75);
      let s = '';
      sloupce.forEach((c, i) => {
        const cx = col * (i + 0.5), y = h * 0.1 + fs_ * 0.78;
        s += T(cx, y, c.n, 'middle', c.b, fs_, 700) + T(cx, y + f * 1.9, c.jmeno, 'middle', BILA, f * 1.6, 700) + T(cx, y + f * 3.5, pod, 'middle', BILA, f * 1.2, 500);
      });
      return svgWrap(w, h, s);
    },
    // jedno velké číslo nad vodorovným pruhem 100 % (zvýrazněná část vlevo)
    podil(w, h, { cislo, cast, legenda: lg }) {
      const f = fsOf(w), fs_ = h * 0.42, by = fs_ * 1.05, bh = Math.min(h * 0.16, f * 3), bx = w * cast / 100;
      let s = T(0, fs_ * 0.82, cislo, 'start', ZLU, fs_, 700);
      s += `<rect x="0" y="${by}" width="${w}" height="${bh}" rx="${bh * 0.2}" fill="${CH}"/><rect x="0" y="${by}" width="${bx}" height="${bh}" rx="${bh * 0.2}" fill="${ZLU}"/>`;
      let x = 0; const y = by + bh + f * 2.1;
      lg.forEach(([b, t]) => { s += C(x + f * 0.55, y - f * 0.4, f * 0.55, b) + T(x + f * 1.4, y, t, 'start', BILA, f * 1.3, 600); x += f * 2.4 + t.length * f * 0.68; });
      return svgWrap(w, h, s);
    },
    // dvě stanoviska vedle sebe, stejně velké karty (nic se nesrovnává délkou)
    stanoviska(w, h, { karty }) {
      const f = fsOf(w), gap = f * 1.2, cw = (w - gap) / 2, ch = h * 0.94;
      let s = '';
      karty.forEach((k, i) => {
        const x = i * (cw + gap), b = k.zv ? ZLU : CORAL;
        s += `<rect x="${x + f * 0.07}" y="${f * 0.07}" width="${cw - f * 0.14}" height="${ch - f * 0.14}" rx="${f * 0.8}" fill="${b}" fill-opacity=".1" stroke="${b}" stroke-width="${f * 0.14}"/>`;
        s += T(x + f * 1.3, f * 2.3, k.kdo, 'start', BILA, f * 1.3, 700);
        s += T(x + f * 1.3, ch * 0.52, k.velke, 'start', b, Math.min(f * 2.5, (cw - f * 2.6) / (k.velke.length * 0.6)), 700);
        k.pod.forEach((l, j) => { s += T(x + f * 1.3, ch * 0.52 + f * 2.0 + j * f * 1.45, l, 'start', BILA, f * 1.2, 500); });
      });
      return svgWrap(w, h, s);
    },
    // kdo je pojištěn státem a co se mění: tři symboly + přeškrtnutých 21 a 13
    platba(w, h, { kdo, puvodni, nove, pod }) {
      const f = fsOf(w), k = Math.min(h * 0.46, w * 0.12), lw = w * 0.46;
      let s = '';
      kdo.forEach(([typ, jm], i) => {
        const cx = k * 0.6 + i * (lw - k * 1.2) / (kdo.length - 1);
        s += ikona(typ, cx, h * 0.3, k, CORAL) + T(cx, h * 0.3 + k * 0.5 + f * 1.4, jm, 'middle', BILA, f * 1.0, 600);
      });
      s += T(lw / 2, h * 0.3 + k * 0.5 + f * 3.4, 'za ně platí stát', 'middle', BILA, f * 1.4, 700);
      const x0 = w * 0.52, fs_ = Math.min(h * 0.5, f * 4.6), w1 = fs_ * 0.58 * puvodni.length;
      s += T(x0, h * 0.52, puvodni, 'start', CORAL, fs_, 700);
      s += `<rect x="${x0 - f * 0.3}" y="${h * 0.52 - fs_ * 0.3}" width="${w1 + f * 0.6}" height="${f * 0.28}" rx="${f * 0.14}" fill="${BILA}" transform="rotate(-8 ${x0 + w1 / 2} ${h * 0.52 - fs_ * 0.3})"/>`;
      s += T(x0 + w1 + f * 1.4, h * 0.52, nove, 'start', ZLU, fs_, 700);
      s += T(x0, h * 0.52 + f * 2.2, pod, 'start', BILA, f * 1.2, 600);
      return svgWrap(w, h, s);
    },
    // chybějící údaj: přerušovaný obrys s otazníkem
    chybi(w, h, { co, jak }) {
      const f = fsOf(w), q = h * 0.9;
      let s = `<rect x="${f * 0.1}" y="${f * 0.1}" width="${w - f * 0.2}" height="${h - f * 0.2}" rx="${f * 1.2}" fill="${BILA}" fill-opacity=".05" stroke="${BILA}" stroke-opacity=".7" stroke-width="${f * 0.13}" stroke-dasharray="${f * 0.9} ${f * 0.6}"/>`;
      s += `<text x="${(w - f * 2.2).toFixed(1)}" y="${(h * 0.5 + q * 0.34).toFixed(1)}" text-anchor="end" font-family="IBM Plex Serif, Georgia, serif" font-weight="700" font-size="${q.toFixed(1)}" fill="${CORAL}">?</text>`;
      s += T(f * 2, h * 0.42, co, 'start', BILA, Math.min(f * 2.6, (w * 0.6) / (co.length * 0.52)), 700);
      s += T(f * 2, h * 0.42 + f * 3.2, jak, 'start', ZLU, f * 1.9, 700);
      return svgWrap(w, h, s);
    },
    // diagnóza → platba
    diagnoza(w, h, { text }) {
      const f = fsOf(w), k = Math.min(h * 0.62, w * 0.24), cy = h * 0.4, x1 = w * 0.2, x2 = w * 0.8;
      let s = `<rect x="${x1 - k * 0.38}" y="${cy - k * 0.5}" width="${k * 0.76}" height="${k}" rx="${k * 0.07}" fill="${CORAL}"/><rect x="${x1 - k * 0.14}" y="${cy - k * 0.58}" width="${k * 0.28}" height="${k * 0.14}" rx="${k * 0.04}" fill="${CH}"/>`;
      for (let i = 0; i < 4; i++) s += `<rect x="${x1 - k * 0.26}" y="${cy - k * 0.24 + i * k * 0.17}" width="${i === 3 ? k * 0.28 : k * 0.52}" height="${k * 0.06}" rx="${k * 0.03}" fill="${NAVY}" fill-opacity=".55"/>`;
      s += `<path d="M ${w * 0.36} ${cy - k * 0.07} H ${w * 0.6} V ${cy - k * 0.2} L ${w * 0.66} ${cy} L ${w * 0.6} ${cy + k * 0.2} V ${cy + k * 0.07} H ${w * 0.36} Z" fill="${ZLU}"/>`;
      s += ikona('mince', x2, cy, k * 1.05, ZLU) + T(x2, cy + k * 0.09, 'Kč', 'middle', NAVY, k * 0.34, 700).replace(/stroke="[^"]*" stroke-width="[^"]*" paint-order="stroke" stroke-linejoin="round"/, '');
      s += T(x1, cy + k * 0.5 + f * 1.8, 'diagnóza', 'middle', BILA, f * 1.4, 700) + T(x2, cy + k * 0.5 + f * 1.8, 'platba', 'middle', BILA, f * 1.4, 700);
      if (text) s += T(w / 2, h - f * 0.4, text, 'middle', BILA, f * 1.1, 500);
      return svgWrap(w, h, s);
    },
  };

  const lek = 'lekar';
  const ZADANI = {
    '01-pyramida': { motiv: 'mrizka', arg: { ikona: lek, sloupce: 5, skupiny: [[5, ZLU], [5, CH]], bok: [['polovina', 3.0, ZLU], ['za deset let v důchodu', 1.25, BILA, 600]] } },
    '02-stari': { motiv: 'rady2', arg: { jednotka: 'každý čtvereček je jeden rok ve zdraví po 65. narozeninách', radky: [{ nazev: 'Švédové', ikona: 'rok', skupiny: [[14, CH]], pozn: '14 let' }, { nazev: 'Češi', ikona: 'rok', skupiny: [[8, ZLU], [6, CH, true]], pozn: '8 let', zv: true }] } },
    '03-digital': { motiv: 'mrizka', arg: { ikona: lek, sloupce: 5, skupiny: [[5, ZLU], [5, CH]], bok: [['skoro polovina', 1.75, ZLU], ['do pěti let', 1.25, BILA, 600], ['v důchodovém věku', 1.25, BILA, 600]] } },
    '04-sestry-a-skupinove-praxe': { motiv: 'rady2', arg: { jednotka: 'sestry na 1 000 obyvatel', radky: [{ nazev: 'Norsko', ikona: 'sestra', skupiny: [[16, CH]], pozn: '16' }, { nazev: 'Česko', ikona: 'sestra', skupiny: [[9, ZLU], [7, CH, true]], pozn: '9', zv: true }] } },
    '07-zubari': { motiv: 'zub', arg: { cislo: 'skoro 7 000', popis: ['zubních lékařů,', 'zhruba jako před pěti lety'] } },
    '09-nemocnice': { motiv: 'rady2', arg: { jednotka: 'nemocniční lůžka na 1 000 obyvatel', radky: [{ nazev: 'Česko', ikona: 'postel', skupiny: [[6, ZLU]], pozn: '6', zv: true }, { nazev: 'vyspělé země', ikona: 'postel', skupiny: [[4, CH]], pozn: '4' }] } },
    '10-kdo-se-postara': { motiv: 'radyVRadku', arg: { jednotka: 'pracovníci v péči o seniory na 100 seniorů', radky: [{ nazev: '', vlajka: 'cz', ikona: 'sestra', skupiny: [[2, ZLU]], pozn: [['2', ZLU]] }, { nazev: 'průměr', ikona: 'sestra', skupiny: [[5, CH]], pozn: [['5', BILA]] }, { nazev: '', vlajka: 'no', ikona: 'sestra', skupiny: [[13, CH]], pozn: [['13', BILA]] }] } },
    '11-kdo-vlastni-peci': { motiv: 'mrizka', arg: { ikona: 'dum', sloupce: 5, skupiny: [[25, ZLU]], bok: [['455 000', 3.4, ZLU], ['lidí je kapacita domovů,', 1.25, BILA, 600], ['které spravuje', 1.25, BILA, 600], ['25 největších korporací', 1.25, BILA, 600]] } },
    '12-treti-navrat-vojtecha': { motiv: 'platba', arg: { kdo: [['clovek', 'děti'], ['senior', 'senioři'], ['student', 'studenti']], puvodni: '21', nove: '13', pod: 'miliard navíc pro rok 2027' } },
    '13-cekaci-doby': { motiv: 'chybi', arg: { co: 'Jak dlouho se čeká', jak: 'to se plošně neměří' } },
    '14-kolik-stoji-kdo-plati': { motiv: 'podil', arg: { cislo: '14 Kč', cast: 14, legenda: [[ZLU, 'platíme sami'], [CH, 'hradí veřejné peníze']] } },
    '15-sousede-stredni-evropa': { motiv: 'rady2', arg: { jednotka: 'každá mince je 1 koruna na zdraví na člověka (Česko = 10)', radky: [{ nazev: 'Česko', ikona: 'mince', skupiny: [[10, CH]], pozn: '10' }, { nazev: 'Rakousko', ikona: 'mince', skupiny: [[10, CH], [7, ZLU]], pozn: '17', zv: true }] } },
    'svet-japonsko-stari': { motiv: 'radyVRadku', arg: { jednotka: 'podíly lidí starších 65 let', radky: [{ nazev: '2026', vlajka: 'cz', ikona: 'senior', skupiny: [[2, ZLU], [8, CH]], pozn: [['2', ZLU], ['/', BILA], ['10', CH]] }, { nazev: '2050', vlajka: 'cz', ikona: 'senior', skupiny: [[3, ZLU], [7, CH]], pozn: [['3', ZLU], ['/', BILA], ['10', CH]] }, { nazev: '2026', vlajka: 'jp', ikona: 'senior', skupiny: [[3, ZLU], [7, CH]], pozn: [['3', ZLU], ['/', BILA], ['10', CH]], zv: true }] } },
    'svet-jizni-korea-lekari': { motiv: 'rady2', arg: { jednotka: 'symbol = 1 z 10 v Česku; plné jsou ty, které má Jižní Korea', radky: [{ nazev: 'Lékaři na obyvatele', ikona: 'lekar', skupiny: [[6, ZLU], [4, CH, true]], pozn: 'o 40 % méně', zv: true }, { nazev: 'Předčasná úmrtí', ikona: 'svicka', skupiny: [[5, ZLU], [5, CH, true]], pozn: 'o polovinu méně', zv: true }] } },
    'explainer-drg': { motiv: 'diagnoza', arg: {} },
  };
  return { MOTIVY, ZADANI };
};
