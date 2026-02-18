// lib/remark-box-plugin.js
import { visit } from 'unist-util-visit';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

// A small parser to turn box content into a proper markdown AST
const markdownParser = remark().use(remarkGfm);

// Parse optional props from the fence meta string, e.g. ```infobox warning right
function parseMeta(meta) {
  const str = meta || '';
  const type = ['info', 'warning', 'success', 'error'].find(t => str.includes(t)) || 'info';
  const float = ['right', 'left'].find(f => str.includes(f)) || null;
  return { type, float };
}

function makeAttr(name, value) {
  return { type: 'mdxJsxAttribute', name, value };
}

export function remarkBoxPlugin() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      const lang = node.lang;
      if (lang !== 'box' && lang !== 'mediabox' && lang !== 'infobox') return;

      // Parse the box content as full markdown so links, headings, etc. work
      const parsed = markdownParser.parse(node.value);

      if (lang === 'infobox') {
        const { type, float } = parseMeta(node.meta);
        const attributes = [makeAttr('type', type)];
        if (float) attributes.push(makeAttr('float', float));

        parent.children[index] = {
          type: 'mdxJsxFlowElement',
          name: 'InfoBox',
          attributes,
          children: parsed.children,
        };
      } else {
        // 'box' and 'mediabox' both map to MediaBox
        const { float } = parseMeta(node.meta);
        const attributes = float ? [makeAttr('float', float)] : [];

        parent.children[index] = {
          type: 'mdxJsxFlowElement',
          name: 'MediaBox',
          attributes,
          children: parsed.children,
        };
      }
    });
  };
}
