import { normalizeAuthor, splitAuthors } from '@/utils/authorUtils';

export const SITE_URL = 'https://www.mahdalova-skop.cz';

export const authors = {
  katerina: {
    '@type': 'Person',
    '@id': `${SITE_URL}/autor/katerina-mahdalova#person`,
    name: 'Kateřina Mahdalová',
    url: `${SITE_URL}/autor/katerina-mahdalova`,
    jobTitle: 'Datová novinářka',
    sameAs: [
      'https://cs.wikipedia.org/wiki/Kate%C5%99ina_Mahdalov%C3%A1',
      'https://www.wikidata.org/wiki/Q123239503',
      'https://cz.linkedin.com/in/katerina-mahdalova-89050a70',
      'https://x.com/data_zurnalist',
    ],
  },
  michal: {
    '@type': 'Person',
    '@id': `${SITE_URL}/autor/michal-skop#person`,
    name: 'Michal Škop',
    url: `${SITE_URL}/autor/michal-skop`,
    jobTitle: 'Datový vědec a statistik',
    sameAs: [
      'https://www.wikidata.org/wiki/Q101114784',
      'https://cz.linkedin.com/in/skopmichal',
      'https://x.com/skopmichal',
      'https://github.com/michalskop',
      'https://www.skop.eu/',
    ],
  },
} as const;

export type AuthorKey = keyof typeof authors;

const authorKeysBySlug: Record<string, AuthorKey> = {
  'katerina-mahdalova': 'katerina',
  'michal-skop': 'michal',
};

export function getAuthorKeys(author: unknown): AuthorKey[] {
  return Array.from(
    new Set(
      splitAuthors(author)
        .map(normalizeAuthor)
        .map((slug) => authorKeysBySlug[slug])
        .filter((key): key is AuthorKey => Boolean(key))
    )
  );
}

export const publisher = {
  '@type': 'NewsMediaOrganization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Mahdalová & Škop',
  alternateName: 'DataTimes',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/images/og-image.png`,
  },
} as const;

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
