// app/clanek/[slug]/page.tsx
import { Metadata } from 'next'
import { getArticleBySlug } from '@/lib/articles';
import fs from 'fs';
import path from 'path';
import { ArticleRenderer } from '@/components/clanek/ArticleRenderer';
import { TagList } from '@/components/common/TagList';
import { notFound } from 'next/navigation';
import { Box, Container } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import ArticleRating from '@/components/common/ArticleRating';


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
    
    // Construct the full image URL
    const imageUrl = article.coverImage 
      ? `${baseUrl}/clanek/_articles/${params.slug}/${article.coverImage}`
      : `${baseUrl}/default-og-image.jpg` // Fallback image

    return {
      title: article.title,
      description: article.excerpt,
      authors: [{ name: article.author }],
      openGraph: {
        title: article.title,
        description: article.excerpt,
        type: 'article',
        url: articleUrl,
        publishedTime: new Date(article.date).toISOString(),
        authors: [article.author],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
        tags: article.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt,
        images: [imageUrl],
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



export async function generateStaticParams() {
  const articlesDirectory = path.join(process.cwd(), 'app/clanek/_articles');
  try {
    const articles = fs.readdirSync(articlesDirectory, { withFileTypes: true });
    const slugs = articles
      .filter(dirent => dirent.isDirectory())
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
    return (
      <div>
        <ArticleRenderer {...article} slug={params.slug} />
        <Box my="lg">
          <TagList tags={article.tags} />
        </Box>
        <Container 
              size="md" 
              // py="xl"
              bg="background.2"
              maw="928px"
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
              maw="928px"
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
    notFound();
  }
}