// lib/remark-factcheck-plugin.js
import { visit } from 'unist-util-visit';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

// A small parser to turn fact-check content into a proper markdown AST
const markdownParser = remark().use(remarkGfm);

// Verdict tokens recognized in the fence meta string, e.g. ```factcheck pravda
// Supports both Czech and English authoring so both apps can share the plugin.
const VERDICT_TOKENS = {
  true: 'true',
  pravda: 'true',
  false: 'false',
  nepravda: 'false',
  misleading: 'misleading',
  zavadejici: 'misleading',
  'zavádějící': 'misleading',
  unverifiable: 'unverifiable',
  unverified: 'unverifiable',
  neoverene: 'unverifiable',
  'neověřené': 'unverifiable',
  'neoveritelne': 'unverifiable',
  'neověřitelné': 'unverifiable',
};

// Tokens are matched exactly (not by substring) so e.g. "nepravda" never
// matches the "pravda" token.
function parseMeta(meta) {
  const tokens = (meta || '').toLowerCase().split(/\s+/).filter(Boolean);
  const verdict = tokens.map((t) => VERDICT_TOKENS[t]).find(Boolean) || null;
  return { verdict };
}

function makeAttr(name, value) {
  return { type: 'mdxJsxAttribute', name, value };
}

export function remarkFactCheckPlugin() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'factcheck') return;

      // Parse the fact-check body as full markdown so links, lists, etc. work
      const parsed = markdownParser.parse(node.value);
      const { verdict } = parseMeta(node.meta);

      const attributes = [];
      // Only set verdict when explicitly provided; omitting it lets
      // FactCheckBox default to 'unverifiable'
      if (verdict) attributes.push(makeAttr('verdict', verdict));

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'FactCheckBox',
        attributes,
        children: parsed.children,
      };
    });
  };
}
