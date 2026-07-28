import { NextResponse } from "next/server";
import { BackendError, backendJson } from "@/lib/server/backend";
import { assertSameOrigin, CsrfError } from "@/lib/server/csrf";

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const body = (await request.json()) as RegisterBody;
    const username = body.username?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Username, email, and password are required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Enter a valid email address." },
        { status: 400 },
      );
    }

    const response = await backendJson<{ message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });

    return NextResponse.json(response);
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
      { message: "Unable to create the account right now." },
      { status: 500 },
    );
  }
}
