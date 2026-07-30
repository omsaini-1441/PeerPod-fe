export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type GroupVisibility = "PUBLIC" | "PRIVATE";
export type TaskStatus = "OPEN" | "IN_PROGRESS" | "DONE";
export type FocusSessionStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type LeaderboardPeriod = "day" | "week";

export interface AuthUser {
  id: number;
  username: string;
  userrole: UserRole;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface Profile {
  id: number;
  username: string;
  email: string;
  isEmailVerified: boolean;
  role: UserRole;
  currentStreak: number;
  longestStreak: number;
  lastActiveAt: string | null;
  tasks: Task[];
}

export interface Group {
  id: number;
  name: string;
  visibility: GroupVisibility;
  maxMembers?: number | null;
  inviteCode?: string | null;
  memberCount?: number;
  myRole?: "ADMIN" | "MEMBER";
  createdAt?: string;
}

export interface GroupMember {
  id: number;
  role: "ADMIN" | "MEMBER";
  user: {
    id: number;
    username: string;
  };
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  completionPointsAwarded?: boolean;
  group?: Group | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FocusSession {
  id: number;
  status: FocusSessionStatus;
  startedAt: string;
  endedAt?: string | null;
  durationMinutes?: number;
  pointsAwarded?: boolean;
  group?: Group;
  task?: Task | null;
}

export interface PointEvent {
  id: number;
  reason: "SESSION_COMPLETED" | "TASK_COMPLETED";
  points: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  points: number;
}

export interface LeaderboardResponse {
  groupId: number;
  period: LeaderboardPeriod;
  leaderboard: LeaderboardEntry[];
  myRank: number | null;
}

export interface StopSessionResponse {
  session: FocusSession;
  pointEvent: PointEvent | null;
  leaderboard: LeaderboardResponse;
}

export interface FocusHeatmapCell {
  day: string;
  totalMinutes: number;
  sessionCount: number;
  hours: number;
}

export interface FocusHeatmapResponse {
  from: string;
  to: string;
  days: number;
  totalMinutes: number;
  cells: FocusHeatmapCell[];
}

export interface SocketSessionStartedPayload {
  sessionId: number;
  userId: number;
  username: string;
  groupId: number;
  startedAt: string;
  taskId: number | null;
}

export interface SocketSessionStoppedPayload {
  sessionId: number;
  userId: number;
  groupId: number;
  durationMinutes: number;
  pointsAwarded: number;
  endedAt: string;
}
