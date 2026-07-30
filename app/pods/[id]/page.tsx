"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useToast } from "@/components/providers/toast-provider";
import { ApiError, apiRequest } from "@/lib/api";
import { createPeerPodSocket } from "@/lib/socket";
import type {
  FocusHeatmapResponse,
  FocusSession,
  Group,
  GroupMember,
  LeaderboardResponse,
  StopSessionResponse,
  Task,
} from "@/lib/types";
import {
  FocusTimerCard,
  FocusZenMode,
} from "@/components/pods/focus-timer-card";
import { FocusHeatmapCard } from "@/components/pods/focus-heatmap-card";
import { LeaderboardCard } from "@/components/pods/leaderboard-card";
import { MembersCard } from "@/components/pods/members-card";
import { PodHeader } from "@/components/pods/pod-header";
import { TaskListCard } from "@/components/pods/task-list-card";
import { PanelMessage } from "@/components/ui/panel-message";

export default function PodDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const groupId = Number(params.id);
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const { isAuthenticated, loading, profile, getSocketToken, refreshProfile } =
    useRequireAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [heatmap, setHeatmap] = useState<FocusHeatmapResponse | null>(null);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [zenModeOpen, setZenModeOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mutatingKey, setMutatingKey] = useState<string | null>(null);

  const elapsed = useElapsedTimer(activeSession?.startedAt ?? null);
  const isMutating = mutatingKey !== null;

  const groupTasks = useMemo(
    () => tasks.filter((task) => task.group?.id === groupId),
    [tasks, groupId],
  );

  const selectedTask = useMemo(
    () => groupTasks.find((task) => String(task.id) === selectedTaskId) ?? null,
    [groupTasks, selectedTaskId],
  );

  useEffect(() => {
    if (selectedTask?.status === "DONE") {
      setSelectedTaskId("");
    }
  }, [selectedTask]);

  useEffect(() => {
    if (!activeSession) {
      setZenModeOpen(false);
    }
  }, [activeSession]);

  const refreshHeatmap = useCallback(async () => {
    try {
      const data = await apiRequest<FocusHeatmapResponse>(
        "/sessions/me/heatmap?days=84",
      );
      setHeatmap(data);
    } catch {
      // Non-blocking secondary surface.
    }
  }, []);

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
              void refreshHeatmap();
            }
            setNotice(
              `A focus block ended with ${payload.pointsAwarded} points awarded.`,
            );
          }
        });
      } catch {
        if (!cancelled) {
          toastRef.current.info(
            "Live updates unavailable. Refresh if the board looks stale.",
          );
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
  }, [
    isAuthenticated,
    groupId,
    profile?.id,
    group?.name,
    getSocketToken,
    refreshHeatmap,
  ]);

  const loadPodData = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setLoadingPage(true);
    setLoadError(null);

    try {
      const [groupResult, memberResult, taskResult, sessionResult, heatmapResult] =
        await Promise.allSettled([
          apiRequest<Group>(`/groups/${groupId}`),
          apiRequest<GroupMember[]>(`/groups/${groupId}/members`),
          apiRequest<Task[]>("/tasks"),
          apiRequest<FocusSession | null>("/sessions/me/active"),
          apiRequest<FocusHeatmapResponse>("/sessions/me/heatmap?days=84"),
        ]);

      if (groupResult.status !== "fulfilled") {
        throw groupResult.reason instanceof ApiError
          ? groupResult.reason
          : new Error("Unable to load this pod.");
      }

      setGroup(groupResult.value);
      setMembers(memberResult.status === "fulfilled" ? memberResult.value : []);
      setTasks(taskResult.status === "fulfilled" ? taskResult.value : []);
      setHeatmap(heatmapResult.status === "fulfilled" ? heatmapResult.value : null);

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
        toastRef.current.info(
          "Leaderboard is slow right now. The rest of the pod is ready.",
        );
      }
    } catch (caughtError) {
      setGroup(null);
      setLoadError(
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
    if (!isAuthenticated || mutatingKey) {
      return;
    }

    setMutatingKey("create-task");

    try {
      const created = await apiRequest<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          groupId,
        }),
      });
      setTasks((current) => [created, ...current]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      toast.success("Task added.");
    } catch (caughtError) {
      toast.error(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to create task.",
      );
    } finally {
      setMutatingKey(null);
    }
  }

  async function updateTaskStatus(taskId: number, status: Task["status"]) {
    if (!isAuthenticated || mutatingKey) {
      return;
    }

    setMutatingKey(`task-${taskId}`);
    const previous = tasks;

    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status } : task)),
    );

    try {
      const updated = await apiRequest<Task>(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? updated : task)),
      );
      if (status === "DONE") {
        toast.success("Task completed.");
      }
    } catch (caughtError) {
      setTasks(previous);
      toast.error(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update task.",
      );
    } finally {
      setMutatingKey(null);
    }
  }

  async function startSession() {
    if (!isAuthenticated || mutatingKey) {
      return;
    }

    if (selectedTask?.status === "DONE") {
      toast.error("Completed tasks can't start a focus block. Pick an open task.");
      setSelectedTaskId("");
      return;
    }

    setMutatingKey("session-start");

    try {
      const session = await apiRequest<FocusSession>("/sessions/start", {
        method: "POST",
        body: JSON.stringify({
          groupId,
          ...(selectedTaskId ? { taskId: Number(selectedTaskId) } : {}),
        }),
      });
      setActiveSession(session);
      setZenModeOpen(true);
      setNotice("Focus block started. Stay in the work.");
    } catch (caughtError) {
      toast.error(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to start session.",
      );
    } finally {
      setMutatingKey(null);
    }
  }

  async function stopSession() {
    if (!isAuthenticated || !activeSession || mutatingKey) {
      return;
    }

    setMutatingKey("session-stop");

    try {
      const response = await apiRequest<StopSessionResponse>("/sessions/stop", {
        method: "POST",
        body: JSON.stringify({
          sessionId: activeSession.id,
        }),
      });
      setActiveSession(null);
      setZenModeOpen(false);
      setLeaderboard(response.leaderboard);
      setNotice("Session completed.");
      toast.success(
        response.pointEvent
          ? `+${response.pointEvent.points} pts — board updated.`
          : "Focus block ended.",
      );
      void refreshHeatmap();
      void refreshProfile();
    } catch (caughtError) {
      toast.error(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to stop session.",
      );
    } finally {
      setMutatingKey(null);
    }
  }

  async function leavePod() {
    if (!isAuthenticated || mutatingKey) {
      return;
    }

    setMutatingKey("leave");

    try {
      await apiRequest(`/groups/${groupId}/leave`, {
        method: "DELETE",
      });
      router.push("/pods");
    } catch (caughtError) {
      toast.error(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to leave pod.",
      );
      setMutatingKey(null);
    }
  }

  if (loading || loadingPage) {
    return <PanelMessage message="Loading pod..." />;
  }

  if (!group) {
    return <PanelMessage message={loadError ?? "Pod not found."} />;
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

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
          <div className="min-h-0 lg:col-span-5">
            <FocusTimerCard
              elapsedLabel={formatElapsed(activeSession ? elapsed : 0)}
              activeSession={Boolean(activeSession)}
              selectedTaskId={selectedTaskId}
              tasks={groupTasks}
              isMutating={isMutating}
              onSelectedTaskIdChange={setSelectedTaskId}
              onStart={startSession}
              onStop={stopSession}
              onEnterZen={() => setZenModeOpen(true)}
            />
          </div>
          <div className="min-h-0 lg:col-span-7">
            <LeaderboardCard leaderboard={leaderboard} profile={profile} />
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
          <div className="min-h-0 lg:col-span-8">
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
          </div>
          <div className="min-h-0 lg:col-span-4">
            <MembersCard members={members} profile={profile} />
          </div>
        </div>

        <FocusHeatmapCard heatmap={heatmap} />
      </div>

      <FocusZenMode
        open={zenModeOpen && Boolean(activeSession)}
        elapsedLabel={formatElapsed(activeSession ? elapsed : 0)}
        taskTitle={selectedTask?.title ?? activeSession?.task?.title ?? null}
        isMutating={isMutating}
        onClose={() => setZenModeOpen(false)}
        onStop={stopSession}
      />
    </section>
  );
}

function useElapsedTimer(startedAt: string | null) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
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
