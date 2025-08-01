import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for custom sub prefix routing
  const customPrefix = process.env.CUSTOM_SUB_PREFIX;
  
  // Handle custom prefix routing
  if (customPrefix) {
    const pathname = request.nextUrl.pathname;
    
    // If accessing root or other paths without the custom prefix, return 404
    if (pathname === '/' || (pathname !== `/${customPrefix}` && !pathname.startsWith(`/${customPrefix}/`) && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/'))) {
      return new NextResponse('Not Found', { status: 404 });
    }
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};