import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Circle, Video } from "lucide-react";
import { Conversation, Message } from "@/hooks/useMessages";
import { cn } from "@/lib/utils";
import { parse, differenceInMinutes } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  conversation: Conversation | null;
  recipientName?: string;
  userId?: string;
  userType: "patient" | "professional";
  onSendMessage: (content: string) => void;
  appointmentId?: number;
}

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

export const ChatInterface = ({ 
  conversation, 
  recipientName,
  userId,
  userType,
  onSendMessage,
  appointmentId
}: ChatInterfaceProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Buscar appointment se appointmentId foi passado
  const appointment = appointmentId ? (() => {
    try {
      const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
      return appointments.find((apt: any) => apt.id === appointmentId);
    } catch {
      return null;
    }
  })() : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Verificar se pode enviar link de videochamada
  const canSendMeetLink = () => {
    if (!appointment || userType !== "professional") return false;
    if (appointment.status !== "confirmada") return false;
    if (appointment.attendanceType !== "remoto") return false;
    if (!appointment.meetLink) return false;
    
    try {
      const appointmentDateTime = parse(
        `${appointment.date} ${appointment.time}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );
      const now = new Date();
      const minutesUntilAppointment = differenceInMinutes(appointmentDateTime, now);
      
      // Permitir envio até 60 minutos antes E até 30 minutos depois do início
      return minutesUntilAppointment <= 60 && minutesUntilAppointment >= -30;
    } catch {
      return false;
    }
  };

  const handleSendMeetLink = () => {
    if (!appointment?.meetLink) return;
    
    const linkMessage = `📹 Link da videochamada: ${appointment.meetLink}\n\nClique no link acima para entrar na consulta.`;
    onSendMessage(linkMessage);
    setLinkSent(true);
    
    toast({
      title: "Link enviado!",
      description: "O link da videochamada foi enviado ao paciente.",
    });
  };

  if (!conversation && !recipientName) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground">
          <Circle className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Selecione uma conversa</p>
          <p className="text-sm mt-1">Escolha uma conversa para começar a mensagem</p>
        </div>
      </div>
    );
  }

  const displayName = conversation 
    ? (userType === "patient" 
        ? conversation.professionalName 
        : conversation.patientName)
    : recipientName;

  const recipientId = conversation
    ? (userType === "patient" 
        ? conversation.professionalId 
        : conversation.patientId)
    : undefined;

  const recipientImage = recipientId ? getUserProfileImage(recipientId) : "";

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={recipientImage} alt={displayName} className="object-cover" />
            <AvatarFallback>
              {displayName?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{displayName}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 max-h-[calc(85vh-200px)]">
        {conversation?.messages && conversation.messages.length > 0 ? (
          <>
            {conversation.messages.map((message: Message) => {
              const isOwn = message.senderId === userId;
              const senderInitial = message.senderName?.charAt(0).toUpperCase() || "?";
              const senderImage = getUserProfileImage(message.senderId);
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  {/* Avatar para mensagens de outros */}
                  {!isOwn && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={senderImage} alt={message.senderName} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {senderInitial}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
                      isOwn 
                        ? "bg-primary text-primary-foreground rounded-br-none" 
                        : "bg-background border rounded-bl-none"
                    )}
                  >
                    <p className={cn(
                      "text-xs font-medium mb-1",
                      isOwn ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {message.senderName}
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p className={cn(
                      "text-xs mt-1",
                      isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                    )}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  
                  {/* Avatar para mensagens próprias */}
                  {isOwn && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={senderImage} alt={message.senderName} className="object-cover" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {senderInitial}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Nenhuma mensagem ainda. Comece a conversa!</p>
          </div>
        )}
      </div>

      {/* Campo de digitação */}
      <div className="p-4 border-t bg-background space-y-3">
        {/* Botão de enviar link de videochamada (apenas para profissionais) */}
        {canSendMeetLink() && (
          <div className="flex justify-center">
            <Button
              onClick={handleSendMeetLink}
              disabled={linkSent}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Video className="w-4 h-4" />
              {linkSent ? "Link da videochamada enviado" : "Enviar link de videochamada"}
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="min-h-[60px] max-h-[120px] resize-none"
            rows={2}
          />
          <Button 
            onClick={handleSend} 
            disabled={!newMessage.trim()}
            size="lg"
            className="self-end"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
};
