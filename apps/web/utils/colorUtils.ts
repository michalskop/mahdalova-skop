// utils/colorUtils.ts
export function hexToRgbString(hex: string): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function hexToRgbTuple(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgbString(hex).split(',').map(Number);
  return [r, g, b];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [f(r), f(g), f(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// WCAG contrast ratio of `hex` against `bgHex` (defaults to white, since that's
// the background every text usage of an accent colour sits on in this app).
export function contrastRatio(hex: string, bgHex = '#ffffff'): number {
  const L1 = relativeLuminance(hexToRgbTuple(hex));
  const L2 = relativeLuminance(hexToRgbTuple(bgHex));
  const [lighter, darker] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgbTuple(hex).map(v => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Chapter accents are picked for hue variety first (logo, borders, glows on
// dark/white decorative surfaces, where a 4px border or a light-bg silhouette
// doesn't need text-grade contrast). But a few of them (bright yellow/teal/
// mint) fail WCAG when used as body text on a white card – e.g. the ImpactCard
// big number, or article h2/link colour. This darkens (same hue/saturation,
// only lightness steps down) just enough to clear a large-text-safe contrast
// ratio against the given background, leaving already-legible colours
// untouched.
export function readableAccent(hex: string, bgHex = '#ffffff', targetRatio = 3.2): string {
  const [h, s, l] = hexToHsl(hex);
  let lightness = l;
  let current = hex;
  let steps = 0;
  while (contrastRatio(current, bgHex) < targetRatio && lightness > 0.15 && steps < 40) {
    lightness -= 0.02;
    current = hslToHex(h, s, lightness);
    steps++;
  }
  return current;
}
