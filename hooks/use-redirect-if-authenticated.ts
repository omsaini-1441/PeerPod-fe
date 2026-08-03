"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";

function isSafeInternalPath(value: string | null) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

/**
 * Keep signed-in users off /login and /register.
 */
export function useRedirectIfAuthenticated(defaultNext = "/pods") {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading || !isAuthenticated) {
      return;
    }

    const next = searchParams.get("next");
    router.replace(isSafeInternalPath(next) ? (next as string) : defaultNext);
  }, [loading, isAuthenticated, router, searchParams, defaultNext]);

  return {
    loading,
    isAuthenticated,
    ready: !loading && !isAuthenticated,
  };
}
