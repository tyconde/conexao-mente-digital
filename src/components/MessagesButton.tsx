import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";

interface MessagesButtonProps {
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
  showLabel?: boolean;
}

export const MessagesButton = ({ onClick, variant = "default", showLabel = true }: MessagesButtonProps) => {
  const { user } = useAuth();
  const userType = user?.type === "professional" ? "professional" : "patient";
  const userName = user?.name || "Usuário";
  const { conversations } = useMessages(user?.id?.toString(), userType, userName);

  const totalUnread = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);

  return (
    <Button 
      variant={variant} 
      onClick={onClick}
      className="relative"
    >
      <MessageCircle className="w-4 h-4" />
      {showLabel && <span className="ml-2">Mensagens</span>}
      {totalUnread > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {totalUnread > 9 ? "9+" : totalUnread}
        </Badge>
      )}
    </Button>
  );
};
