// app/special/[slug]/page.tsx
// Renders articles from the clanek/_articles directory under the /special/ URL prefix.
import { Metadata } from 'next';
import { getArticleBySlug } from '@/lib/articles';
import fs from 'fs';
import path from 'path';
import { ArticleRenderer } from '@/components/clanek/ArticleRenderer';
import { TagList } from '@/components/common/TagList';
import { FollowBar } from '@/components/common/FollowBar';
import { notFound } from 'next/navigation';
import { Box, Container } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import ArticleRating from '@/components/common/ArticleRating';
import { ArticleJsonLd } from '@/components/seo/ArticleJsonLd';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const article = await getArticleBySlug(params.slug);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
    const articleUrl = `${baseUrl}/special/${params.slug}`;

    const isAbsoluteUrl = (v: unknown): v is string =>
      typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('//'));

    const imageUrl = article.coverImage
      ? (isAbsoluteUrl(article.coverImage)
          ? article.coverImage
          : `${baseUrl}/clanek/_articles/${params.slug}/${article.coverImage}`)
      : `${baseUrl}/default-og-image.jpg`;

    return {
      title: article.title,
      description: article.excerpt,
      authors: [{ name: article.author }],
      alternates: { canonical: `/special/${params.slug}` },
      openGraph: {
        title: article.title,
        description: article.excerpt,
        type: 'article',
        url: articleUrl,
        publishedTime: new Date(article.date).toISOString(),
        authors: [article.author],
        images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }],
        tags: article.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt,
        images: [imageUrl],
      },
    };
  } catch {
    return { title: 'Článek nenalezen' };
  }
}

export async function generateStaticParams() {
  const articlesDirectory = path.join(process.cwd(), 'app/clanek/_articles');
  try {
    const articles = fs.readdirSync(articlesDirectory, { withFileTypes: true });
    return articles
      .filter(d => d.isDirectory())
      .map(d => ({ slug: d.name }));
  } catch {
    return [];
  }
}

export default async function SpecialArticlePage({ params }: PageProps) {
  try {
    const article = await getArticleBySlug(params.slug);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
    const articleUrl = `${baseUrl}/special/${params.slug}`;

    const isAbsoluteUrl = (v: unknown): v is string =>
      typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('//'));

    const imageUrl = article.coverImage
      ? (isAbsoluteUrl(article.coverImage)
          ? article.coverImage
          : `${baseUrl}/clanek/_articles/${params.slug}/${article.coverImage}`)
      : `${baseUrl}/default-og-image.jpg`;

    return (
      <div>
        <ArticleJsonLd
          title={article.title}
          description={article.excerpt}
          author={article.author}
          datePublished={article.date}
          dateModified={article.date}
          imageUrl={imageUrl}
          articleUrl={articleUrl}
          tags={article.tags}
        />
        <div data-pagefind-body>
          <ArticleRenderer {...article} slug={params.slug} />
        </div>
        <Box my="lg">
          <TagList tags={article.tags} />
        </Box>
        <Container size="md" maw="928px" w="100%" px={0} my="lg">
          <FollowBar />
        </Container>
        <Container size="md" bg="background.2" maw="928px" w="100%" p={0} m="0 auto">
          <ArticleRating />
        </Container>
        <Container size="md" bg="background.2" maw="928px" w="100%" p={0} m="0 auto">
          <SubscribeNewsletter
            actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088"
            position="center"
          />
        </Container>
      </div>
    );
  } catch (error) {
    console.error('Error in SpecialArticlePage:', error);
    notFound();
  }
}
