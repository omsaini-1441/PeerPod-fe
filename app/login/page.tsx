"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useRedirectIfAuthenticated } from "@/hooks/use-redirect-if-authenticated";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { loading, ready } = useRedirectIfAuthenticated();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login({ username, password });
      const next = searchParams.get("next");
      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/pods";
      router.replace(safeNext);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to sign in right now.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !ready) {
    return (
      <section className="mx-auto max-w-md py-12 text-[var(--muted)]">
        Checking your session...
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-4xl gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:py-12">
      <div className="relative hidden min-h-[22rem] overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[#050505] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(198,243,90,0.1),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(245,215,110,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 space-y-2">
          <p className="pp-display text-2xl font-semibold text-white">
            Re-enter the race
          </p>
          <p className="text-sm text-white/75">
            The board remembers who showed up.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="mb-5 flex items-center gap-3">
            <BrandMark size={40} />
            <div>
              <h1 className="pp-display text-2xl font-semibold text-white">
                Log into PeerPod
              </h1>
              <p className="text-sm text-[var(--muted)]">
                Pick up where your pod left off.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <label className="block space-y-2">
              <span className="text-sm text-[var(--muted)]">Username</span>
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="alice"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-[var(--muted)]">Password</span>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                minLength={1}
                placeholder="Your password"
                required
              />
            </label>

            {error ? <Alert variant="danger">{error}</Alert> : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            No account yet?{" "}
            <Link
              href="/register"
              className="text-[var(--accent)] transition hover:text-white"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-md py-12 text-[var(--muted)]">
          Loading...
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
