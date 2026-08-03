"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Gate protected screens. Redirects guests to /login?next=… after auth resolves.
 * Callers must not render authenticated-only UI until `ready` is true.
 */
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth.loading || auth.isAuthenticated) {
      return;
    }

    const next = pathname && pathname !== "/login" ? pathname : "/pods";
    const params = new URLSearchParams({ next });
    router.replace(`/login?${params.toString()}`);
  }, [auth.loading, auth.isAuthenticated, pathname, router]);

  return {
    ...auth,
    /** True only when session resolved and the user is signed in. */
    ready: !auth.loading && auth.isAuthenticated,
  };
}
