
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Clock } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { MessagesModal } from "./MessagesModal";

export const ProfessionalMessages = () => {
  const [showMessages, setShowMessages] = useState(false);
  const { user } = useAuth();
  const { conversations } = useMessages(user?.email, "professional");

  const totalUnread = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Mensagens dos Pacientes
            </div>
            <Button onClick={() => setShowMessages(true)}>
              Ver Todas as Mensagens
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhuma mensagem ainda</p>
              <p className="text-sm text-gray-500 mt-1">
                Os pacientes podem enviar mensagens através do seu perfil
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {conversations.length} conversas ativas
                  </span>
                </div>
                {totalUnread > 0 && (
                  <Badge variant="destructive">
                    {totalUnread} não lidas
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                {conversations.slice(0, 3).map((conversation) => (
                  <Card key={conversation.id} className="hover:bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">
                              {conversation.patientName}
                            </h4>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount} nova(s)
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {conversation.lastMessage}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {conversations.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  E mais {conversations.length - 3} conversas...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <MessagesModal
        isOpen={showMessages}
        onClose={() => setShowMessages(false)}
      />
    </>
  );
};
