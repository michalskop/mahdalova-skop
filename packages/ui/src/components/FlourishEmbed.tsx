'use client';

import { useEffect } from 'react';

type FlourishEmbedProps = {
  dataSrc: string;
  className?: string;
};

export function FlourishEmbed({ dataSrc, className }: FlourishEmbedProps) {
  useEffect(() => {
    const existing = document.querySelector(
      'script[data-flourish-embed="true"]'
    ) as HTMLScriptElement | null;

    if (existing) return;

    const script = document.createElement('script');
    script.src = 'https://public.flourish.studio/resources/embed.js';
    script.async = true;
    script.defer = true;
    script.dataset.flourishEmbed = 'true';
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `.flourish-credit{display:none !important;visibility:hidden !important;height:0 !important;overflow:hidden !important;}`,
        }}
      />
      <div className={className || 'flourish-embed'} data-src={dataSrc} />
    </>
  );
}
