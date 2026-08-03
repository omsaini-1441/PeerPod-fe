"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
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
      <section className="mx-auto max-w-md py-12 text-slate-300">
        Checking your session...
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md py-12">
      <Card>
        <CardContent className="p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/70">
            Welcome back
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Log into PeerPod</h1>
          <p className="mt-2 text-sm text-slate-400">
            Pick up where your pod leaderboard left off.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" autoComplete="on">
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Username</span>
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="alice"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Password</span>
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

          <p className="mt-6 text-sm text-slate-400">
            No account yet?{" "}
            <Link href="/register" className="text-indigo-200 hover:text-white">
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
    <Suspense fallback={<section className="mx-auto max-w-md py-12 text-slate-300">Loading...</section>}>
      <LoginForm />
    </Suspense>
  );
}
