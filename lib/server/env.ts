/**
 * Server-only environment helpers.
 * Prefer non-NEXT_PUBLIC_ vars so backend URLs stay off the client bundle.
 */

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function getBackendBaseUrl() {
  const value =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:3001";

  return trimTrailingSlash(value);
}

/**
 * Origins allowed for cookie-auth mutations (CSRF defense).
 * Always also allow the request URL's own origin at call sites.
 */
export function getAllowedOrigins(): string[] {
  const configured = [
    process.env.APP_ORIGIN,
    process.env.NEXT_PUBLIC_APP_ORIGIN,
    ...(process.env.ALLOWED_ORIGINS ?? "").split(","),
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .map(trimTrailingSlash);

  const defaults = ["http://localhost:3000", "http://127.0.0.1:3000"];
  return [...new Set([...defaults, ...configured])];
}
