import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/projects", "/settings", "/profile"];

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Read the persisted Zustand store from the cookie-accessible localStorage
  // Note: middleware runs on Edge — we read from cookies, not localStorage.
  // The auth store writes a cookie mirror in the auth hook (added next milestone).
  // For now we use a simple token cookie set on login.
  const token = request.cookies.get("ph-access-token")?.value;

  const isAuthenticated = Boolean(token);
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  //   Redirect unauthenticated users away from protected routes
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  //   Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated)
    return NextResponse.redirect(new URL("/dashboard", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
