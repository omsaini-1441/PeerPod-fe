import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

function isSafeInternalPath(value: string | null) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  const isProtected =
    pathname === "/pods" ||
    pathname.startsWith("/pods/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/");

  // Cookie presence is a soft gate only. Validity is checked client-side via
  // /api/auth/session. Do NOT bounce /login|/register back to /pods on cookie
  // alone — a stale cookie causes an infinite pods↔login loop and stuck UIs.
  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    const next = `${pathname}${request.nextUrl.search}`;
    if (isSafeInternalPath(next)) {
      loginUrl.searchParams.set("next", next);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/pods", "/pods/:path*", "/profile", "/profile/:path*", "/login", "/register"],
};
