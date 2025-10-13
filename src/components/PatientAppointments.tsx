import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Monitor, X, MessageCircle } from "lucide-react";
import { useProfessionalAppointments } from "@/hooks/useProfessionalAppointments";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { MessagesModal } from "./MessagesModal";

export const PatientAppointments = () => {
  const { user } = useAuth();
  const { updateAppointment } = useProfessionalAppointments();
  const [showMessages, setShowMessages] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<{id: string, name: string} | null>(null);
  const [userAppointments, setUserAppointments] = useState<any[]>([]);

  // Carrega agendamentos do paciente e atualiza em tempo real
  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem("appointments");
      const all = saved ? JSON.parse(saved) : [];
      const normalized = all.map((a: any) => ({
        ...a,
        id: Number(a.id),
        professionalId: Number(a.professionalId),
        patientId: typeof a.patientId === "string" ? a.patientId : Number(a.patientId),
      }));
      const filtered = normalized.filter(
        (apt: any) => apt.patientEmail === user?.email || String(apt.patientId) === String(user?.id)
      );
      setUserAppointments(filtered);
    };

    load();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "appointments") load();
    };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(load, 2000);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, [user?.email, user?.id]);

  const handleCancelAppointment = (id: number) => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      updateAppointment(id, { 
        status: "cancelada",
        notes: "Cancelado pelo paciente"
      });
      // Atualiza imediatamente a lista local
      setUserAppointments(prev => prev.map(ap => ap.id === id ? { ...ap, status: "cancelada", notes: "Cancelado pelo paciente" } : ap));
    }
  };

  const handleSendMessage = (professionalId: number, professionalName: string) => {
    setSelectedProfessional({
      id: professionalId.toString(),
      name: professionalName
    });
    setShowMessages(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmada":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Confirmada
          </Badge>
        );
      case "pendente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pendente
          </Badge>
        );
      case "cancelada":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Cancelada
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAppointmentNotes = (appointment: any) => {
    if (appointment.status === "confirmada") {
      return "Consulta confirmada pelo profissional";
    } else if (appointment.status === "cancelada") {
      return appointment.notes || "Consulta cancelada";
    }
    return "Solicitação de agendamento - aguardando confirmação";
  };

  const formatDate = (dateStr: string) => {
    // Parse date in UTC to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'America/Sao_Paulo'
    });
  };

  if (userAppointments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Você ainda não possui agendamentos.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Meus Agendamentos</h3>
        {userAppointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-lg">
                        {appointment.professionalName || "Profissional"}
                      </h4>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {appointment.type}
                    </p>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 mt-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {appointment.attendanceType === "presencial" ? (
                        <MapPin className="w-4 h-4" />
                      ) : (
                        <Monitor className="w-4 h-4" />
                      )}
                      <span>
                        {appointment.attendanceType === "presencial" 
                          ? "Atendimento Presencial" 
                          : "Atendimento Online"
                        }
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    {getAppointmentNotes(appointment)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage(appointment.professionalId, appointment.professionalName || "Profissional")}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Mensagem
                  </Button>
                  
                  {appointment.status !== "cancelada" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <MessagesModal
        open={showMessages}
        onOpenChange={setShowMessages}
        recipientId={selectedProfessional?.id}
        recipientName={selectedProfessional?.name}
        userId={user?.id?.toString() || ""}
        userType="patient"
      />
    </>
  );
};
