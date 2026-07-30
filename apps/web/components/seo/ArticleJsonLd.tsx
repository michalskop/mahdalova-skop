import { authors, publisher, serializeJsonLd, type AuthorKey } from '@/lib/schema';

interface ArticleJsonLdProps {
  title: string;
  description: string;
  author: string;
  authorKeys: AuthorKey[];
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
  authorKeys,
  datePublished,
  dateModified,
  imageUrl,
  articleUrl,
  tags = [],
}: ArticleJsonLdProps) {
  const publishedAt = new Date(datePublished).toISOString();
  const modifiedAt = dateModified
    ? new Date(dateModified).toISOString()
    : publishedAt;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    image: [imageUrl],
    datePublished: publishedAt,
    dateModified: modifiedAt,
    author: authorKeys.length
      ? authorKeys.map((key) => authors[key])
      : [{ '@type': 'Person', name: author }],
    publisher,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    keywords: tags.join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  );
}
