import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/posts', '/users', '/settings', '/authors', '/categories'];

// Auth routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Get auth cookie (if using cookie-based auth)
  const authCookie = request.cookies.get('accessToken') || request.cookies.get('refreshToken');
  
  // If using Bearer token mode, we can't check tokens in middleware
  // The client-side protection will handle this case
  const USE_BEARER = process.env.NEXT_PUBLIC_USE_BEARER === 'true';
  
  if (USE_BEARER) {
    // For Bearer mode, let client-side protection handle authentication
    // Only redirect auth routes if we have a valid session cookie
    if (isAuthRoute && authCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Cookie-based auth protection
  if (isProtectedRoute && !authCookie) {
    // Redirect to login if trying to access protected route without auth
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && authCookie) {
    // Redirect to dashboard if trying to access auth routes while authenticated
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
