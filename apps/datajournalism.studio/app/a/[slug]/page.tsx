// app/a/[slug]/page.tsx
import { Metadata } from 'next'
import { getArticleBySlug } from '@/lib/articles';
import { ArticleRenderer } from '@/components/a/ArticleRenderer';
import { TagList } from '@/components/common/TagList';
import { notFound } from 'next/navigation';
import { Box, Container } from '@mantine/core';
import fs from 'fs'
import path from 'path'
// import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';


interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const article = await getArticleBySlug(params.slug)
    
    // Construct the full URL for the article (replace with your actual domain)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.datajournalism.studio'
    const articleUrl = `${baseUrl}/a/${params.slug}`

    const isAbsoluteUrl = (value: unknown): value is string => {
      if (typeof value !== 'string') return false;
      return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//');
    };
    
    // Construct the full image URL
    const imageUrl = article.coverImage 
      ? (isAbsoluteUrl(article.coverImage)
          ? article.coverImage
          : `${baseUrl}/a/_articles/${params.slug}/${article.coverImage}`)
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
  // Get the absolute path to the articles directory
  const articlesDirectory = path.join(process.cwd(), 'app/a/_articles')
  // Read the directory
  const articles = fs.readdirSync(articlesDirectory, { withFileTypes: true })
  // Filter for directories only and map to slug format
  const slugs = articles
    .filter(dirent => dirent.isDirectory())
    .map(dirent => ({
      slug: dirent.name,
    }))
  return slugs
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
          {/* <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'/> */}
        </Container>
      </div>
    );
  } catch (error) {
    console.error('Error in ArticlePage:', error);
    notFound();
  }
}
