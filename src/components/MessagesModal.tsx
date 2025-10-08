import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send } from "lucide-react";
import { Conversation } from "@/hooks/useRealtimeMessages";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "../hooks/useMessages";

interface MessagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId?: string;
  recipientName?: string;
  userId: string;
  userType: "patient" | "professional"; // aqui muda de "psychologist" para "professional"
  initialConversationId?: string;
}

export const MessagesModal = ({
  open,
  onOpenChange,
  recipientId,
  recipientName,
  initialConversationId,
  userId,
}: MessagesModalProps) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();

const userType = user?.type === "professional" ? "professional" : "patient";
const userName = user?.name || "Usuário"; // aqui pega o nome do usuário logado
const { conversations, sendMessage, markAsRead } = useMessages(user?.id?.toString(), userType, userName);

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

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    if (selectedConversation) {
      const receiverId = userType === "patient" 
        ? selectedConversation.professionalId 
        : selectedConversation.patientId;
      const receiverName = userType === "patient" 
        ? selectedConversation.professionalName 
        : selectedConversation.patientName;

      sendMessage(receiverId, receiverName, newMessage);
      setNewMessage("");
    } else if (recipientId && recipientName) {
      sendMessage(recipientId, recipientName, newMessage);
      setNewMessage("");
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    markAsRead(conversation.id);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Mensagens
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-96 gap-4">
          {/* Lista de conversas */}
          <div className="w-1/3 border-r pr-4">
            <h3 className="font-medium mb-3">Conversas</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {conversations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma conversa ainda
                </p>
              ) : (
                conversations.map((conversation) => (
                  <Card 
                    key={conversation.id}
                    className={`cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id 
                        ? "bg-primary/10 border-primary" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm">
                          {userType === "patient" 
                            ? conversation.professionalName 
                            : conversation.patientName
                          }
                        </h4>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(conversation.lastMessageTime)}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            {selectedConversation || (recipientId && recipientName) ? (
              <>
                <div className="border-b pb-2 mb-3">
                  <h3 className="font-medium">
                    {selectedConversation 
                      ? (userType === "patient" 
                          ? selectedConversation.professionalName 
                          : selectedConversation.patientName)
                      : recipientName
                    }
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                  {(selectedConversation?.messages || []).map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id?.toString() ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.senderId === user?.id?.toString()
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-100 text-gray-900"
                      }`}>
                        {/* Exibe sempre o nome real do remetente */}
                        <p className="text-xs font-medium">
                          {message.senderName}
                        </p>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Selecione uma conversa para começar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
