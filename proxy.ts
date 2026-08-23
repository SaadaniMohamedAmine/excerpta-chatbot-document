// proxy.ts
//
// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`
// (function `middleware` -> `proxy`); functionality is unchanged. See
// https://nextjs.org/docs/app/api-reference/file-conventions/proxy
//
// Protects everything under `(app)` (/documents/*, /collections/*,
// /settings/*), redirecting unauthenticated users to /sign-in; also
// redirects already-authenticated users away from /sign-in / /sign-up.
//
// getSessionCookie only checks that a session cookie is *present* (cheap,
// no DB round trip) — it does not validate the session is still valid
// server-side. That's the correct, documented pattern here: treat it as an
// optimistic redirect, and do the authoritative check
// (auth.api.getSession(...)) in server components/route handlers that
// actually need the verified user.
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_ROUTES = ["/sign-in", "/sign-up"];
const DEFAULT_APP_ROUTE = "/documents";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!sessionCookie && !isAuthRoute) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL(DEFAULT_APP_ROUTE, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/documents/:path*",
    "/collections/:path*",
    "/settings/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
