import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = [
  '/modules',
  '/lessons',
  '/quiz',
  '/jeux',
  '/profile',
  '/settings',
  '/favorites',
  '/lecon-phrases',
  '/revision',
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('lsf_token');
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Exclure les routes _next, API, fichiers statiques
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
