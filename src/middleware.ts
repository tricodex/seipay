import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on the server before the page is rendered
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require wallet connection
  const protectedRoutes = ['/dashboard'];
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Note: We can't check wallet connection on the server side
    // as it's a client-side state. This middleware just adds security headers
    // The actual authentication check happens on the client side
    
    const response = NextResponse.next();
    
    // Add security headers for protected routes
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.walletconnect.com wss://*.walletconnect.com https://rpc.sei-apis.com;"
    );
    
    return response;
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};