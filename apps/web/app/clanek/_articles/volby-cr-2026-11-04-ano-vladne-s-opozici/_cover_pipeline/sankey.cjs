// Sankey „kdo s kým“ pro carousel a animaci: stejná data (sankey.json z _data_pipeline/vypocet.py), barvy stran
// a přechody vláken (strana → šedá → partner) jako graf v článku (sankey.html), na béžové kartě jako ostatní grafy
// v carouselech. kresli() vrací SVG skupinu (bez obalového <svg>) do plochy [x, y, w, h].
//   rust   0–1: jak daleko zleva doprava jsou vlákna nakreslená (animace narůstání)
//   fokus  název strany, jejíž vlákna se zvýrazní (jako klik v článku); strana 'L' = vlevo
//   sila   0–1: míra zvýraznění (plynulý přechod v animaci); u partnerů se ukáže počet společných koalic
const D = require('./sankey.json');

const KARTA = '#f8f6f0'; // background.0 jako karty grafů v carouselech
const INK = '#101432';
const SEDA = '#55597a';
const STRED = '#b9bccb';
const f1 = (v) => (Math.round(v * 10) / 10).toString();
const mix = (a, b, k) => a + (b - a) * k;

let citac = 0;
function kresli({ x, y, w, h, rust = 1, fokus = null, strana = 'L', sila = 0, fs = 27, pad = 34 }) {
  const id = `sk${citac++}`;
  const lw = w * 0.25, rw = w * 0.25, nw = 14;
  const x0 = x + pad + lw, x1 = x + w - pad - rw - nw;
  const gap = fs * 0.62;
  const hIn = h - 2 * pad;
  const sum = D.uzly.reduce((a, u) => a + u.tok, 0);
  const k = (hIn - gap * (D.uzly.length - 1)) / sum;
  const yy = {};
  let c = y + pad;
  for (const u of D.uzly) { yy[u.n] = c; c += u.tok * k + gap; }
  const offL = { ...yy }, offR = { ...yy };
  const barva = Object.fromEntries(D.uzly.map((u) => [u.n, u.barva]));
  const partneri = {};
  let defs = `<clipPath id="${id}c"><rect x="${f1(x0)}" y="${y}" width="${f1((x1 + nw - x0) * rust + 1)}" height="${h}"/></clipPath>`;
  let cesty = '';
  D.vazby.forEach((v, i) => {
    const hh = v.v * k, a0 = offL[v.s], b0 = offR[v.t];
    offL[v.s] += hh; offR[v.t] += hh;
    const cx = (x0 + nw + x1) / 2;
    defs += `<linearGradient id="${id}g${i}" gradientUnits="userSpaceOnUse" x1="${f1(x0 + nw)}" y1="0" x2="${f1(x1)}" y2="0">`
      + `<stop offset="0" stop-color="${barva[v.s]}"/><stop offset="0.5" stop-color="${STRED}"/><stop offset="1" stop-color="${barva[v.t]}"/></linearGradient>`;
    const zap = fokus && (strana === 'L' ? v.s : v.t) === fokus;
    if (zap) partneri[strana === 'L' ? v.t : v.s] = v.v;
    const zakl = v.s === 'ANO' && !fokus ? 0.7 : 0.4;
    const op = fokus ? (zap ? mix(zakl, 0.88, sila) : mix(zakl, 0.05, sila)) : zakl;
    cesty += `<path d="M${f1(x0 + nw)},${f1(a0)} C${f1(cx)},${f1(a0)} ${f1(cx)},${f1(b0)} ${f1(x1)},${f1(b0)} L${f1(x1)},${f1(b0 + hh)} `
      + `C${f1(cx)},${f1(b0 + hh)} ${f1(cx)},${f1(a0 + hh)} ${f1(x0 + nw)},${f1(a0 + hh)} Z" fill="url(#${id}g${i})" fill-opacity="${op.toFixed(3)}"/>`;
  });
  let uzly = '';
  const txt = (tx, ty, s, o = {}) => `<text x="${f1(tx)}" y="${f1(ty)}" font-family="IBM Plex Sans, Arial, sans-serif" font-size="${o.size ?? fs}" `
    + `font-weight="${o.w ?? 600}" fill="${o.fill ?? INK}" text-anchor="${o.a ?? 'start'}" dominant-baseline="middle" opacity="${(o.op ?? 1).toFixed(3)}">${s}</text>`;
  for (const u of D.uzly) {
    const hh = Math.max(u.tok * k, 3), ym = yy[u.n] + hh / 2;
    const jeL = fokus && strana === 'L' && u.n === fokus, jeR = fokus && strana === 'R' && u.n === fokus;
    const opL = fokus ? (jeL || (strana === 'R' && u.n in partneri) ? 1 : mix(1, 0.3, sila)) : 1;
    const opR = fokus ? (jeR || (strana === 'L' && u.n in partneri) ? 1 : mix(1, 0.3, sila)) : 1;
    const tw = u.n === 'ANO' ? 700 : 600;
    const kk = `${u.koalic} ${u.koalic < 5 ? 'koalice' : 'koalic'}`;
    uzly += `<rect x="${f1(x0)}" y="${f1(yy[u.n])}" width="${nw}" height="${f1(hh)}" fill="${u.barva}" opacity="${opL.toFixed(3)}"/>`;
    uzly += `<rect x="${f1(x1)}" y="${f1(yy[u.n])}" width="${nw}" height="${f1(hh)}" fill="${u.barva}" opacity="${opR.toFixed(3)}"/>`;
    const pocL = strana === 'R' && fokus && u.n in partneri ? ` · ${partneri[u.n]}` : '';
    const pocR = strana === 'L' && fokus && u.n in partneri ? ` · ${partneri[u.n]}` : '';
    if (hh > fs * 1.6) {
      uzly += txt(x0 - 12, ym - fs * 0.42, u.n + (pocL && sila > 0.5 ? pocL : ''), { a: 'end', w: tw, op: opL });
      uzly += txt(x0 - 12, ym + fs * 0.5, kk, { a: 'end', w: 400, size: fs * 0.72, fill: SEDA, op: opL });
    } else {
      uzly += txt(x0 - 12, ym, `${u.n}${pocL && sila > 0.5 ? pocL : ''} <tspan font-weight="400" font-size="${f1(fs * 0.72)}" fill="${SEDA}">${kk}</tspan>`, { a: 'end', w: tw, op: opL });
    }
    uzly += txt(x1 + nw + 12, ym, u.n + (pocR ? `<tspan font-weight="400" fill="${SEDA}" opacity="${sila.toFixed(3)}">${pocR}</tspan>` : ''), { w: tw, op: opR });
  }
  return `<defs>${defs}</defs><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${KARTA}"/>`
    + `<g clip-path="url(#${id}c)">${cesty}</g>${uzly}`;
}

// páry pro kontrolu čísel v textech slidů (stejné jako v článku)
const par = (a, b) => (D.vazby.find((v) => v.s === a && v.t === b) || {}).v || 0;

module.exports = { kresli, par, D };
