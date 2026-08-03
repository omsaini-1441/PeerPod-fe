"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useRedirectIfAuthenticated } from "@/hooks/use-redirect-if-authenticated";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const { loading, ready } = useRedirectIfAuthenticated();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const successMessage = await register({ username, email, password });
      setMessage(successMessage);
      window.setTimeout(() => router.push("/login"), 1000);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to create the account right now.",
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
    <section className="mx-auto max-w-md py-12">
      <Card>
        <CardContent className="p-8">
          <h1 className="pp-display text-3xl font-semibold text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Show up, focus, and keep your rank earned.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" autoComplete="on">
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
              <span className="text-sm text-[var(--muted)]">Email</span>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="alice@example.com"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-[var(--muted)]">Password</span>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                placeholder="At least 8 characters"
                required
              />
            </label>

            {message ? <Alert variant="success">{message}</Alert> : null}
            {error ? <Alert variant="danger">{error}</Alert> : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            Already registered?{" "}
            <Link
              href="/login"
              className="text-[var(--accent)] transition hover:text-white"
            >
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-md py-12 text-[var(--muted)]">
          Loading...
        </section>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
