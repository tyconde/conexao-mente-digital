
import { useEffect, useState, useRef } from "react";
import { connectSocket, getSocket } from "@/lib/realtime";

export interface Message {
  id: number;
  senderId: string;
  senderName: string;
  senderType: "patient" | "professional";
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  read: boolean;
  appointmentId?: number;
}

export interface Conversation {
  id: string; // room id
  patientId?: string;
  professionalId?: string;
  patientName?: string;
  professionalName?: string;
  messages: Message[];
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export const useRealtimeMessages = (opts?: { serverUrl?: string, userId?: string, userType?: "patient" | "professional" }) => {
  const serverUrl = opts?.serverUrl || "http://localhost:4000";
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = connectSocket(serverUrl);

    const socket = socketRef.current;
    if (!socket) return;

    socket.on("connect", () => {
      console.log("connected to realtime server", socket.id);
    });

    socket.on("room_history", ({ roomId, messages }) => {
      setConversations(prev => {
        const existing = prev.find(c => c.id === roomId);
        if (existing) {
          return prev.map(c => c.id === roomId ? { ...c, messages } : c);
        } else {
          const newConv = {
            id: roomId,
            messages,
            lastMessage: messages?.length ? messages[messages.length-1].content : undefined,
            lastMessageTime: messages?.length ? messages[messages.length-1].timestamp : undefined
          };
          return [...prev, newConv];
        }
      });
    });

    socket.on("new_message", ({ roomId, message }) => {
      setConversations(prev => {
        const existing = prev.find(c => c.id === roomId);
        if (existing) {
          return prev.map(c => c.id === roomId ? { ...c, messages: [...c.messages, message], lastMessage: message.content, lastMessageTime: message.timestamp, unreadCount: (c.unreadCount || 0) + 1 } : c);
        } else {
          const newConv = { id: roomId, messages: [message], lastMessage: message.content, lastMessageTime: message.timestamp, unreadCount: 1 };
          return [...prev, newConv];
        }
      });
    });

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("room_history");
        socket.off("new_message");
      }
    };
  }, [serverUrl]);

  const joinRoom = (roomId: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("join_room", { roomId });
  };

  const leaveRoom = (roomId: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("leave_room", { roomId });
  };

  const sendMessage = (roomId: string, message: Message) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("send_message", { roomId, message });
    // optimistic update
    setConversations(prev => {
      const existing = prev.find(c => c.id === roomId);
      if (existing) {
        return prev.map(c => c.id === roomId ? { ...c, messages: [...c.messages, message], lastMessage: message.content, lastMessageTime: message.timestamp } : c);
      } else {
        const newConv = { id: roomId, messages: [message], lastMessage: message.content, lastMessageTime: message.timestamp };
        return [...prev, newConv];
      }
    });
  };

  const markAsRead = (roomId: string) => {
    setConversations(prev => prev.map(c => c.id === roomId ? { ...c, unreadCount: 0 } : c));
  };

  return {
    conversations,
    sendMessage,
    joinRoom,
    leaveRoom,
    markAsRead
  };
};
