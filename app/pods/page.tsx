"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Lock, Plus, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { Group } from "@/lib/types";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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

export default function PodsPage() {
  const { isAuthenticated, loading } = useRequireAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [fetching, setFetching] = useState(true);
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
    if (!isAuthenticated) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadGroups();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, loadGroups]);

  async function handleCreatePod(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) {
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
    if (!isAuthenticated) {
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
    if (!isAuthenticated) {
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

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-6 border-b border-[var(--border)] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl space-y-3">
          <Badge variant="accent">Your pods</Badge>
          <h1 className="pp-display text-4xl font-semibold text-white sm:text-5xl">
            Rooms that keep you honest
          </h1>
          <p className="text-[var(--muted)]">
            Create or open a pod, then let the timer and leaderboard do the
            accountability work.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-5">
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
                <div className="grid gap-3 sm:grid-cols-2">
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
                <Button type="submit" className="w-full sm:w-auto">
                  Create pod
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[var(--accent)]" />
                <CardTitle className="text-xl">Join private pod</CardTitle>
              </div>
              <CardDescription>
                Got a friend&apos;s invite code? Paste it here and join directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinByCode} className="space-y-3">
                <Input
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                  placeholder="Invite code, e.g. A1B2C3D4"
                  maxLength={8}
                  required
                />
                {joinByCodeError ? (
                  <Alert variant="danger">{joinByCodeError}</Alert>
                ) : null}
                <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                  Join by code
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
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

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="pp-display text-2xl font-semibold text-white">Your pods</h2>
                <p className="text-sm text-[var(--muted)]">
                  Rooms you already belong to.
                </p>
              </div>
              <Badge>{myGroups.length}</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {fetching
                ? Array.from({ length: 2 }).map((_, index) => (
                    <Card key={index} className="h-40 animate-pulse bg-white/[0.03]" />
                  ))
                : myGroups.length === 0 ? (
                    <Card className="sm:col-span-2">
                      <CardContent className="p-5 text-sm text-[var(--muted)]">
                        You have not joined a pod yet. Use the discovery section below
                        to join a friend&apos;s pod first, or create your own.
                      </CardContent>
                    </Card>
                  ) : (
                    myGroups.map((group) => (
                      <motion.div
                        key={`mine-${group.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        <Card className="h-full">
                          <CardContent className="flex h-full flex-col p-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="accent">{group.myRole ?? "MEMBER"}</Badge>
                              <Badge>{group.memberCount ?? 0} members</Badge>
                            </div>
                            <h3 className="pp-display mt-4 text-2xl font-semibold text-white">
                              {group.name}
                            </h3>
                            <p className="mt-2 text-sm text-[var(--muted)]">
                              Open the room, manage tasks, and start focus blocks.
                            </p>
                            <div className="mt-auto pt-5">
                              <Button asChild>
                                <Link href={`/pods/${group.id}`}>
                                  Open pod
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="pp-display text-2xl font-semibold text-white">Discover and join</h2>
                <p className="text-sm text-[var(--muted)]">
                  Public pods you can enter without creating one first.
                </p>
              </div>
              <Badge>{groups.length}</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {fetching
                ? Array.from({ length: 4 }).map((_, index) => (
                    <Card
                      key={index}
                      className="h-44 animate-pulse bg-white/[0.03]"
                    />
                  ))
                : groups.length === 0 ? (
                    <Card className="sm:col-span-2">
                      <CardContent className="p-5 text-sm text-[var(--muted)]">
                        No discoverable pods right now. Ask a friend for an invite code
                        to a private pod or create a new room.
                      </CardContent>
                    </Card>
                  ) : (
                    groups.map((group) => (
                      <motion.div
                        key={`discover-${group.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        <Card className="h-full">
                          <CardContent className="flex h-full flex-col p-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant={
                                  group.visibility === "PRIVATE" ? "warning" : "accent"
                                }
                              >
                                {group.visibility === "PRIVATE" ? (
                                  <Lock className="h-3 w-3" />
                                ) : (
                                  <Users className="h-3 w-3" />
                                )}
                                {group.visibility}
                              </Badge>
                              <Badge>{group.memberCount ?? 0} members</Badge>
                              {group.maxMembers ? (
                                <Badge>Cap {group.maxMembers}</Badge>
                              ) : null}
                            </div>

                            <h3 className="pp-display mt-4 text-2xl font-semibold text-white">
                              {group.name}
                            </h3>

                            {group.visibility === "PRIVATE" ? (
                              <div className="mt-4 space-y-2">
                                <Input
                                  value={joinCode[group.id] ?? ""}
                                  onChange={(event) =>
                                    setJoinCode((current) => ({
                                      ...current,
                                      [group.id]: event.target.value,
                                    }))
                                  }
                                  placeholder="Invite code"
                                />
                              </div>
                            ) : (
                              <p className="mt-3 text-sm text-[var(--muted)]">
                                Public room. Join instantly and start competing.
                              </p>
                            )}

                            <div className="mt-auto flex flex-wrap gap-2 pt-5">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleJoin(group)}
                              >
                                Join pod
                              </Button>
                              {group.visibility === "PUBLIC" ? (
                                <Button asChild variant="ghost">
                                  <Link href={`/pods/${group.id}`}>
                                    Preview
                                    <ArrowRight className="h-4 w-4" />
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
