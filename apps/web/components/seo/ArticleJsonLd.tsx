import Script from 'next/script';

interface ArticleJsonLdProps {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  imageUrl: string;
  articleUrl: string;
  tags?: string[];
}

export function ArticleJsonLd({
  title,
  description,
  author,
  datePublished,
  dateModified,
  imageUrl,
  articleUrl,
  tags = [],
}: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: imageUrl,
    datePublished: new Date(datePublished).toISOString(),
    dateModified: dateModified 
      ? new Date(dateModified).toISOString() 
      : new Date(datePublished).toISOString(),
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mahdalová & Škop',
      url: 'https://www.mahdalova-skop.cz',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    keywords: tags.join(', '),
  };

  return (
    <Script
      id="article-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
