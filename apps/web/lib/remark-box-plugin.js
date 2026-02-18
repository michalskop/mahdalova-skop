// lib/remark-box-plugin.js
import { visit } from 'unist-util-visit';

export function remarkBoxPlugin() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'box') {
        // Convert each non-empty line into a proper paragraph AST node
        // so MDX renders them as React elements (not raw HTML strings)
        const children = node.value
          .split('\n')
          .filter(line => line.trim())
          .map(line => ({
            type: 'paragraph',
            children: [{ type: 'text', value: line.trim() }],
          }));

        // Replace the code node with an mdxJsxFlowElement for MediaBox
        parent.children[index] = {
          type: 'mdxJsxFlowElement',
          name: 'MediaBox',
          attributes: [],
          children,
        };
      }
    });
  };
}
