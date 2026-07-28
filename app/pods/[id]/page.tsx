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
      const response = await apiRequest<StopSessionResponse>("/sessions/stop", {
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
    return <PanelMessage message="Loading pod..." />;
  }

  if (!group) {
    return <PanelMessage message={error ?? "Pod not found."} />;
  }

  return (
    <section className="space-y-6">
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

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
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
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <LeaderboardCard leaderboard={leaderboard} profile={profile} />
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
