"use client";

import { useEffect, useState } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PanelMessage } from "@/components/ui/panel-message";
import { Score } from "@/components/ui/score";

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
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardDescription>Your pulse</CardDescription>
          <CardTitle className="text-3xl">{profile.username}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Current streak" value={profile.currentStreak} suffix="d" hot />
            <StatCard label="Longest streak" value={profile.longestStreak} suffix="d" />
            <div className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
              <p className="text-sm text-[var(--muted)]">Role</p>
              <p className="mt-2 text-xl font-semibold text-white">{profile.role}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
              <p className="text-sm text-[var(--muted)]">Email status</p>
              <p
                className={`mt-2 text-xl font-semibold ${
                  profile.isEmailVerified
                    ? "text-[var(--accent)]"
                    : "text-[var(--warning)]"
                }`}
              >
                {profile.isEmailVerified ? "Verified" : "Pending"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account settings</CardTitle>
          <CardDescription>Update how you show up in your pods.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <label className="block space-y-2">
              <span className="text-sm text-[var(--muted)]">Username</span>
              <Input
                name="username"
                autoComplete="username"
                defaultValue={profile.username}
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-[var(--muted)]">Email</span>
              <Input
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={profile.email}
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-[var(--muted)]">
                New password (optional)
              </span>
              <Input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                placeholder="Leave blank to keep current password"
              />
            </label>

            {message ? <Alert variant="success">{message}</Alert> : null}
            {error ? <Alert variant="danger">{error}</Alert> : null}

            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function StatCard({
  label,
  value,
  suffix,
  hot = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  hot?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        hot
          ? "border-[var(--warning)]/20 bg-[var(--warning)]/10"
          : "border-[var(--border)] bg-black/20"
      }`}
    >
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <Score
        value={value}
        suffix={suffix}
        className={`mt-2 text-2xl font-semibold ${
          hot ? "text-[var(--warning)]" : "text-white"
        }`}
      />
    </div>
  );
}
