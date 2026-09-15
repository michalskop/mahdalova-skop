// lib/remark-flag-plugin.js
// Převádí vlaječková emoji (🇦🇹, 🇩🇪, 🇪🇺 …) v těle článku na <Flag code="xx" />.
//
// PROČ: Windows (a Chrome na Windows) nevykresluje emoji vlajek – dvojice znaků
// „regional indicator" se zobrazí jen jako kód země („AT"). Autoři můžou v
// Markdownu klidně psát emoji; tento plugin je automaticky sjednotí na sdílenou
// komponentu <Flag>, která renderuje SVG. Platí pro všechny stávající i budoucí
// články (nadpisy, tabulky, seznamy, běžný text).
import { visit, SKIP } from 'unist-util-visit';

// Dvojice regional indicatorů (U+1F1E6–U+1F1FF) = jedna vlajka.
const FLAG_RE = /[\u{1F1E6}-\u{1F1FF}]{2}/gu;

// Regional indicator je posunutý o U+1F1E6 od 'a', převod je čistě aritmetický.
function emojiToCode(emoji) {
  return Array.from(emoji)
    .map((ch) => String.fromCharCode(ch.codePointAt(0) - 0x1f1e6 + 97))
    .join('');
}

function flagNode(code) {
  return {
    type: 'mdxJsxTextElement',
    name: 'Flag',
    attributes: [{ type: 'mdxJsxAttribute', name: 'code', value: code }],
    children: [],
  };
}

export function remarkFlagPlugin() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === null || !FLAG_RE.test(node.value)) return;

      const value = node.value;
      const replacement = [];
      let last = 0;
      FLAG_RE.lastIndex = 0;
      let m;
      while ((m = FLAG_RE.exec(value)) !== null) {
        if (m.index > last) {
          replacement.push({ type: 'text', value: value.slice(last, m.index) });
        }
        replacement.push(flagNode(emojiToCode(m[0])));
        last = m.index + m[0].length;
      }
      if (last < value.length) {
        replacement.push({ type: 'text', value: value.slice(last) });
      }

      parent.children.splice(index, 1, ...replacement);
      // Přeskoč právě vložené uzly (Flag nemá textové děti k procházení).
      return [SKIP, index + replacement.length];
    });
  };
}
