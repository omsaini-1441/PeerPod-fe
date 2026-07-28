import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/server/session";

/**
 * Short-lived bridge for Socket.IO until the backend accepts cookie auth on WS.
 * The token is never written to localStorage; callers should keep it in memory only.
 */
export async function GET() {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ token });
}
