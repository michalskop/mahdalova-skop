// app/clanek/[slug]/page.tsx
import { Metadata } from 'next'
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
import { resolveArticleOgImage } from '@/lib/coverMetadata';
import { getAuthorKeys } from '@/lib/schema';


interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const article = await getArticleBySlug(params.slug)
    
    // Construct the full URL for the article (replace with your actual domain)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz'
    const articleUrl = `${baseUrl}/clanek/${params.slug}`

    const image = resolveArticleOgImage(article.ogImage || article.coverImage, params.slug, baseUrl);

    return {
      title: article.title,
      description: article.excerpt,
      authors: [{ name: article.author }],
      alternates: { canonical: articleUrl },
      openGraph: {
        title: article.title,
        description: article.excerpt,
        type: 'article',
        url: articleUrl,
        publishedTime: new Date(article.date).toISOString(),
        authors: [article.author],
        images: [
          {
            ...image,
            alt: article.title,
          },
        ],
        tags: article.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt,
        images: [{ ...image, alt: article.title }],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    }
  }
}



// Slugs moved to /specialy – excluded from /clanek/ route
const EXCLUDED_SLUGS = [
  'data-pro-budouci-premierku-02-demografie',
  'data-pro-budouci-premierku-02-demografie-plodnost',
];

export async function generateStaticParams() {
  const articlesDirectory = path.join(process.cwd(), 'app/clanek/_articles');
  try {
    const articles = fs.readdirSync(articlesDirectory, { withFileTypes: true });
    const slugs = articles
      .filter(dirent => dirent.isDirectory() && !EXCLUDED_SLUGS.includes(dirent.name))
      .map(dirent => ({ slug: dirent.name }));
    return slugs;
  } catch (error) {
    console.error(`Failed to generate static params from ${articlesDirectory}:`, error);
    return [];
  }
}

export default async function ArticlePage({ params }: PageProps) {
  try {
    const article = await getArticleBySlug(params.slug);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
    const articleUrl = `${baseUrl}/clanek/${params.slug}`;
    
    const imageUrl = resolveArticleOgImage(article.ogImage || article.coverImage, params.slug, baseUrl).url;

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
          authorKeys={getAuthorKeys(article.author)}
        />
        <div data-pagefind-body>
          <ArticleRenderer {...article} slug={params.slug} shareUrl={articleUrl} />
        </div>
        <Box my="lg">
          <TagList tags={article.tags} />
        </Box>
        <Container
          size="md"
          maw="800px"
          w="100%"
          px={0}
          my="lg"
        >
          <FollowBar />
        </Container>
        <Container 
              size="md" 
              // py="xl"
              bg="background.2"
              maw="800px"
              w="100%"
              p={0}
              m="0 auto"
            >
          <ArticleRating />
        </Container>
        <Container 
              size="md" 
              // py="xl"
              bg="background.2"
              maw="800px"
              w="100%"
              p={0}
              m="0 auto"
            >
          <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088' position='center' />
        </Container>
      </div>
    );
  } catch (error) {
    console.error('Error in ArticlePage:', error);
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    notFound();
  }
}
