import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessagesModal } from "./MessagesModal";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const FloatingMessagesButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // ✅ Sempre defina os valores, mesmo se o user ainda não existir
  const userType = user?.type === "professional" ? "professional" : "patient";
  const userName = user?.name || "Usuário";

  // ✅ Chama o hook sempre, com valores padrão seguros
  const { conversations } = useMessages(user?.id?.toString() || "", userType, userName);

  // ❗️Somente agora fazemos o retorno condicional
  if (!user) return null;

  const totalUnread = conversations.reduce(
    (total, conv) => total + (conv.unreadCount || 0),
    0
  );

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg",
          "hover:scale-110 transition-transform z-50",
          "bg-primary hover:bg-primary/90"
        )}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        {totalUnread > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs rounded-full"
          >
            {totalUnread > 9 ? "9+" : totalUnread}
          </Badge>
        )}
      </Button>

      <MessagesModal
        open={isOpen}
        onOpenChange={setIsOpen}
        userId={user?.id?.toString() || ""}
        userType={userType}
      />
    </>
  );
};

