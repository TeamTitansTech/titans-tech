import { proxy } from './proxy';

export const middleware = proxy;

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
