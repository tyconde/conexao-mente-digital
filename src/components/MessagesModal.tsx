import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import { Conversation } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { useAvailableContacts, AvailableContact } from "@/hooks/useAvailableContacts";
import { ConversationsList } from "./ConversationsList";
import { ChatInterface } from "./ChatInterface";

interface MessagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId?: string;
  recipientName?: string;
  userId: string;
  userType: "patient" | "professional";
  initialConversationId?: string;
  appointmentId?: number;
}

export const MessagesModal = ({
  open,
  onOpenChange,
  recipientId,
  recipientName,
  initialConversationId,
  appointmentId,
}: MessagesModalProps) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { user } = useAuth();

  const userType = user?.type === "professional" ? "professional" : "patient";
  const userName = user?.name || "Usuário";
  const { conversations, sendMessage, markAsRead } = useMessages(user?.id?.toString(), userType, userName);
  const { contacts: availableContacts } = useAvailableContacts(user?.id?.toString(), userType);

  useEffect(() => {
    if (!open || !initialConversationId) return;
    const conv = conversations.find(c => c.id === initialConversationId);
    if (conv) {
      setSelectedConversation(conv);
      markAsRead(conv.id);
    }
  }, [open, initialConversationId, conversations, markAsRead]);

  useEffect(() => {
    if (selectedConversation) {
      const updatedConv = conversations.find(c => c.id === selectedConversation.id);
      if (updatedConv) {
        setSelectedConversation(updatedConv);
      }
    }
  }, [conversations, selectedConversation]);

  useEffect(() => {
    if (!open) {
      setSelectedConversation(null);
    }
  }, [open]);

  const handleSendMessage = (content: string) => {
    if (!user) return;

    if (selectedConversation) {
      const receiverId = userType === "patient" 
        ? selectedConversation.professionalId 
        : selectedConversation.patientId;
      const receiverName = userType === "patient" 
        ? selectedConversation.professionalName 
        : selectedConversation.patientName;

      sendMessage(receiverId || "", receiverName || "", content);
    } else if (recipientId && recipientName) {
      sendMessage(recipientId, recipientName, content);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    markAsRead(conversation.id);
  };

  const handleStartNewChat = (contact: AvailableContact) => {
    // Verificar se já existe conversa com este contato
    const existingConv = conversations.find(conv => 
      (userType === "patient" && conv.professionalId === contact.id) ||
      (userType === "professional" && conv.patientId === contact.id)
    );

    if (existingConv) {
      setSelectedConversation(existingConv);
      markAsRead(existingConv.id);
    } else {
      // Criar uma conversa temporária para iniciar o chat
      const newConv: Conversation = {
        id: userType === "patient" ? `${user?.id}-${contact.id}` : `${contact.id}-${user?.id}`,
        patientId: userType === "patient" ? user?.id?.toString() || "" : contact.id,
        patientName: userType === "patient" ? userName : contact.name,
        professionalId: userType === "professional" ? user?.id?.toString() || "" : contact.id,
        professionalName: userType === "professional" ? userName : contact.name,
        lastMessage: "",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        messages: []
      };
      setSelectedConversation(newConv);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Mensagens
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full">
          {/* Lista de conversas - 35% */}
          <div className="w-[35%] border-r">
            <ConversationsList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              userType={userType}
              availableContacts={availableContacts}
              onStartNewChat={handleStartNewChat}
            />
          </div>

          {/* Chat - 65% */}
          <div className="flex-1">
            <ChatInterface
              conversation={selectedConversation}
              recipientName={recipientName}
              userId={user?.id?.toString()}
              userType={userType}
              onSendMessage={handleSendMessage}
              appointmentId={appointmentId}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
