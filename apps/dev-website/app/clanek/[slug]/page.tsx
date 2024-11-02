// app/clanek/[slug]/page.tsx
import { getArticleBySlug } from '@/lib/articles';
import { ArticleRenderer } from '@/components/clanek/ArticleRenderer';
import { TagList } from '@/components/common/TagList';
import { notFound } from 'next/navigation';
import fs from 'fs'
import path from 'path'

interface PageProps {
  params: {
    slug: string;
  };
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