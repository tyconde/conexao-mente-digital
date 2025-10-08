import { useState, useEffect } from "react";
import { useNotifications } from "./useNotifications";

export interface Message {
  id: number;
  senderId: string;
  senderName: string;       // Agora será o nome real
  senderType: "patient" | "professional";
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  read: boolean;
  appointmentId?: number;
}

export interface Conversation {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export const useMessages = (userId?: string, userType?: "patient" | "professional", userName?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (userId && userType) {
      loadConversations();
    }
  }, [userId, userType]);

  const loadConversations = () => {
    const saved = localStorage.getItem("conversations");
    if (saved) {
      const all = JSON.parse(saved);
      const filtered = all.filter((conv: Conversation) => 
        userType === "patient" ? conv.patientId === userId : conv.professionalId === userId
      );
      setConversations(filtered);
    }
  };

  const sendMessage = (receiverId: string, receiverName: string, content: string) => {
    if (!userId || !userType || !userName) return;

    const conversationId = userType === "patient" 
      ? `${userId}-${receiverId}` 
      : `${receiverId}-${userId}`;

    const newMessage: Message = {
      id: Date.now(),
      senderId: userId,
      senderName: userName,     // ✅ Aqui passamos o nome real
      senderType: userType,
      receiverId,
      receiverName,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };

    const saved = localStorage.getItem("conversations");
    const all = saved ? JSON.parse(saved) : [];
    
    const existingIndex = all.findIndex((conv: Conversation) => conv.id === conversationId);
    
    if (existingIndex >= 0) {
      all[existingIndex].messages.push(newMessage);
      all[existingIndex].lastMessage = content;
      all[existingIndex].lastMessageTime = newMessage.timestamp;
      if (userType === "professional") {
        all[existingIndex].unreadCount = 0;
      } else {
        all[existingIndex].unreadCount++;
      }
    } else {
      const newConversation: Conversation = {
        id: conversationId,
        patientId: userType === "patient" ? userId : receiverId,
        patientName: userType === "patient" ? userName : receiverName,
        professionalId: userType === "professional" ? userId : receiverId,
        professionalName: userType === "professional" ? userName : receiverName,
        lastMessage: content,
        lastMessageTime: newMessage.timestamp,
        unreadCount: userType === "patient" ? 0 : 1,
        messages: [newMessage]
      };
      all.push(newConversation);
    }

    localStorage.setItem("conversations", JSON.stringify(all));
    loadConversations();

    // Envia notificação para o destinatário
    try {
      addNotification({
        type: "message",
        title: "Nova mensagem",
        message: `${userName} enviou uma mensagem: \"${content}\"`,
        fromUserId: Number(userId),
        fromUserName: userName || "",
        toUserId: Number(receiverId),
      });
    } catch (e) {
      // silenciar erros de notificação para não quebrar envio de mensagens
    }
  };

  const markAsRead = (conversationId: string) => {
    const saved = localStorage.getItem("conversations");
    if (saved) {
      const all = JSON.parse(saved);
      const index = all.findIndex((conv: Conversation) => conv.id === conversationId);
      
      if (index >= 0) {
        all[index].unreadCount = 0;
        all[index].messages.forEach((msg: Message) => {
          if (msg.receiverId === userId) {
            msg.read = true;
          }
        });
        
        localStorage.setItem("conversations", JSON.stringify(all));
        loadConversations();
      }
    }
  };

  return {
    conversations,
    sendMessage,
    markAsRead
  };
};
