// lib/remark-box-plugin.js
import { visit } from 'unist-util-visit';

export function remarkBoxPlugin() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'box') {
        // Split content by line breaks and wrap each line in <p> tags
        const paragraphs = node.value
          .split('\n')
          .map(line => `<p>${line.trim()}</p>`)
          .join('');

        // Replace the node with an mdxJsxFlowElement for MediaBox
        parent.children[index] = {
          type: 'mdxJsxFlowElement',
          name: 'MediaBox',
          children: [{ type: 'text', value: paragraphs }],
        };
      }
    });
  };
}
