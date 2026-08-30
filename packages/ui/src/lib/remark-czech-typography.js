// lib/remark-czech-typography.js
//
// Czech typography fixes applied to article text at build time (MDX
// serialisation). Injects non-breaking spaces (U+00A0) so that:
//
//   1. One-letter prepositions/conjunctions (k s v z o u a i, and their capital
//      forms at sentence start) are never left dangling at the end of a line.
//   2. Brackets are never orphaned at a line edge – an opening bracket followed
//      by a space, or a space before a closing bracket, is bound to its word.
//
// See packages/ui/DESIGN.md → Typography. The transform only touches mdast
// `text` nodes, so it never rewrites code spans, code blocks, raw HTML or URLs.
import { visit } from 'unist-util-visit';

const NBSP = String.fromCharCode(0xA0); // U+00A0 non-breaking space

// Boundary before a one-letter word: start of string handled by `^`, plus
// whitespace and common opening punctuation / quotes / dashes.
const ONE_LETTER_RE = /(^|[\s(\[{„"'–—])([ksvzouaiKSVZOUAI])[ \t]+/gu;

export function fixCzechTypography(input) {
  if (typeof input !== 'string' || input.length === 0) return input;
  let s = input;

  // 1) NBSP after one-letter prepositions/conjunctions. Run twice so chains
  //    like "o a" (both one-letter) are both bound – the first pass turns the
  //    space after "o" into NBSP, which then acts as the boundary for "a".
  s = s.replace(ONE_LETTER_RE, `$1$2${NBSP}`);
  s = s.replace(ONE_LETTER_RE, `$1$2${NBSP}`);

  // 2) Opening bracket followed by a space → bind to the next word so the
  //    bracket can't be pushed to the end of a line on its own.
  s = s.replace(/([(\[{])[ \t]+/g, `$1${NBSP}`);

  // 3) Space before a closing bracket → bind to the previous word so the
  //    bracket can't start a new line on its own.
  s = s.replace(/[ \t]+([)\]}])/g, `${NBSP}$1`);

  return s;
}

export function remarkCzechTypography() {
  return (tree) => {
    visit(tree, 'text', (node) => {
      if (typeof node.value !== 'string') return;
      node.value = fixCzechTypography(node.value);
    });
  };
}
