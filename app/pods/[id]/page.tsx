"use client";

import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ApiError, apiRequest } from "@/lib/api";
import { createPeerPodSocket } from "@/lib/socket";
import type {
  FocusSession,
  Group,
  GroupMember,
  LeaderboardResponse,
  StopSessionResponse,
  Task,
} from "@/lib/types";
import { FocusTimerCard } from "@/components/pods/focus-timer-card";
import { LeaderboardCard } from "@/components/pods/leaderboard-card";
import { MembersCard } from "@/components/pods/members-card";
import { PodHeader } from "@/components/pods/pod-header";
import { TaskListCard } from "@/components/pods/task-list-card";
import { Alert } from "@/components/ui/alert";
import { PanelMessage } from "@/components/ui/panel-message";

export default function PodDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const groupId = Number(params.id);
  const { isAuthenticated, loading, profile, getSocketToken, refreshProfile } =
    useRequireAuth();

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
    if (!isAuthenticated || !groupId) {
      return;
    }

    let cancelled = false;
    let socket: ReturnType<typeof createPeerPodSocket> | null = null;

    void (async () => {
      try {
        const socketToken = await getSocketToken();
        if (cancelled) {
          return;
        }

        socket = createPeerPodSocket(socketToken);
        socket.on("connect", () => {
          socket?.emit("pod.join", { groupId });
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
                  group: {
                    id: groupId,
                    name: group?.name ?? "",
                    visibility: "PUBLIC",
                  },
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
            setNotice(
              `A focus block ended with ${payload.pointsAwarded} points awarded.`,
            );
          }
        });
      } catch {
        if (!cancelled) {
          setNotice("Live updates unavailable. Refresh if the board looks stale.");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (socket) {
        socket.emit("pod.leave", { groupId });
        socket.disconnect();
      }
    };
  }, [isAuthenticated, groupId, profile?.id, group?.name, getSocketToken]);

  const loadPodData = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setLoadingPage(true);
    setError(null);

    try {
      const [groupResult, memberResult, taskResult, sessionResult] =
        await Promise.allSettled([
          apiRequest<Group>(`/groups/${groupId}`),
          apiRequest<GroupMember[]>(`/groups/${groupId}/members`),
          apiRequest<Task[]>("/tasks"),
          apiRequest<FocusSession | null>("/sessions/me/active"),
        ]);

      if (groupResult.status !== "fulfilled") {
        throw groupResult.reason instanceof ApiError
          ? groupResult.reason
          : new Error("Unable to load this pod.");
      }

      setGroup(groupResult.value);
      setMembers(memberResult.status === "fulfilled" ? memberResult.value : []);
      setTasks(taskResult.status === "fulfilled" ? taskResult.value : []);

      const sessionData =
        sessionResult.status === "fulfilled" ? sessionResult.value : null;
      setActiveSession(sessionData?.group?.id === groupId ? sessionData : null);

      try {
        const leaderboardData = await apiRequest<LeaderboardResponse>(
          `/groups/${groupId}/leaderboard?period=week`,
        );
        setLeaderboard(leaderboardData);
      } catch {
        setLeaderboard(null);
        setNotice((current) =>
          current ?? "Leaderboard is slow right now. The rest of the pod is ready.",
        );
      }

      const softFailures = [memberResult, taskResult, sessionResult].filter(
        (result) => result.status === "rejected",
      ).length;
      if (softFailures > 0) {
        setNotice((current) =>
          current ?? "Some secondary pod details are still loading.",
        );
      }
    } catch (caughtError) {
      setGroup(null);
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to load this pod.",
      );
    } finally {
      setLoadingPage(false);
    }
  }, [isAuthenticated, groupId]);

  useEffect(() => {
    if (!isAuthenticated || !groupId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadPodData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, groupId, loadPodData]);

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) {
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      await apiRequest<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          groupId,
        }),
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
      await loadPodData();
      await refreshProfile();
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
    if (!isAuthenticated) {
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadPodData();
      await refreshProfile();
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
    if (!isAuthenticated) {
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const session = await apiRequest<FocusSession>("/sessions/start", {
        method: "POST",
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
    if (!isAuthenticated || !activeSession) {
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const response = await apiRequest<StopSessionResponse>("/sessions/stop", {
        method: "POST",
        body: JSON.stringify({
          sessionId: activeSession.id,
        }),
      });
      setActiveSession(null);
      setLeaderboard(response.leaderboard);
      setNotice("Session completed and leaderboard refreshed.");
      await loadPodData();
      await refreshProfile();
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
    if (!isAuthenticated) {
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      await apiRequest(`/groups/${groupId}/leave`, {
        method: "DELETE",
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
    return <PanelMessage message="Loading pod..." />;
  }

  if (!group) {
    return <PanelMessage message={error ?? "Pod not found."} />;
  }

  return (
    <section className="space-y-8">
      <PodHeader
        groupName={group.name}
        memberCount={members.length}
        currentStreak={profile?.currentStreak ?? 0}
        notice={notice}
        onLeave={leavePod}
        isMutating={isMutating}
      />

      <AnimatePresence initial={false}>
        {error ? (
          <motion.div
            key="pod-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Alert variant="danger">{error}</Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <FocusTimerCard
          elapsedLabel={formatElapsed(activeSession ? elapsed : 0)}
          activeSession={Boolean(activeSession)}
          selectedTaskId={selectedTaskId}
          tasks={groupTasks}
          isMutating={isMutating}
          onSelectedTaskIdChange={setSelectedTaskId}
          onStart={startSession}
          onStop={stopSession}
        />
        <LeaderboardCard leaderboard={leaderboard} profile={profile} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <TaskListCard
          tasks={groupTasks}
          newTaskTitle={newTaskTitle}
          newTaskDescription={newTaskDescription}
          isMutating={isMutating}
          onNewTaskTitleChange={setNewTaskTitle}
          onNewTaskDescriptionChange={setNewTaskDescription}
          onSubmit={handleCreateTask}
          onStatusChange={updateTaskStatus}
        />
        <MembersCard members={members} profile={profile} />
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
