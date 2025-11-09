import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes that don't require authentication
const publicRoutes = ['/login', '/admin/login', '/auth-test'];

// Routes that only admins can access (must start with /admin)
const adminOnlyPaths = ['/admin'];

interface JWTPayload {
  id: string;
  isSysAdmin?: boolean;
  companyId?: string;
  isCompanyAdmin?: boolean;
  isCompanyManager?: boolean;
}

async function verifyAuth(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET || 'your_jwt_secret_key');
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth_token')?.value;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // If user is already logged in and tries to access login page, redirect appropriately
    if (authToken) {
      const payload = await verifyAuth(authToken);
      if (payload) {
        if (pathname === '/admin/login' && payload.isSysAdmin) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        if (pathname === '/login' && !payload.isSysAdmin) {
          return NextResponse.redirect(new URL('/home', request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!authToken) {
    // Redirect to appropriate login page based on route
    const loginUrl = pathname.startsWith('/admin')
      ? new URL('/admin/login', request.url)
      : new URL('/login', request.url);

    // Save the original URL to redirect back after login
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the token and check permissions
  const payload = await verifyAuth(authToken);

  if (!payload) {
    // Invalid token, redirect to login
    const loginUrl = pathname.startsWith('/admin')
      ? new URL('/admin/login', request.url)
      : new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check if trying to access admin-only routes
  const isAdminRoute = adminOnlyPaths.some((route) => pathname.startsWith(route));

  if (isAdminRoute && !payload.isSysAdmin) {
    // Non-admin trying to access admin route, redirect to home
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // User is authenticated and has proper permissions
  return NextResponse.next();
}

// Configure which routes should trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)',
  ],
};
