import { io, type Socket } from 'socket.io-client';
import { SESSION_TOKEN_KEY } from '../api/client';

let socket: Socket | null = null;

function buildSocket(): Socket {
  return io(
    `${import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/session`,
    {
      withCredentials: true,
      auth: { token: localStorage.getItem(SESSION_TOKEN_KEY) ?? '' },
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    },
  );
}

/** Returns the singleton socket, creating it if needed. */
export function getSocket(): Socket {
  if (!socket) socket = buildSocket();
  return socket;
}

/** Connect and return the socket. Safe to call multiple times. */
export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

/**
 * Disconnect and destroy the socket instance.
 * Call on sign-out so the next sign-in gets a fresh connection with the new token.
 */
export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
