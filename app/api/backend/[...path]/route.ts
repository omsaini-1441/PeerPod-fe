import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend";
import { clearSessionToken, getSessionToken } from "@/lib/server/session";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const BLOCKED_PREFIXES = ["auth/login", "auth/register"];

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const joined = path.join("/");

  if (!joined || BLOCKED_PREFIXES.some((prefix) => joined === prefix || joined.startsWith(`${prefix}/`))) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // Prevent path traversal / absolute URL smuggling
  if (joined.includes("..") || joined.startsWith("http:") || joined.startsWith("https:")) {
    return NextResponse.json({ message: "Invalid path" }, { status: 400 });
  }

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const incomingUrl = new URL(request.url);
  const targetPath = `/${joined}${incomingUrl.search}`;

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;

  const upstream = await backendFetch(targetPath, {
    method: request.method,
    token,
    body,
    headers: {
      Accept: request.headers.get("accept") ?? "application/json",
    },
  });

  if (upstream.status === 401) {
    await clearSessionToken();
  }

  const responseHeaders = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }

  if (upstream.status === 204) {
    return new NextResponse(null, {
      status: 204,
      headers: responseHeaders,
    });
  }

  const payload = await upstream.arrayBuffer();
  return new NextResponse(payload, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
