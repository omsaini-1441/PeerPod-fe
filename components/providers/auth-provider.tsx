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
import { ApiError, apiRequest, authRequest } from "@/lib/api";
import { clearLegacyAuthStorage } from "@/lib/auth-storage";
import type { AuthUser, Profile } from "@/lib/types";

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  username: string;
  password: string;
}

interface SessionResponse {
  authenticated: boolean;
  user?: AuthUser;
  profile?: Profile;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  authUser: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<string>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getSocketToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const applyLoggedOut = useCallback(() => {
    setAuthUser(null);
    setProfile(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const session = await authRequest<SessionResponse>("/api/auth/session", {
        method: "GET",
      });

      if (!session.authenticated || !session.user) {
        applyLoggedOut();
        return;
      }

      setAuthUser(session.user);
      setProfile(session.profile ?? null);
    } catch {
      applyLoggedOut();
    } finally {
      setLoading(false);
    }
  }, [applyLoggedOut]);

  useEffect(() => {
    clearLegacyAuthStorage();
    const timeoutId = window.setTimeout(() => {
      void refreshSession();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshSession]);

  useEffect(() => {
    function onUnauthorized() {
      applyLoggedOut();
      if (window.location.pathname.startsWith("/pods") || window.location.pathname.startsWith("/profile")) {
        window.location.assign("/login");
      }
    }

    window.addEventListener("peerpod:unauthorized", onUnauthorized);
    return () => window.removeEventListener("peerpod:unauthorized", onUnauthorized);
  }, [applyLoggedOut]);

  const login = useCallback(async (input: LoginInput) => {
    const response = await authRequest<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });

    setAuthUser(response.user);
    setLoading(true);
    try {
      const profile = await apiRequest<Profile>("/users/me");
      setProfile(profile);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        applyLoggedOut();
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [applyLoggedOut]);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await authRequest<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });

    return response.message;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authRequest("/api/auth/logout", { method: "POST" });
    } finally {
      clearLegacyAuthStorage();
      applyLoggedOut();
      setLoading(false);
    }
  }, [applyLoggedOut]);

  const refreshProfile = useCallback(async () => {
    if (!authUser) {
      return;
    }

    try {
      const nextProfile = await apiRequest<Profile>("/users/me");
      setProfile(nextProfile);
      setAuthUser({
        id: nextProfile.id,
        username: nextProfile.username,
        userrole: nextProfile.role,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        applyLoggedOut();
      }
      throw error;
    }
  }, [authUser, applyLoggedOut]);

  const getSocketToken = useCallback(async () => {
    const response = await authRequest<{ token: string }>("/api/auth/socket-token", {
      method: "GET",
    });
    return response.token;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(authUser),
      authUser,
      profile,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      getSocketToken,
    }),
    [
      authUser,
      profile,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      getSocketToken,
    ],
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
