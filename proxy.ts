import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { fetchOptionsData } from './utils/utility';
import { RedirectionLink } from './types/global';
 
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { redirectionData } = await fetchOptionsData();
  const data = redirectionData?.redirection_links || [];

  const clean = (path: string) => path.replace(/^\/+|\/+$/g, "");
  const match = data.find((r:RedirectionLink) => clean(r.old_url) === clean(pathname));

  if (match) {
    return NextResponse.redirect(new URL(match.new_url, request.url), 308);
  }
}
 
// Only run middleware on page routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}