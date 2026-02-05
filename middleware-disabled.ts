// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Next middleware requires returning response cookies, but
          // pour ce cas simple on n'a pas besoin d'écrire ici.
        },
        remove() {
          // idem
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const url = req.nextUrl;
  const pathname = url.pathname;

  const isAuthPage =
    pathname.startsWith('/login') || pathname.startsWith('/onboarding');

  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/salesroom') ||
    pathname.startsWith('/encan');

  // Si pas loggé et route protégée -> login
  if (!user && isProtected) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname + url.search);
    return NextResponse.redirect(redirectUrl);
  }

  // Si loggé et sur /login -> rediriger vers /salesroom
  if (user && pathname === '/login') {
    const redirectUrl = new URL('/salesroom', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/salesroom/:path*', '/encan/:path*', '/login', '/onboarding'],
};
