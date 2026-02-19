// lib/remark-flourish-plugin.js
import { visit } from 'unist-util-visit';

export function remarkFlourishPlugin() {
  return (tree) => {
    visit(tree, 'mdxJsxFlowElement', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (!node || node.name !== 'div') return;

      const attrs = Array.isArray(node.attributes) ? node.attributes : [];

      const getAttrString = (name) => {
        const attr = attrs.find((a) => a && a.type === 'mdxJsxAttribute' && a.name === name);
        if (!attr) return undefined;
        if (typeof attr.value === 'string') return attr.value;
        return undefined;
      };

      const dataSrc = getAttrString('data-src') || getAttrString('dataSrc');
      if (!dataSrc) return;

      const className =
        getAttrString('className') ||
        getAttrString('class') ||
        getAttrString('class-name');

      const classStr = className || '';
      if (!classStr.includes('flourish-embed') && !classStr.includes('flourish-')) return;

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'FlourishEmbed',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'dataSrc',
            value: dataSrc,
          },
          ...(className
            ? [
                {
                  type: 'mdxJsxAttribute',
                  name: 'className',
                  value: className,
                },
              ]
            : []),
        ],
        children: [],
      };
    });

    visit(tree, 'html', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (typeof node.value !== 'string') return;
      if (!node.value.includes('flourish-embed')) return;

      const dataSrcMatch = node.value.match(/data-src\s*=\s*"([^"]+)"/);
      if (!dataSrcMatch) return;

      const classMatch = node.value.match(/class\s*=\s*"([^"]*flourish-[^"]*)"/);
      const className = classMatch?.[1] || 'flourish-embed';

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'FlourishEmbed',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'dataSrc',
            value: dataSrcMatch[1],
          },
          {
            type: 'mdxJsxAttribute',
            name: 'className',
            value: className,
          },
        ],
        children: [],
      };
    });
  };
}
