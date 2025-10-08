
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Monitor, X, MessageCircle } from "lucide-react";
import { useProfessionalAppointments } from "@/hooks/useProfessionalAppointments";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { MessagesModal } from "./MessagesModal";

export const PatientAppointments = () => {
  const { user } = useAuth();
  const { appointments, updateAppointment } = useProfessionalAppointments();
  const [showMessages, setShowMessages] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<{id: string, name: string} | null>(null);

  // Filtrar apenas agendamentos do usuário logado
  const userAppointments = appointments.filter(apt => 
    apt.patientEmail === user?.email
  );

  const handleCancelAppointment = (id: number) => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      updateAppointment(id, { 
        status: "cancelada",
        notes: "Cancelado pelo paciente"
      });
    }
  };

  const handleSendMessage = (professionalId: number, professionalName: string) => {
    setSelectedProfessional({
      id: professionalId.toString(),
      name: professionalName
    });
    setShowMessages(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmada":
        return "default";
      case "pendente":
        return "secondary";
      case "cancelada":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmada":
        return "Confirmada";
      case "pendente":
        return "Pendente";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
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
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
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
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-lg">
                      Consulta - {appointment.type}
                    </h4>
                    <Badge variant={getStatusBadgeVariant(appointment.status)}>
                      {getStatusLabel(appointment.status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
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
                    onClick={() => handleSendMessage(appointment.professionalId, "Profissional")}
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
