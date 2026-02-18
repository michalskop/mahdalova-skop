// lib/remark-box-plugin.js
import { visit } from 'unist-util-visit';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

// A small parser to turn box content into a proper markdown AST
const markdownParser = remark().use(remarkGfm);

export function remarkBoxPlugin() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'box') {
        // Parse the box content as full markdown so links, headings, etc. work
        const parsed = markdownParser.parse(node.value);

        parent.children[index] = {
          type: 'mdxJsxFlowElement',
          name: 'MediaBox',
          attributes: [],
          children: parsed.children,
        };
      }
    });
  };
}
