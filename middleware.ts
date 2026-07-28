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
    pathname.startsWith("/pods") || pathname.startsWith("/profile");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    const next = `${pathname}${request.nextUrl.search}`;
    if (isSafeInternalPath(next)) {
      loginUrl.searchParams.set("next", next);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/pods", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/pods/:path*", "/profile/:path*", "/login", "/register"],
};
