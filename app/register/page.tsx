"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
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
      setTimeout(() => router.push("/login"), 1000);
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

  return (
    <section className="mx-auto max-w-md py-12">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 shadow-2xl shadow-slate-950/30">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/70">
          Start your pod
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Create your account</h1>
        <p className="mt-2 text-sm text-slate-400">
          The goal is simple: show up, focus, and keep your rank earned.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              placeholder="alice"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              placeholder="alice@example.com"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              placeholder="secret123"
              required
            />
          </label>

          {message ? (
            <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Already registered?{" "}
          <Link href="/login" className="text-indigo-200 hover:text-white">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}
