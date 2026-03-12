import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'auth_token';
const ROLE_COOKIE = 'auth_role';

const protectedRoutes = ['/profile', '/create-post', '/admin'];
const authRoutes = ['/login', '/register'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/profile/:path*', '/create-post/:path*', '/admin/:path*'],
};
