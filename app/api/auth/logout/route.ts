import { NextResponse } from "next/server";
import { assertSameOrigin, CsrfError } from "@/lib/server/csrf";
import { clearSessionToken } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await clearSessionToken();
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof CsrfError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    await clearSessionToken();
    return NextResponse.json({ ok: true });
  }
}
