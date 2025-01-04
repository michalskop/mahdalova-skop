// app/tag/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticles, Article } from '@/components/common/getArticles'
import { Box, Container } from '@mantine/core'
import { TagList } from '@/components/common/TagList'
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter'

interface TagPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  try {
    const articles = await getArticles(undefined, undefined, false, params.slug)
    
    if (articles.length === 0) {
      notFound()
    }

    // Get the most recent article for the image
    const mostRecentArticle = articles.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]

    // Construct the base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz'
    
    // Use the full coverImage path that's already properly formatted by getArticles
    const imageUrl = mostRecentArticle.coverImage
      ? `${baseUrl}${mostRecentArticle.coverImage}`
      : `${baseUrl}/default-og-image.jpg`

    const title = `Články označené tagem "${params.slug}"`
    const description = `Přečtěte si všechny články označené tagem "${params.slug}". Analytické výstupy a komentáře k tématu ${params.slug}.`

    return {
      title,
      description,
      authors: [{ name: 'Mahdalová & Škop' }],
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${baseUrl}/tag/${params.slug}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `${baseUrl}/tag/${params.slug}`,
      }
    }
  } catch (error) {
    console.error('Error generating tag metadata:', error)
    return {
      title: 'Stránka nenalezena',
      description: 'Požadovaná stránka tagu nebyla nalezena.',
    }
  }
}

export async function generateStaticParams() {
  // Get all articles to extract unique tags
  const allArticles = await getArticles()
  const allTags = new Set<string>()
  
  allArticles.forEach(article => {
    article.tags?.forEach(tag => allTags.add(tag))
  })

  return Array.from(allTags).map(tag => ({
    slug: tag
  }))
}

export default async function TagPage({ params }: TagPageProps) {
  try {
    // Pass undefined as limit to get all articles with the tag
    const articles = await getArticles(undefined, undefined, false, params.slug)

    if (articles.length === 0) {
      notFound()
    }

    return (
      <div>
        <h1>Články označené tagem "{params.slug}"</h1>
        <div>
          {articles.map((article) => (
            <Box key={article.slug} mb="xl">
              <h2>{article.title}</h2>
              <div>
                <time>{article.date}</time>
                <span> • </span>
                <span>{article.author}</span>
              </div>
              {article.coverImage && (
                <img src={article.coverImage} alt={article.title} />
              )}
              <p>{article.excerpt}</p>
              <Box my="lg">
                <TagList tags={article.tags} />
              </Box>
            </Box>
          ))}
        </div>
        <Container
          size="md"
          bg="background.2"
          maw="928px"
          w="100%"
          p={0}
          m="0 auto"
        >
          <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'/>
        </Container>
      </div>
    )
  } catch (error) {
    console.error('Error in TagPage:', error)
    notFound()
  }
}