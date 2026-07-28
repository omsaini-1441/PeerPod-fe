import { io, type Socket } from "socket.io-client";
import { getSocketUrl } from "./env";
import type {
  LeaderboardResponse,
  SocketSessionStartedPayload,
  SocketSessionStoppedPayload,
} from "./types";

export interface PeerPodSocketEvents {
  "session.started": (payload: SocketSessionStartedPayload) => void;
  "session.stopped": (payload: SocketSessionStoppedPayload) => void;
  "leaderboard.updated": (payload: LeaderboardResponse) => void;
}

export interface PeerPodClientEvents {
  "pod.join": (payload: { groupId: number }) => void;
  "pod.leave": (payload: { groupId: number }) => void;
}

export function createPeerPodSocket(
  token: string,
): Socket<PeerPodSocketEvents, PeerPodClientEvents> {
  const url = getSocketUrl();

  return io(url, {
    autoConnect: true,
    auth: { token },
    // Prefer websocket; polling still works through the same-origin proxy.
    transports: ["websocket", "polling"],
    path: "/socket.io",
    withCredentials: true,
  });
}
