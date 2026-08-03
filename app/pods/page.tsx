"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Lock, Plus, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { InteractiveGrid } from "@/components/aceternity/interactive-grid";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { ApiError, apiRequest } from "@/lib/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { Group } from "@/lib/types";
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
import { Select } from "@/components/ui/select";
import { Score } from "@/components/ui/score";

const spring = { type: "spring" as const, stiffness: 140, damping: 22 };

export default function PodsPage() {
  const { isAuthenticated, loading, ready } = useRequireAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createName, setCreateName] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [maxMembers, setMaxMembers] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<Record<number, string>>({});
  const [inviteCode, setInviteCode] = useState("");
  const [joinByCodeError, setJoinByCodeError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    if (!isAuthenticated) {
      setFetching(false);
      return;
    }

    setFetching(true);
    setError(null);
    try {
      const [visibleGroups, memberGroups] = await Promise.all([
        apiRequest<Group[]>("/groups"),
        apiRequest<Group[]>("/groups/me"),
      ]);
      const mineIds = new Set(memberGroups.map((group) => group.id));
      const discoverGroups = visibleGroups.filter((group) => !mineIds.has(group.id));

      setMyGroups(memberGroups);
      setGroups(discoverGroups);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to load pods.",
      );
    } finally {
      setFetching(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadGroups();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [ready, loadGroups]);

  async function handleCreatePod(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) {
      return;
    }

    setCreateError(null);
    try {
      await apiRequest<Group>("/groups", {
        method: "POST",
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
    if (!ready) {
      return;
    }

    setError(null);
    try {
      await apiRequest(`/groups/${group.id}/join`, {
        method: "POST",
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

  async function handleJoinByCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) {
      return;
    }

    setJoinByCodeError(null);
    setError(null);

    try {
      await apiRequest<Group>("/pods/join-by-code", {
        method: "POST",
        body: JSON.stringify({
          inviteCode: inviteCode.trim().toUpperCase(),
        }),
      });
      setInviteCode("");
      await loadGroups();
    } catch (caughtError) {
      setJoinByCodeError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to join private pod.",
      );
    }
  }

  if (loading) {
    return <PanelMessage message="Loading your pods..." />;
  }

  if (!ready) {
    return <PanelMessage message="Redirecting to sign in..." />;
  }

  return (
    <section className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[#0c0f0d]/40"
      >
        <InteractiveGrid cellSize={44} glowRadius={140} className="opacity-80" />
        <SparklesCore density={14} speed={0.08} className="opacity-25" />
        <div className="relative z-10 max-w-2xl space-y-3 px-6 py-10 sm:px-8 sm:py-12">
          <h1 className="pp-display text-4xl font-semibold text-white sm:text-5xl">
            Rooms that keep you honest
          </h1>
          <p className="max-w-[55ch] text-[var(--muted)] leading-relaxed">
            Create or open a pod, then let the timer and leaderboard do the
            accountability work.
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="space-y-5 lg:col-span-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-[var(--accent)]" />
                <CardTitle className="text-xl">Create pod</CardTitle>
              </div>
              <CardDescription>
                Public for easy joins, private for a tighter crew.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePod} className="space-y-3">
                <Input
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                  placeholder="Exam Sprint"
                  required
                />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Select
                    value={visibility}
                    onChange={(event) =>
                      setVisibility(event.target.value as "PUBLIC" | "PRIVATE")
                    }
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={maxMembers}
                    onChange={(event) => setMaxMembers(event.target.value)}
                    placeholder="Max members"
                  />
                </div>
                {createError ? <Alert variant="danger">{createError}</Alert> : null}
                <Button type="submit" className="w-full">
                  Create pod
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[var(--accent)]" />
                <CardTitle className="text-xl">Join by code</CardTitle>
              </div>
              <CardDescription>
                Paste a friend&apos;s invite and enter directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinByCode} className="space-y-3">
                <Input
                  value={inviteCode}
                  onChange={(event) =>
                    setInviteCode(event.target.value.toUpperCase())
                  }
                  placeholder="A1B2C3D4"
                  maxLength={8}
                  required
                  className="pp-mono tracking-widest"
                />
                {joinByCodeError ? (
                  <Alert variant="danger">{joinByCodeError}</Alert>
                ) : null}
                <Button type="submit" variant="secondary" className="w-full">
                  Join private pod
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 lg:col-span-8">
          <AnimatePresence initial={false}>
            {error ? (
              <motion.div
                key="pods-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Alert variant="danger">{error}</Alert>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <h2 className="pp-display text-2xl font-semibold text-white">
                  Your pods
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  Rooms you already belong to.
                </p>
              </div>
              <Score value={myGroups.length} className="text-[var(--muted)]" />
            </div>

            <div className="grid gap-3">
              {fetching
                ? Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-24 animate-pulse rounded-[1.5rem] border border-[var(--border)] bg-white/[0.03]"
                    />
                  ))
                : myGroups.length === 0 ? (
                    <Card>
                      <CardContent className="p-5 text-sm text-[var(--muted)]">
                        No pods yet. Create one or join from Discover below.
                      </CardContent>
                    </Card>
                  ) : (
                    myGroups.map((group, index) => (
                      <motion.div
                        key={`mine-${group.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: index * 0.04 }}
                      >
                        <Link
                          href={`/pods/${group.id}`}
                          className="group flex items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4 transition-all duration-[var(--duration-med)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-[var(--accent)]/25 hover:bg-[#141916]"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="pp-display truncate text-xl font-semibold text-white">
                                {group.name}
                              </h3>
                              <span className="text-xs text-[var(--muted)]">
                                {group.myRole ?? "MEMBER"}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--muted)]">
                              {group.memberCount ?? 0} members
                            </p>
                          </div>
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white/[0.03] text-white transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent-soft)] group-hover:text-[var(--accent)]">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </Link>
                      </motion.div>
                    ))
                  )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <h2 className="pp-display text-2xl font-semibold text-white">
                  Discover
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  Public rooms you can enter now.
                </p>
              </div>
              <Score value={groups.length} className="text-[var(--muted)]" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {fetching
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-40 animate-pulse rounded-[1.5rem] border border-[var(--border)] bg-white/[0.03]"
                    />
                  ))
                : groups.length === 0 ? (
                    <Card className="sm:col-span-2">
                      <CardContent className="p-5 text-sm text-[var(--muted)]">
                        No discoverable pods right now. Ask for an invite code or
                        create a room.
                      </CardContent>
                    </Card>
                  ) : (
                    groups.map((group, index) => (
                      <motion.div
                        key={`discover-${group.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: index * 0.04 }}
                        className="h-full"
                      >
                        <Card className="h-full transition-transform duration-[var(--duration-med)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
                          <CardContent className="flex h-full flex-col p-5">
                            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                              {group.visibility === "PRIVATE" ? (
                                <Lock className="h-3.5 w-3.5" />
                              ) : (
                                <Users className="h-3.5 w-3.5" />
                              )}
                              <span>{group.visibility.toLowerCase()}</span>
                              <span>·</span>
                              <span>{group.memberCount ?? 0} in room</span>
                              {group.maxMembers ? (
                                <>
                                  <span>·</span>
                                  <span>cap {group.maxMembers}</span>
                                </>
                              ) : null}
                            </div>

                            <h3 className="pp-display mt-3 text-xl font-semibold text-white">
                              {group.name}
                            </h3>

                            {group.visibility === "PRIVATE" ? (
                              <div className="mt-4">
                                <Input
                                  value={joinCode[group.id] ?? ""}
                                  onChange={(event) =>
                                    setJoinCode((current) => ({
                                      ...current,
                                      [group.id]: event.target.value,
                                    }))
                                  }
                                  placeholder="Invite code"
                                  className="pp-mono"
                                />
                              </div>
                            ) : (
                              <p className="mt-2 text-sm text-[var(--muted)]">
                                Join and start competing on the board.
                              </p>
                            )}

                            <div className="mt-auto flex flex-wrap gap-2 pt-5">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => handleJoin(group)}
                              >
                                Join
                              </Button>
                              {group.visibility === "PUBLIC" ? (
                                <Button asChild variant="ghost" size="sm">
                                  <Link href={`/pods/${group.id}`}>
                                    Preview
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </Link>
                                </Button>
                              ) : null}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
