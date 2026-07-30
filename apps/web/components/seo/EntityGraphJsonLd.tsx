import { authors, publisher, serializeJsonLd } from '@/lib/schema';

export function EntityGraphJsonLd() {
  const entityGraph = {
    '@context': 'https://schema.org',
    '@graph': [authors.katerina, authors.michal, publisher],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(entityGraph) }}
    />
  );
}
