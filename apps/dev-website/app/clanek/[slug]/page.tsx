// app/clanek/[slug]/page.tsx
import { Article } from '@/types/article';
import { getArticleBySlug } from '@/lib/articles';
import { ArticleRenderer } from '@/components/clanek/ArticleRenderer';
import { TagList } from '@/components/common/TagList';
import { notFound } from 'next/navigation';
import fs from 'fs'
import path from 'path'
import { Metadata } from 'next'

interface PageProps {
  params: {
    slug: string;
  };
}

// Add metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const article: Article = await getArticleBySlug(params.slug);
    
    // Construct the absolute URL for the cover image
    // Assuming coverImage is relative to public directory
    const imageUrl = article.coverImage ? new URL(article.coverImage, process.env.NEXT_PUBLIC_BASE_URL).toString() : '';
    
    return {
      title: article.title,
      description: article.excerpt,
      authors: [{ name: article.author }],
      openGraph: {
        title: article.title,
        description: article.excerpt,
        type: 'article',
        publishedTime: article.date,
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
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }
}

export async function generateStaticParams() {
  // Get the absolute path to the articles directory
  const articlesDirectory = path.join(process.cwd(), 'app/clanek/_articles')
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
        <ArticleRenderer {...article} />
        <TagList tags={article.tags} />
      </div>
    );
  } catch (error) {
    console.error('Error in ArticlePage:', error);
    notFound();
  }
}