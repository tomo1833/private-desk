import { NextRequest, NextResponse } from 'next/server';
import { getAppSessionToken, isAppSessionValid } from '@/lib/appAuth';

const PUBLIC_PATHS = new Set([
  '/login',
  '/setup',
  '/api/app-auth/session',
  '/api/app-auth/login',
  '/api/app-auth/setup',
  '/favicon.ico',
  '/search.svg',
]);

function secureHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/_next/') ||
    PUBLIC_PATHS.has(pathname)
  ) {
    return secureHeaders(NextResponse.next());
  }

  let authenticated = false;
  try {
    authenticated = await isAppSessionValid(getAppSessionToken(request));
  } catch (error) {
    console.error('Failed to validate application session:', error);
    if (pathname.startsWith('/api/')) {
      return secureHeaders(
        NextResponse.json({ error: 'Application authentication is unavailable.' }, { status: 503 })
      );
    }
    return secureHeaders(
      new NextResponse('Application authentication is unavailable.', { status: 503 })
    );
  }

  if (authenticated) return secureHeaders(NextResponse.next());

  if (pathname.startsWith('/api/')) {
    return secureHeaders(
      NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    );
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
  return secureHeaders(NextResponse.redirect(loginUrl));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
