/**
 * Browser-facing env.
 *
 * REST never uses a public backend URL — it goes through `/api/*` (same origin).
 * Socket.IO should also stay same-origin via the Next.js rewrite proxy unless
 * NEXT_PUBLIC_SOCKET_URL is explicitly set.
 */
export function getSocketUrl() {
  const configured = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  // Same-origin proxy: browser talks to this Next app, Next rewrites to backend.
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}
