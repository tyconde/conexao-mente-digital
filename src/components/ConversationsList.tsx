import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Pin, Clock, Filter, UserPlus, MessageSquarePlus } from "lucide-react";
import { Conversation } from "@/hooks/useMessages";
import { cn } from "@/lib/utils";
import { AvailableContact } from "@/hooks/useAvailableContacts";

// Helper para buscar foto de perfil
const getUserProfileImage = (userId: string): string => {
  try {
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const user = registeredUsers.find((u: any) => String(u.id) === String(userId));
    return user?.profileImage || "";
  } catch {
    return "";
  }
};

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  userType: "patient" | "professional";
  availableContacts: AvailableContact[];
  onStartNewChat: (contact: AvailableContact) => void;
}

type FilterType = "all" | "unread" | "recent";

export const ConversationsList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  userType,
  availableContacts,
  onStartNewChat
}: ConversationsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [showNewChatSection, setShowNewChatSection] = useState(false);

  const togglePin = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedIds(prev => 
      prev.includes(conversationId) 
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  const filteredConversations = conversations
    .filter(conv => {
      const contactName = userType === "patient" 
        ? conv.professionalName 
        : conv.patientName;
      const matchesSearch = contactName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      
      if (activeFilter === "unread") return matchesSearch && (conv.unreadCount || 0) > 0;
      if (activeFilter === "recent") {
        const lastMsgTime = new Date(conv.lastMessageTime || 0).getTime();
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return matchesSearch && lastMsgTime > oneDayAgo;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      const aIsPinned = pinnedIds.includes(a.id);
      const bIsPinned = pinnedIds.includes(b.id);
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime();
    });

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Filtrar contatos disponíveis que ainda não têm conversa
  const contactsWithoutConversation = availableContacts.filter(contact => {
    const conversationId = userType === "patient"
      ? `${contact.id}-${contact.id}` // Isso será corrigido na lógica de criação
      : `${contact.id}-${contact.id}`;
    return !conversations.some(conv => 
      (userType === "patient" && conv.professionalId === contact.id) ||
      (userType === "professional" && conv.patientId === contact.id)
    );
  });

  return (
    <div className="flex flex-col h-full">
      {/* Busca e Botão Nova Conversa */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Botão para nova conversa */}
        {contactsWithoutConversation.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewChatSection(!showNewChatSection)}
            className="w-full"
          >
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            {showNewChatSection ? "Ocultar contatos" : "Nova conversa"}
          </Button>
        )}

        {/* Filtros rápidos */}
        <div className="flex gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
            className="flex-1 text-xs"
          >
            Todas
          </Button>
          <Button
            variant={activeFilter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("unread")}
            className="flex-1 text-xs"
          >
            <Filter className="w-3 h-3 mr-1" />
            Não lidas
          </Button>
          <Button
            variant={activeFilter === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("recent")}
            className="flex-1 text-xs"
          >
            <Clock className="w-3 h-3 mr-1" />
            Recentes
          </Button>
        </div>
      </div>

      {/* Seção de novos contatos */}
      {showNewChatSection && contactsWithoutConversation.length > 0 && (
        <div className="border-b bg-muted/30">
          <div className="p-3 bg-background border-b">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Selecione o {userType === "patient" ? "profissional" : "paciente"} para conversar
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Contatos disponíveis (consultas confirmadas ou histórico de atendimento)
            </p>
          </div>
          <div className="max-h-[200px] overflow-y-auto divide-y">
            {contactsWithoutConversation.map((contact) => (
              <div
                key={contact.id}
                onClick={() => onStartNewChat(contact)}
                className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage 
                      src={getUserProfileImage(contact.id)} 
                      alt={contact.name} 
                      className="object-cover" 
                    />
                    <AvatarFallback>
                      {contact.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {contact.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Consulta em {new Date(contact.appointmentDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <MessageSquarePlus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 && !showNewChatSection ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {availableContacts.length === 0 
                ? "Você ainda não possui histórico de consultas para iniciar uma conversa."
                : searchTerm 
                  ? "Nenhuma conversa encontrada" 
                  : "Nenhuma conversa ainda"}
            </p>
            {availableContacts.length > 0 && !searchTerm && (
              <p className="text-xs text-muted-foreground">
                Clique em "Nova conversa" para começar
              </p>
            )}
          </div>
        ) : filteredConversations.length === 0 && showNewChatSection ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "Nenhuma conversa encontrada" : "Todas as conversas estão acima"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const contactName = userType === "patient" 
                ? conversation.professionalName 
                : conversation.patientName;
              const contactId = userType === "patient"
                ? conversation.professionalId
                : conversation.patientId;
              const contactImage = contactId ? getUserProfileImage(contactId) : "";
              const isPinned = pinnedIds.includes(conversation.id);
              const isSelected = selectedConversation?.id === conversation.id;
              const hasUnread = (conversation.unreadCount || 0) > 0;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    "p-4 cursor-pointer transition-colors hover:bg-accent/50 relative",
                    isSelected && "bg-accent",
                    hasUnread && "bg-primary/5"
                  )}
                >
                  {hasUnread && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}

                  <div className="flex gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={contactImage} 
                        alt={contactName} 
                        className="object-cover" 
                      />
                      <AvatarFallback>
                        {contactName?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={cn(
                          "font-medium text-sm truncate",
                          hasUnread && "font-semibold"
                        )}>
                          {contactName}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {isPinned && (
                            <Pin className="w-3 h-3 text-primary fill-current" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          "text-sm text-muted-foreground line-clamp-1",
                          hasUnread && "font-medium text-foreground"
                        )}>
                          {conversation.lastMessage}
                        </p>
                        {hasUnread && (
                          <Badge 
                            variant="default" 
                            className="h-5 min-w-[20px] flex items-center justify-center px-1.5 text-xs flex-shrink-0"
                          >
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => togglePin(conversation.id, e)}
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                    >
                      <Pin className={cn(
                        "w-4 h-4",
                        isPinned && "fill-current text-primary"
                      )} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
