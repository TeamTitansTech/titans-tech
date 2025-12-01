/** FILE COPIED FROM VERCEL EXAMPLE: https://github.com/vercel/platforms */

import { type NextRequest, NextResponse } from 'next/server';
import { rootDomain } from './lib/utils';
import { getCookie, setCookie } from './lib/cookies';

const PUBLIC_PATHS = ['/admin', '/', '/_next', '/api', '/favicon.ico', '/globals.css'];
const ADMIN_PUBLIC_PATHS = ['/admin'];
const ADMIN_LOGIN_PATH = '/admin';
const ADMIN_ALREADY_LOGGED_PATH = '/admin/dashboard';
const CLIENT_ALREADY_LOGGED_PATH = '/dashboard';

const CLIENT_PUBLIC_PATHS = ['/'];
const CLIENT_LOGIN_PATH = '/';

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(':')[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

function isPublicPath(pathname: string, isAdmin: boolean): boolean {
  const arr = isAdmin ? ADMIN_PUBLIC_PATHS : CLIENT_PUBLIC_PATHS;
  return [...PUBLIC_PATHS, ...arr].some((path) => pathname === path);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);
  const publicPath = isPublicPath(pathname, !subdomain);

  console.log('[Middleware]', {
    pathname,
    subdomain,
    host: request.headers.get('host'),
    url: request.url,
  });

  const authToken = await getCookie('auth_token');
  const isLoggedIn = Boolean(authToken);
  await setCookie('is_sys_panel', String(!subdomain));
  const isInLoginPath = subdomain ? pathname === CLIENT_LOGIN_PATH : pathname === ADMIN_LOGIN_PATH;

  if (isLoggedIn && isInLoginPath) {
    const redirectPath = subdomain ? CLIENT_ALREADY_LOGGED_PATH : ADMIN_ALREADY_LOGGED_PATH;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (!publicPath && !isLoggedIn) {
    const redirectPath = subdomain ? CLIENT_LOGIN_PATH : ADMIN_LOGIN_PATH;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (subdomain) {
    if (isLoggedIn && pathname === '/') {
      return NextResponse.redirect(new URL('/home', request.url));
    }

    // Block access to admin page from subdomains
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.rewrite(new URL(`/s/${subdomain}${pathname}`, request.url));
  }

  // On the root domain, allow normal access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|[\\w-]+\\.\\w+).*)',
  ],
};
