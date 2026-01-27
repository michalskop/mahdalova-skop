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

    container.innerHTML = html;

    const scriptTags = Array.from(container.querySelectorAll('script'));
    for (const oldScript of scriptTags) {
      const newScript = document.createElement('script');

      for (const { name, value } of Array.from(oldScript.attributes)) {
        newScript.setAttribute(name, value);
      }

      newScript.text = oldScript.text;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    }
  }, [html, assetBasePath]);

  return <div ref={containerRef} className={className} />;
}
