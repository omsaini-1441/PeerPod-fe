import { getAllowedOrigins } from "@/lib/server/env";

/**
 * Defense-in-depth for cookie-authenticated mutations.
 * SameSite=Lax already blocks most cross-site POSTs; this rejects mismatched Origin.
 *
 * Allows:
 * - the request's own host origin (works for localhost AND LAN IPs)
 * - extras from ALLOWED_ORIGINS / APP_ORIGIN
 */
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    throw new CsrfError("Missing Origin header.");
  }

  const requestOrigin = new URL(request.url).origin;
  const allowed = new Set([requestOrigin, ...getAllowedOrigins()]);

  if (!allowed.has(origin)) {
    throw new CsrfError(
      `Invalid request origin (${origin}). Add it to ALLOWED_ORIGINS if intentional.`,
    );
  }
}

export class CsrfError extends Error {
  status = 403;

  constructor(message: string) {
    super(message);
    this.name = "CsrfError";
  }
}
