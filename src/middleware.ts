import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth middleware — protects /chat/* routes and /api/chat.
 * Checks for the next-auth session token cookie.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — skip auth check
  const publicPaths = ["/", "/signin", "/signup", "/api/auth", "/api/trpc"];

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for session token (next-auth uses these cookie names)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ??
    request.cookies.get("__Secure-authjs.session-token")?.value ??
    request.cookies.get("next-auth.session-token")?.value ??
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and api/auth
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
