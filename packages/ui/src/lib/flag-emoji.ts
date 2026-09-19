// flag-emoji.ts
// Jediné místo, které převádí vlaječkové emoji na standardizovaný SVG obrázek.
//
// PROČ: Windows (a Chrome na Windows) nevykresluje emoji vlajek – dvojice znaků
// „regional indicator" (např. 🇦🇹) se zobrazí jen jako kód země („AT"). Vlajky
// proto na webu renderujeme jako SVG (viz komponenta <Flag> a public/flags/*).
//
// V Markdownu článků převádí emoji na <Flag> remarkový plugin
// (apps/*/lib/remark-flag-plugin.js). Tento modul řeší druhou cestu: HTML
// řetězce vkládané přes dangerouslySetInnerHTML (scrollytelling `text`), kde
// React komponentu použít nelze, a tak vkládáme rovnou <img>.

/**
 * Dvojice znaků „regional indicator" (U+1F1E6–U+1F1FF), tj. jedna vlajka.
 * Používá se globálně, proto flag `g`.
 * UTF-16 surrogate pairs keep the pattern compatible with the ES5 TypeScript target.
 */
export const FLAG_EMOJI_REGEX = /(?:\uD83C[\uDDE6-\uDDFF]){2}/g;

/**
 * Převede vlaječkové emoji (dvojici regional indicatorů) na ISO 3166-1 alpha-2
 * kód země malými písmeny, např. 🇦🇹 → "at", 🇪🇺 → "eu". Regional indicator je
 * posunutý o U+1F1E6 od 'a', převod je proto čistě aritmetický.
 */
export function flagEmojiToCode(emoji: string): string {
  const chars = Array.from(emoji);
  if (chars.length !== 2) return '';
  return chars
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      if (cp < 0x1f1e6 || cp > 0x1f1ff) return '';
      return String.fromCharCode(cp - 0x1f1e6 + 'a'.charCodeAt(0));
    })
    .join('');
}

/**
 * Vrátí `<img>` HTML pro danou vlajku – vizuálně shodné s komponentou <Flag>
 * (packages/ui/src/components/Flag.tsx): čistý obdélník 4:3, bez rámečku, stínu,
 * pozadí i zaoblení. Když měníš styl, změň obojí. `size` = výška v px.
 */
export function flagImgHtml(code: string, size = 20): string {
  const cc = code.trim().toLowerCase();
  const width = Math.round((size * 4) / 3);
  const style = [
    'display:inline-block',
    `width:${width}px`,
    `height:${size}px`,
    'vertical-align:-0.15em',
    'object-fit:contain',
  ].join(';');
  return `<img src="/flags/rectangle/${cc}.svg" width="${width}" height="${size}" alt="" loading="lazy" decoding="async" style="${style}" />`;
}

/**
 * Nahradí ve vloženém HTML řetězci všechna vlaječková emoji za standardizované
 * `<img>` vlajky. Pro obsah renderovaný přes dangerouslySetInnerHTML.
 */
export function replaceFlagEmojiInHtml(html: string): string {
  if (!html) return html;
  return html.replace(FLAG_EMOJI_REGEX, (emoji) => {
    const code = flagEmojiToCode(emoji);
    return code ? flagImgHtml(code) : emoji;
  });
}
