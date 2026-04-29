// Cloudflare Pages Function for Markdown for Agents
// Works on free plan (unlike built-in Markdown for Agents feature)

interface Env {
  ASSETS: { fetch: typeof fetch };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;
  
  // Check if request accepts markdown
  const acceptHeader = request.headers.get('accept') || '';
  const wantsMarkdown = acceptHeader.includes('text/markdown');
  
  if (!wantsMarkdown) {
    // Normal request, pass through
    return next();
  }
  
  // Get the HTML response
  const response = await next();
  
  // Only convert HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }
  
  // Get HTML content
  const html = await response.text();
  
  // Convert HTML to Markdown
  const markdown = htmlToMarkdown(html);
  
  // Count tokens (rough estimate: ~4 chars per token)
  const tokenCount = Math.ceil(markdown.length / 4);
  
  // Return markdown response
  return new Response(markdown, {
    status: response.status,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': tokenCount.toString(),
      'cache-control': response.headers.get('cache-control') || 'public, max-age=3600',
    },
  });
};

// Simple HTML to Markdown converter
function htmlToMarkdown(html: string): string {
  let text = html;
  
  // Extract main content (remove nav, footer, scripts, styles)
  const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    text = mainMatch[1];
  } else {
    const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      text = articleMatch[1];
    }
  }
  
  // Remove script and style tags
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Convert headings
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
  text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
  text = text.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n');
  text = text.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n');
  
  // Convert links
  text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Convert images
  text = text.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)');
  text = text.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*>/gi, '![$1]($2)');
  text = text.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, '![]($1)');
  
  // Convert bold and italic
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // Convert lists
  text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '\n- $1');
  });
  text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    let counter = 1;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `\n${counter++}. $1`);
  });
  
  // Convert blockquotes
  text = text.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '\n> $1\n');
  
  // Convert code blocks
  text = text.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
  text = text.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  
  // Convert paragraphs
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');
  
  // Convert line breaks
  text = text.replace(/<br\s*\/?>/gi, '\n');
  
  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();
  
  return text;
}
