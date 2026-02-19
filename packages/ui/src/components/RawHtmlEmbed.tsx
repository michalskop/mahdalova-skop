'use client';

import { useEffect, useRef } from 'react';

type RawHtmlEmbedProps = {
  html: string;
  assetBasePath?: string;
  className?: string;
};

export default function RawHtmlEmbed({ html, assetBasePath, className }: RawHtmlEmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (assetBasePath) {
      container.setAttribute('data-asset-base', assetBasePath);
    } else {
      container.removeAttribute('data-asset-base');
    }

    container.innerHTML = '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const bodyHtml = doc.body ? doc.body.innerHTML : html;

    container.innerHTML = bodyHtml;

    const scripts = Array.from(container.querySelectorAll('script'));
    for (const oldScript of scripts) {
      const newScript = document.createElement('script');

      for (const attr of Array.from(oldScript.attributes)) {
        newScript.setAttribute(attr.name, attr.value);
      }

      if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent;
      }

      oldScript.parentNode?.replaceChild(newScript, oldScript);
    }
  }, [html, assetBasePath]);

  return <div ref={containerRef} className={className} />;
}
