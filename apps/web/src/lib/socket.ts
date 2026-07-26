"use client";

import { io, type Socket } from "socket.io-client";

const API_BASE_URL =
  process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";
const AUTH_STORAGE_KEY = "projecthub-auth";

let socket: Socket | null = null;

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { tokens?: { accessToken?: string } };
    };
    return parsed.state?.tokens?.accessToken ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns a shared Socket.IO client, creating it on first use.
 * The auth callback re-reads the token on every (re)connect attempt, so a
 * token refreshed by the REST client's silent-refresh logic is picked up
 * automatically on the next reconnect without needing to recreate the socket.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${API_BASE_URL}/realtime`, {
      autoConnect: false,
      transports: ["websocket"],
      auth: (cb) => cb({ token: getAccessToken() }),
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
