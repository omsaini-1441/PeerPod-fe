import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "./env";
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
  return io(SOCKET_URL, {
    autoConnect: true,
    auth: { token },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
