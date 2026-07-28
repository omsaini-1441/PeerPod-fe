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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PanelMessage } from "@/components/ui/panel-message";
import { Select } from "@/components/ui/select";

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
    return <PanelMessage message="Loading your pods..." />;
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <Badge variant="glow">Your world</Badge>
            <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Pods</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Join a pod, pick your room, and let the leaderboard make your focus
              visible.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge>
              <Plus className="h-3.5 w-3.5" />
              Create a pod
            </Badge>
            <CardTitle className="mt-3">Start a room worth showing up for</CardTitle>
            <CardDescription className="mt-2">
              Keep it public for easy joins or lock it down for a tighter crew.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePod} className="space-y-4">
              <Input
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="Exam Sprint"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
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
              <Button type="submit">Create pod</Button>
            </form>
          </CardContent>
        </Card>
      </div>

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fetching
          ? Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                className="h-56 animate-pulse border-white/8 bg-white/5"
              />
            ))
          : groups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={group.visibility === "PRIVATE" ? "warning" : "glow"}>
                            {group.visibility === "PRIVATE" ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <Users className="h-3.5 w-3.5" />
                            )}
                            {group.visibility}
                          </Badge>
                          {group.maxMembers ? <Badge>Cap {group.maxMembers}</Badge> : null}
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold text-white">{group.name}</h2>
                      </div>
                    </div>

                    {group.visibility === "PRIVATE" ? (
                      <div className="mt-5 space-y-3">
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
                        {group.inviteCode ? (
                          <p className="text-xs text-slate-500">
                            Owner code: {group.inviteCode}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-5 text-sm text-slate-400">
                        Open room. Join fast and let the board do the rest.
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button type="button" variant="accent" onClick={() => handleJoin(group)}>
                        Join
                      </Button>
                      <Button asChild type="button" variant="secondary">
                        <Link href={`/pods/${group.id}`}>
                          Open pod
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>
    </section>
  );
}
