"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ApiError, apiRequest } from "@/lib/api";
import { createPeerPodSocket } from "@/lib/socket";
import type {
  FocusSession,
  Group,
  GroupMember,
  LeaderboardResponse,
  Task,
} from "@/lib/types";

export default function PodDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const groupId = Number(params.id);
  const { token, loading, profile } = useRequireAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const elapsed = useElapsedTimer(activeSession?.startedAt ?? null);

  const groupTasks = useMemo(
    () => tasks.filter((task) => task.group?.id === groupId),
    [tasks, groupId],
  );

  useEffect(() => {
    if (!token || !groupId) {
      return;
    }

    const socket = createPeerPodSocket(token);
    socket.on("connect", () => {
      socket.emit("pod.join", { groupId });
    });

    socket.on("leaderboard.updated", (payload) => {
      if (payload.groupId === groupId) {
        setLeaderboard(payload);
      }
    });

    socket.on("session.started", (payload) => {
      if (payload.groupId === groupId) {
        if (payload.userId === profile?.id) {
          setActiveSession((current) =>
            current ?? {
              id: payload.sessionId,
              startedAt: payload.startedAt,
              status: "ACTIVE",
              group: { id: groupId, name: group?.name ?? "", visibility: "PUBLIC" },
            },
          );
        }
        setNotice(`${payload.username} started a focus block.`);
      }
    });

    socket.on("session.stopped", (payload) => {
      if (payload.groupId === groupId) {
        if (payload.userId === profile?.id) {
          setActiveSession(null);
        }
        setNotice(`A focus block ended with ${payload.pointsAwarded} points awarded.`);
      }
    });

    return () => {
      socket.emit("pod.leave", { groupId });
      socket.disconnect();
    };
  }, [token, groupId, profile?.id, group?.name]);

  const loadPodData = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoadingPage(true);
    setError(null);

    try {
      const [groupData, memberData, leaderboardData, taskData, sessionData] =
        await Promise.all([
          apiRequest<Group>(`/groups/${groupId}`, { token }),
          apiRequest<GroupMember[]>(`/groups/${groupId}/members`, { token }),
          apiRequest<LeaderboardResponse>(`/groups/${groupId}/leaderboard?period=week`, {
            token,
          }),
          apiRequest<Task[]>("/tasks", { token }),
          apiRequest<FocusSession | null>("/sessions/me/active", { token }),
        ]);

      setGroup(groupData);
      setMembers(memberData);
      setLeaderboard(leaderboardData);
      setTasks(taskData);
      setActiveSession(sessionData?.group?.id === groupId ? sessionData : null);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to load this pod.",
      );
    } finally {
      setLoadingPage(false);
    }
  }, [token, groupId]);

  useEffect(() => {
    if (!token || !groupId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadPodData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [token, groupId, loadPodData]);

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      await apiRequest<Task>("/tasks", {
        method: "POST",
        token,
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          groupId,
        }),
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
      await loadPodData();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to create task.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function updateTaskStatus(taskId: number, status: Task["status"]) {
    if (!token) {
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status }),
      });
      await loadPodData();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update task.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function startSession() {
    if (!token) {
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const session = await apiRequest<FocusSession>("/sessions/start", {
        method: "POST",
        token,
        body: JSON.stringify({
          groupId,
          ...(selectedTaskId ? { taskId: Number(selectedTaskId) } : {}),
        }),
      });
      setActiveSession(session);
      setNotice("Focus block started. Keep the board moving.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to start session.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function stopSession() {
    if (!token || !activeSession) {
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const response = await apiRequest<{
        session: FocusSession;
        leaderboard: LeaderboardResponse;
      }>("/sessions/stop", {
        method: "POST",
        token,
        body: JSON.stringify({
          sessionId: activeSession.id,
        }),
      });
      setActiveSession(null);
      setLeaderboard(response.leaderboard);
      setNotice("Session completed and leaderboard refreshed.");
      await loadPodData();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to stop session.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function leavePod() {
    if (!token) {
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      await apiRequest(`/groups/${groupId}/leave`, {
        method: "DELETE",
        token,
      });
      router.push("/pods");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to leave pod.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  if (loading || loadingPage) {
    return <Panel message="Loading pod..." />;
  }

  if (!group) {
    return <Panel message={error ?? "Pod not found."} />;
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/70">
                Pod room
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-white">{group.name}</h1>
              <p className="mt-2 text-slate-300">
                Focus in public, finish what you claimed, and let the weekly board
                reflect it.
              </p>
            </div>
            <button
              type="button"
              onClick={leavePod}
              disabled={isMutating}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5 disabled:opacity-60"
            >
              Leave pod
            </button>
          </div>

          {notice ? (
            <p className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {notice}
            </p>
          ) : null}

          {error ? (
            <p className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Focus timer
          </p>
          <p className="mt-3 text-5xl font-semibold text-white">
            {formatElapsed(activeSession ? elapsed : 0)}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {activeSession
              ? "Your active session is running live against the pod board."
              : "Pick a task, start the block, and make your points count."}
          </p>

          <div className="mt-5 space-y-3">
            <select
              value={selectedTaskId}
              onChange={(event) => setSelectedTaskId(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            >
              <option value="">No linked task</option>
              {groupTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>

            {activeSession ? (
              <button
                type="button"
                onClick={stopSession}
                disabled={isMutating}
                className="w-full rounded-2xl bg-rose-500 px-5 py-3 font-medium text-white transition hover:bg-rose-400 disabled:opacity-60"
              >
                Stop focus session
              </button>
            ) : (
              <button
                type="button"
                onClick={startSession}
                disabled={isMutating}
                className="w-full rounded-2xl bg-indigo-500 px-5 py-3 font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
              >
                Start focus session
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr_0.8fr]">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Tasks
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">What you ship</h2>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
              {groupTasks.length} linked tasks
            </span>
          </div>

          <form onSubmit={handleCreateTask} className="mt-5 space-y-3">
            <input
              value={newTaskTitle}
              onChange={(event) => setNewTaskTitle(event.target.value)}
              placeholder="Add a task that counts toward this pod"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              required
            />
            <textarea
              value={newTaskDescription}
              onChange={(event) => setNewTaskDescription(event.target.value)}
              placeholder="Optional details"
              className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            />
            <button
              type="submit"
              disabled={isMutating}
              className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              Add task
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {groupTasks.length === 0 ? (
              <EmptyState message="No pod-linked tasks yet." />
            ) : (
              groupTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-white/8 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{task.title}</p>
                      {task.description ? (
                        <p className="mt-1 text-sm text-slate-400">{task.description}</p>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(["OPEN", "IN_PROGRESS", "DONE"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={task.status === status || isMutating}
                        onClick={() => updateTaskStatus(task.id, status)}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/5 disabled:opacity-40"
                      >
                        {status.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Leaderboard
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">This week</h2>
          <div className="mt-5 space-y-3">
            {leaderboard?.leaderboard.length ? (
              leaderboard.leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-400/15 text-sm font-semibold text-indigo-200">
                      #{entry.rank}
                    </div>
                    <div>
                      <p className="font-medium text-white">{entry.username}</p>
                      <p className="text-xs text-slate-400">
                        {leaderboard.myRank === entry.rank ? "You are here" : "Pod member"}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-white">{entry.points}</p>
                </div>
              ))
            ) : (
              <EmptyState message="No points recorded yet." />
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Members
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Who is inside</h2>
          <div className="mt-5 space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{member.user.username}</p>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-sm text-amber-100">
              Current streak:{" "}
              <span className="font-semibold text-white">
                {profile?.currentStreak ?? 0} days
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-300">
              Enough consistency to matter, not enough sugar to turn this into a game shop.
            </p>
          </div>

          <Link
            href="/profile"
            className="mt-4 inline-flex rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
          >
            Open profile
          </Link>
        </section>
      </div>
    </section>
  );
}

function useElapsedTimer(startedAt: string | null) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      return;
    }

    const update = () => {
      const diffMs = Date.now() - new Date(startedAt).getTime();
      setElapsed(Math.max(0, Math.floor(diffMs / 1000)));
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  return elapsed;
}

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function Panel({ message }: { message: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-10 text-center text-slate-300">
      {message}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-6 text-sm text-slate-400">
      {message}
    </div>
  );
}
