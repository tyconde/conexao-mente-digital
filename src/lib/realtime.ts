
// Socket wrapper using socket.io-client
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (serverUrl: string) => {
  if (!socket) {
    socket = io(serverUrl);
  }
  return socket;
};

export const getSocket = () => socket;
