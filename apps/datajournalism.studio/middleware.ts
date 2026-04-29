import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add Link headers for AI agent discovery
  response.headers.set(
    'Link',
    [
      '</llms.txt>; rel="llms-txt"',
      '</sitemap.xml>; rel="sitemap"',
      '</robots.txt>; rel="robots"',
    ].join(', ')
  );

  return response;
}

export const config = {
  matcher: '/:path*',
};
