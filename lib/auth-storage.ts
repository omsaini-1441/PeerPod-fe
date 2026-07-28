import type { AuthUser } from "./types";

export const AUTH_STORAGE_KEY = "peerpod-auth";

export interface StoredAuth {
  token: string;
  user: AuthUser;
}

export function loadStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveStoredAuth(value: StoredAuth) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
}

export function clearStoredAuth() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
