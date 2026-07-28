"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiRequest } from "@/lib/api";
import {
  clearStoredAuth,
  loadStoredAuth,
  saveStoredAuth,
  type StoredAuth,
} from "@/lib/auth-storage";
import type { LoginResponse, Profile } from "@/lib/types";

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  username: string;
  password: string;
}

interface AuthContextValue {
  token: string | null;
  authUser: StoredAuth["user"] | null;
  profile: Profile | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<string>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialAuth] = useState<StoredAuth | null>(() => loadStoredAuth());
  const [token, setToken] = useState<string | null>(initialAuth?.token ?? null);
  const [authUser, setAuthUser] = useState<StoredAuth["user"] | null>(
    initialAuth?.user ?? null,
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(Boolean(initialAuth?.token));

  const refreshProfileInternal = useCallback(async (currentToken: string) => {
    try {
      const nextProfile = await apiRequest<Profile>("/users/me", {
        token: currentToken,
      });
      setProfile(nextProfile);
    } catch {
      clearStoredAuth();
      setToken(null);
      setAuthUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      const timeoutId = window.setTimeout(() => {
        void refreshProfileInternal(token);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [token, refreshProfileInternal]);

  const login = useCallback(async (input: LoginInput) => {
    const response = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });

    const stored = {
      token: response.token,
      user: response.user,
    };
    saveStoredAuth(stored);
    setToken(stored.token);
    setAuthUser(stored.user);
    await refreshProfileInternal(stored.token);
  }, [refreshProfileInternal]);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await apiRequest<{ message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });

    return response.message;
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setAuthUser(null);
    setProfile(null);
    setLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return;
    }
    await refreshProfileInternal(token);
  }, [token, refreshProfileInternal]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      authUser,
      profile,
      loading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [token, authUser, profile, loading, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return value;
}
