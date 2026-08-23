// lib/remark-gallery-plugin.js
// Turns a ```fotogalerie fence into a <PhotoGallery images={[...]} /> MDX element.
//
// Fence content = one image per line:
//   - soubor.jpg | Popisek fotky | Zdroj/autor
// Only the filename is required; caption and credit are optional.
// The article renderer resolves each bare filename to the article's images path.
import { visit } from 'unist-util-visit';

function parseLines(value) {
  const images = [];
  const lines = (value || '').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim().replace(/^[-*]\s+/, '').trim();
    if (!line) continue;
    const parts = line.split('|').map((p) => p.trim());
    const src = parts[0];
    if (!src) continue;
    const image = { src };
    if (parts[1]) image.caption = parts[1];
    if (parts[2]) image.credit = parts[2];
    images.push(image);
  }
  return images;
}

function makeAttr(name, value) {
  return { type: 'mdxJsxAttribute', name, value };
}

export function remarkGalleryPlugin() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'fotogalerie' && node.lang !== 'gallery') return;

      const images = parseLines(node.value);
      if (images.length === 0) return;

      const attributes = [makeAttr('images', JSON.stringify(images))];

      // optional preview count from meta, e.g. ```fotogalerie 8
      const meta = (node.meta || '').trim();
      const m = /(\d+)/.exec(meta);
      if (m) attributes.push(makeAttr('previewCount', m[1]));

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'PhotoGallery',
        attributes,
        children: [],
      };
    });
  };
}
