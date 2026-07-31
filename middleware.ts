import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Routes that don't require authentication
const publicPaths = [
  '/auth/signin',
  '/auth/callback',
  '/api/auth/session',
  '/api/health',
];

// Static file paths (extension-based)
const staticExtensions = /\.(ico|png|jpg|jpeg|gif|svg|webp|avif|woff2?|ttf|eot|css|js|map|json|xml|txt)$/;

export async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Allow public paths
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Allow static files
  if (staticExtensions.test(pathname)) {
    return NextResponse.next();
  }

  // Allow API routes that don't need auth (health check)
  if (pathname.startsWith('/api/health')) {
    return NextResponse.next();
  }

  // Protect all other routes — require auth (skip if Supabase not configured)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Attach user to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-user-email', user.email ?? '');

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    // Match all request paths except static assets and _next internal
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
