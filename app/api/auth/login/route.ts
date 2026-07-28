import { NextResponse } from "next/server";
import { BackendError, backendJson } from "@/lib/server/backend";
import { assertSameOrigin, CsrfError } from "@/lib/server/csrf";
import { setSessionToken } from "@/lib/server/session";
import type { LoginResponse } from "@/lib/types";

interface LoginBody {
  username?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const body = (await request.json()) as LoginBody;
    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required." },
        { status: 400 },
      );
    }

    const response = await backendJson<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    await setSessionToken(response.token);

    return NextResponse.json({
      user: response.user,
    });
  } catch (error) {
    if (error instanceof CsrfError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    if (error instanceof BackendError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: "Unable to sign in right now." },
      { status: 500 },
    );
  }
}
