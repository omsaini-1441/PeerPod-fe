import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";

export function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function setSessionToken(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

export async function clearSessionToken() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
}

/** Prefer this in Route Handlers so Set-Cookie is definitely on the response. */
export function clearSessionCookieOnResponse(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}

export async function getSessionToken() {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE_NAME)?.value ?? null;
}
