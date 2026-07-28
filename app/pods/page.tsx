"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { Group } from "@/lib/types";

export default function PodsPage() {
  const { token, loading } = useRequireAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createName, setCreateName] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [maxMembers, setMaxMembers] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<Record<number, string>>({});

  const loadGroups = useCallback(async () => {
    if (!token) {
      return;
    }

    setFetching(true);
    setError(null);
    try {
      const nextGroups = await apiRequest<Group[]>("/groups", { token });
      setGroups(nextGroups);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to load pods.",
      );
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadGroups();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [token, loadGroups]);

  async function handleCreatePod(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setCreateError(null);
    try {
      await apiRequest<Group>("/groups", {
        method: "POST",
        token,
        body: JSON.stringify({
          name: createName,
          visibility,
          ...(maxMembers ? { maxMembers: Number(maxMembers) } : {}),
        }),
      });

      setCreateName("");
      setVisibility("PUBLIC");
      setMaxMembers("");
      await loadGroups();
    } catch (caughtError) {
      setCreateError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to create pod.",
      );
    }
  }

  async function handleJoin(group: Group) {
    if (!token) {
      return;
    }

    setError(null);
    try {
      await apiRequest(`/groups/${group.id}/join`, {
        method: "POST",
        token,
        body: JSON.stringify(
          group.visibility === "PRIVATE"
            ? { inviteCode: joinCode[group.id] ?? "" }
            : {},
        ),
      });

      await loadGroups();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to join this pod.",
      );
    }
  }

  if (loading) {
    return <PodsLoader />;
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/70">
            Your world
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Pods</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Join a pod, pick your room, and let the leaderboard make your
            focus visible.
          </p>
        </div>

        <form
          onSubmit={handleCreatePod}
          className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Create a pod
          </p>
          <div className="mt-5 space-y-4">
            <input
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder="Exam Sprint"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as "PUBLIC" | "PRIVATE")
                }
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
              <input
                type="number"
                min="1"
                value={maxMembers}
                onChange={(event) => setMaxMembers(event.target.value)}
                placeholder="Max members"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </div>
            {createError ? (
              <ErrorBanner message={createError} />
            ) : null}
            <button
              type="submit"
              className="rounded-2xl bg-indigo-500 px-5 py-3 font-medium text-white transition hover:bg-indigo-400"
            >
              Create pod
            </button>
          </div>
        </form>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fetching
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-[2rem] border border-white/10 bg-white/5"
              />
            ))
          : groups.map((group) => (
              <div
                key={group.id}
                className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {group.visibility}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      {group.name}
                    </h2>
                  </div>
                  {group.maxMembers ? (
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                      Cap {group.maxMembers}
                    </span>
                  ) : null}
                </div>

                {group.visibility === "PRIVATE" ? (
                  <div className="mt-5 space-y-3">
                    <input
                      value={joinCode[group.id] ?? ""}
                      onChange={(event) =>
                        setJoinCode((current) => ({
                          ...current,
                          [group.id]: event.target.value,
                        }))
                      }
                      placeholder="Invite code"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                    />
                    {group.inviteCode ? (
                      <p className="text-xs text-slate-500">
                        Owner code: {group.inviteCode}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleJoin(group)}
                    className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
                  >
                    Join
                  </button>
                  <Link
                    href={`/pods/${group.id}`}
                    className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                  >
                    Open pod
                  </Link>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}

function PodsLoader() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-10 text-center text-slate-300">
      Loading your pods...
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
      {message}
    </p>
  );
}
