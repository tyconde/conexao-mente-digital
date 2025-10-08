import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import { useProfessionalAppointments } from "@/hooks/useProfessionalAppointments";

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { updateAppointment } = useProfessionalAppointments();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notificationId: number) => {
    markAsRead(notificationId);
  };

  const handleConfirm = (appointmentId: number, notificationId: number) => {
    updateAppointment(appointmentId, { status: "confirmada" });
    markAsRead(notificationId);
    setIsOpen(false);
    // Força atualização disparando evento storage
    window.dispatchEvent(new Event("storage"));
  };

  const handleReject = (appointmentId: number, notificationId: number) => {
    updateAppointment(appointmentId, { status: "cancelada" });
    markAsRead(notificationId);
    setIsOpen(false);
    // Força atualização disparando evento storage
    window.dispatchEvent(new Event("storage"));
  };

  const handleMessage = (appointmentId: number) => {
    const savedAppointments = localStorage.getItem("appointments");
    if (!savedAppointments) return alert("Agendamentos não encontrados.");

    const allAppointments = JSON.parse(savedAppointments);
    const appointment = allAppointments.find(
      (apt: any) => apt.id === appointmentId
    );

    if (!appointment) return alert("Agendamento não encontrado.");
    if (!appointment.patientEmail) return alert("Email do paciente não encontrado.");

    const email = appointment.patientEmail;
    window.location.href = `mailto:${email}?subject=Sobre sua consulta&body=Olá ${appointment.patientName},`;
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Notificações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      De: {notification.fromUserName}
                    </p>

                    {notification.type === "appointment_request" && (
                      <p className="text-xs text-gray-500 mt-2">
                        Solicitação recebida. Gerencie em Painel → Agendamentos.
                      </p>
                    )}

                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma notificação</p>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
