import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add Link headers for AI agent discovery (RFC 8288)
  // Using IANA-registered relation types where available
  response.headers.set(
    'Link',
    [
      '</llms.txt>; rel="alternate"; type="text/plain"; title="LLM Context"',
      '</sitemap.xml>; rel="sitemap"; type="application/xml"',
      '</robots.txt>; rel="alternate"; type="text/plain"; title="Robots"',
    ].join(', ')
  );

  return response;
}

export const config = {
  matcher: '/:path*',
};
