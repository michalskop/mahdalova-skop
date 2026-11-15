// Kapitola speciálu „Jací jsme byli, jací jsme – 1989 × 2026“.
// Obsah je běžný článek v app/clanek/_articles/<zdroj> (viz kapitoly.json), tady má kanonickou adresu.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Box, Container } from '@mantine/core';
import { getArticleBySlug } from '@/lib/articles';
import { ArticleRenderer } from '@/components/clanek/ArticleRenderer';
import { TagList } from '@/components/common/TagList';
import { FollowBar } from '@/components/common/FollowBar';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import ArticleRating from '@/components/common/ArticleRating';
import { ArticleJsonLd } from '@/components/seo/ArticleJsonLd';
import { resolveArticleOgImage } from '@/lib/coverMetadata';
import { getAuthorKeys } from '@/lib/schema';
import { JACI_JSME, JACI_JSME_PATH, hotoveKapitoly } from '@/lib/jaciJsme';
import { KapitolyNav } from '../KapitolyNav';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';

type Props = { params: { kapitola: string } };

function najdi(kapitola: string) {
  return hotoveKapitoly().find((k) => k.kapitola === kapitola);
}

export function generateStaticParams() {
  return hotoveKapitoly().map((k) => ({ kapitola: k.kapitola }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const k = najdi(params.kapitola);
  if (!k) return { title: JACI_JSME.nazev };
  const a = await getArticleBySlug(k.zdroj);
  const url = `${BASE_URL}${JACI_JSME_PATH}/${k.kapitola}`;
  const image = resolveArticleOgImage(a.ogImage || a.coverImage, k.zdroj, BASE_URL);
  return {
    title: a.title,
    description: a.excerpt,
    authors: [{ name: a.author }],
    alternates: { canonical: url },
    openGraph: {
      title: a.title, description: a.excerpt, type: 'article', url,
      publishedTime: new Date(a.date).toISOString(), authors: [a.author],
      images: [{ ...image, alt: a.title }], tags: a.tags,
    },
    twitter: { card: 'summary_large_image', title: a.title, description: a.excerpt, images: [{ ...image, alt: a.title }] },
  };
}

export default async function KapitolaPage({ params }: Props) {
  const k = najdi(params.kapitola);
  if (!k) notFound();
  const a = await getArticleBySlug(k.zdroj);
  const url = `${BASE_URL}${JACI_JSME_PATH}/${k.kapitola}`;
  const imageUrl = resolveArticleOgImage(a.ogImage || a.coverImage, k.zdroj, BASE_URL).url;
  const kapitoly = hotoveKapitoly();

  return (
    <div>
      <ArticleJsonLd
        title={a.title} description={a.excerpt} author={a.author}
        datePublished={a.date} dateModified={a.date} imageUrl={imageUrl}
        articleUrl={url} tags={a.tags} authorKeys={getAuthorKeys(a.author)}
      />
      <KapitolyNav kapitoly={kapitoly} aktivni={k.kapitola} />
      <div data-pagefind-body>
        <ArticleRenderer {...a} slug={k.zdroj} shareUrl={url} />
      </div>
      <KapitolyNav kapitoly={kapitoly} aktivni={k.kapitola} dole />
      <Box my="lg"><TagList tags={a.tags} /></Box>
      <Container size="md" maw="800px" w="100%" px={0} my="lg"><FollowBar /></Container>
      <Container size="md" bg="background.2" maw="800px" w="100%" p={0} m="0 auto"><ArticleRating /></Container>
      <Container size="md" bg="background.2" maw="800px" w="100%" p={0} m="0 auto">
        <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" position="center" />
      </Container>
    </div>
  );
}
