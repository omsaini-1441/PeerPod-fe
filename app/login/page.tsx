"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
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
      router.push("/pods");
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

  return (
    <section className="mx-auto max-w-md py-12">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 shadow-2xl shadow-slate-950/30">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/70">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Log into PeerPod</h1>
        <p className="mt-2 text-sm text-slate-400">
          Pick up where your pod leaderboard left off.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500"
              placeholder="alice"
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

          {error ? (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-indigo-500 px-4 py-3 font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          No account yet?{" "}
          <Link href="/register" className="text-indigo-200 hover:text-white">
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}
