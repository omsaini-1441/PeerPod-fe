"use client";

import { useEffect, useState } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PanelMessage } from "@/components/ui/panel-message";

export default function ProfilePage() {
  const { loading, ready, profile, refreshProfile } = useRequireAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || profile) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        await refreshProfile();
      } catch (caughtError) {
        if (!cancelled) {
          setProfileError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Unable to load profile.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, profile, refreshProfile]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (password && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await apiRequest("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          username,
          email,
          ...(password ? { password } : {}),
        }),
      });
      setMessage("Profile updated.");
      await refreshProfile();
      event.currentTarget.reset();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update profile.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <PanelMessage message="Loading your profile..." />;
  }

  if (!ready) {
    return <PanelMessage message="Redirecting to sign in..." />;
  }

  if (profileError) {
    return <PanelMessage message={profileError} />;
  }

  if (!profile) {
    return <PanelMessage message="Loading your profile..." />;
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/70">
          Your pulse
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{profile.username}</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <StatCard label="Current streak" value={`${profile.currentStreak}d`} />
          <StatCard label="Longest streak" value={`${profile.longestStreak}d`} />
          <StatCard
            label="Role"
            value={profile.role}
            tone="text-emerald-200"
          />
          <StatCard
            label="Email status"
            value={profile.isEmailVerified ? "Verified" : "Pending"}
            tone={profile.isEmailVerified ? "text-emerald-200" : "text-amber-200"}
          />
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Account settings
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4" autoComplete="on">
          <Field label="Username">
            <input
              name="username"
              autoComplete="username"
              defaultValue={profile.username}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              required
            />
          </Field>
          <Field label="Email">
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={profile.email}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              required
            />
          </Field>
          <Field label="New password (optional)">
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              placeholder="Leave blank to keep current password"
            />
          </Field>

          {message ? <SuccessBanner message={message} /> : null}
          {error ? <ErrorBanner message={error} /> : null}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-indigo-500 px-5 py-3 font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function StatCard({
  label,
  value,
  tone = "text-white",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
      {message}
    </p>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
      {message}
    </p>
  );
}
