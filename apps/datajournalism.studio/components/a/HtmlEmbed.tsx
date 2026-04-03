'use client';

import RawHtmlEmbed from '@/components/common/RawHtmlEmbed';

type HtmlEmbedProps = {
  file: string;
  slug: string;
  htmlContent?: string;
};

export default function HtmlEmbed({ file, slug, htmlContent }: HtmlEmbedProps) {
  if (!htmlContent) {
    return (
      <div style={{ color: 'red', padding: '1rem', border: '1px solid red' }}>
        HTML file not found: {file}
      </div>
    );
  }

  return <RawHtmlEmbed html={htmlContent} assetBasePath={`/a/_articles/${slug}`} />;
}
