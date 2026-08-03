import { NextResponse } from "next/server";
import { BackendError, backendJson } from "@/lib/server/backend";
import {
  clearSessionCookieOnResponse,
  getSessionToken,
} from "@/lib/server/session";
import type { AuthUser, Profile } from "@/lib/types";

export async function GET() {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ authenticated: false as const });
  }

  try {
    const profile = await backendJson<Profile>("/users/me", { token });

    const user: AuthUser = {
      id: profile.id,
      username: profile.username,
      userrole: profile.role,
    };

    return NextResponse.json({
      authenticated: true as const,
      user,
      profile,
    });
  } catch (error) {
    if (error instanceof BackendError && (error.status === 401 || error.status === 403)) {
      return clearSessionCookieOnResponse(
        NextResponse.json({ authenticated: false as const }),
      );
    }

    return NextResponse.json(
      { message: "Unable to load session." },
      { status: 500 },
    );
  }
}
