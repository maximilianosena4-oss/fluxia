// Proxy (antes middleware) — Protección de rutas — Next.js 16
// Verifica sesión por cookie antes de renderizar rutas protegidas.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_PATHS = ["/login", "/register"];
// NextAuth v5 session cookie names (database sessions via PrismaAdapter)
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",          // fallback
  "__Secure-next-auth.session-token", // fallback producción
];

function hasSession(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => !!request.cookies.get(name)?.value);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = hasSession(request);

  // Ya autenticado → salir de páginas de auth
  if (authenticated && AUTH_PATHS.some((p) => pathname === p)) {
    return NextResponse.redirect(
      new URL("/dashboard", request.nextUrl.origin)
    );
  }

  // Rutas protegidas → requieren sesión
  if (
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) &&
    !authenticated
  ) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // HTTPS redirect en producción
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") === "http"
  ) {
    return NextResponse.redirect(
      new URL(request.url.replace("http://", "https://"))
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
