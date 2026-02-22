// lib/remark-box-plugin.js
import { visit } from 'unist-util-visit';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

// A small parser to turn box content into a proper markdown AST
const markdownParser = remark().use(remarkGfm);

// Parse optional props from the fence meta string, e.g. ```infobox warning right
function parseMeta(meta) {
  const str = meta || '';
  const type = ['info', 'warning', 'success', 'error'].find(t => str.includes(t)) || null;
  const float = ['right', 'left'].find(f => str.includes(f)) || null;
  return { type, float };
}

function makeAttr(name, value) {
  return { type: 'mdxJsxAttribute', name, value };
}

// Split parsed children at a <!-- more --> HTML comment.
// Returns { children (marker excluded), readMoreAt (child index before marker, or null) }
function splitAtReadMore(parsedChildren) {
  const children = [];
  let readMoreAt = null;
  for (const child of parsedChildren) {
    if (
      readMoreAt === null &&
      child.type === 'html' &&
      child.value.trim() === '<!-- more -->'
    ) {
      readMoreAt = children.length;
    } else {
      children.push(child);
    }
  }
  return { children, readMoreAt };
}

export function remarkBoxPlugin() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      const lang = node.lang;
      // 'box' is a legacy alias for the default infobox; 'mediabox' is retired
      if (lang !== 'box' && lang !== 'mediabox' && lang !== 'infobox') return;

      // Parse the box content as full markdown so links, headings, lists, etc. work
      const parsed = markdownParser.parse(node.value);
      const { children, readMoreAt } = splitAtReadMore(parsed.children);

      const { type, float } = parseMeta(node.meta);
      const attributes = [];
      // Only set type when explicitly provided; omitting it lets InfoBox default to 'default'
      if (type) attributes.push(makeAttr('type', type));
      if (float) attributes.push(makeAttr('float', float));
      if (readMoreAt !== null) attributes.push(makeAttr('readMoreAt', String(readMoreAt)));

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'InfoBox',
        attributes,
        children,
      };
    });
  };
}
