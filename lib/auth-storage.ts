import { LEGACY_AUTH_STORAGE_KEY } from "@/lib/auth/constants";

/** Remove pre-BFF tokens so XSS cannot keep reading a naked bearer from storage. */
export function clearLegacyAuthStorage() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    window.sessionStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage access failures (private mode / blocked storage).
  }
}
