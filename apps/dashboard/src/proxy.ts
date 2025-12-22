/**
 * Next.js 16 Proxy - Subdomain routing for multi-tenant architecture
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */

import { type NextRequest, NextResponse } from 'next/server';
import { rootDomain } from './lib/utils';
import { getCookie, setCookie } from './lib/cookies';

const PUBLIC_PATHS = ['/_next', '/api', '/favicon.ico', '/globals.css'];
const ADMIN_PUBLIC_PATHS = ['/admin'];
const ADMIN_LOGIN_PATH = '/admin';
const ADMIN_ALREADY_LOGGED_PATH = '/admin/dashboard';
const CLIENT_ALREADY_LOGGED_PATH = '/home';
const PUBLIC_PATHS_NESTED_ROUTE: string[] = [
  '/forgot-password',
  '/reset-password',
  '/set-password',
  '/admin/forgot-password',
  '/admin/reset-password',
  '/admin/set-password',
];

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

  // Check exact matches for public paths
  if ([...PUBLIC_PATHS, ...arr].some((path) => pathname === path)) {
    return true;
  }

  // Check nested routes (like /qr/...)
  if (PUBLIC_PATHS_NESTED_ROUTE.some((path) => pathname.startsWith(path))) {
    return true;
  }

  // Allow /machines/[id] as public for client (subdomain) only - not nested routes like /machines/[id]/sections/...
  if (!isAdmin) {
    const machineIdMatch = pathname.match(/^\/machines\/([^/]+)$/);
    if (machineIdMatch) {
      return true;
    }
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);
  const publicPath = isPublicPath(pathname, !subdomain);

  console.log('[Proxy]', {
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
    // Check if there's a redirect parameter in the URL
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    if (redirectParam) {
      // Preserve the redirect parameter - the login page will handle the redirect
      return NextResponse.redirect(new URL(redirectParam, request.url));
    }
    const redirectPath = subdomain ? CLIENT_ALREADY_LOGGED_PATH : ADMIN_ALREADY_LOGGED_PATH;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (isLoggedIn) {
    const passwordResetPaths = ['/forgot-password', '/reset-password'];
    const isPasswordResetPage = passwordResetPaths.some((path) => pathname.includes(path));

    if (isPasswordResetPage) {
      if (subdomain) {
        return NextResponse.redirect(new URL('/home', request.url));
      } else {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
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

    // Preserve query parameters in the rewrite
    const rewriteUrl = new URL(`/s/${subdomain}${pathname}`, request.url);
    rewriteUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(rewriteUrl);
  }

  // On the root domain, redirect / to /admin
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/admin', request.url));
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
     * 3. Static files (images, fonts, etc.)
     */
    '/((?!api|_next|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
};
