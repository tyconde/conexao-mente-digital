import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Monitor, X, MessageCircle, ArrowLeft, CheckCircle, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { MessagesModal } from "@/components/MessagesModal";
import { Navigation } from "@/components/Navigation";
import { PendingReviewsNotification } from "@/components/PendingReviewsNotification";
import { useNavigate } from "react-router-dom";
import { ReviewModal } from "@/components/ReviewModal";
import { useReviews } from "@/hooks/useReviews";
import { parse, isBefore, differenceInMinutes } from "date-fns";

export default function Appointments() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const { hasReviewedAppointment } = useReviews();
  const [showMessages, setShowMessages] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<{id: string, name: string} | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | undefined>(undefined);
  const [userAppointments, setUserAppointments] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [pendingReviewAppointment, setPendingReviewAppointment] = useState<any>(null);
  const [reviewedInSession, setReviewedInSession] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  // Verifica se uma consulta já passou da data/hora
  const isAppointmentPast = (appointment: any): boolean => {
    try {
      const appointmentDateTime = parse(
        `${appointment.date} ${appointment.time}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );
      return isBefore(appointmentDateTime, new Date());
    } catch (error) {
      console.error("Erro ao verificar data da consulta:", error);
      return false;
    }
  };

  // Verifica se o link de videochamada deve ser exibido (30 minutos antes)
  const shouldShowMeetLink = (appointment: any): boolean => {
    if (appointment.status !== "confirmada" || appointment.attendanceType !== "remoto") {
      return false;
    }

    try {
      const appointmentDateTime = parse(
        `${appointment.date} ${appointment.time}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );
      const now = new Date();
      const minutesUntilAppointment = differenceInMinutes(appointmentDateTime, now);
      
      // Exibir link se faltar 30 minutos ou menos e a consulta ainda não passou
      return minutesUntilAppointment <= 30 && minutesUntilAppointment >= 0;
    } catch (error) {
      console.error("Erro ao verificar tempo da consulta:", error);
      return false;
    }
  };

  // Finaliza automaticamente consultas que passaram do prazo
  const autoFinalizeAppointments = (allAppointments: any[]): any[] => {
    let updated = false;
    const updatedAppointments = allAppointments.map(apt => {
      if (apt.status === "confirmada" && isAppointmentPast(apt)) {
        updated = true;
        return { ...apt, status: "finalizada" };
      }
      return apt;
    });

    if (updated) {
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'appointments',
        newValue: JSON.stringify(updatedAppointments)
      }));
    }

    return updatedAppointments;
  };

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem("appointments");
      let all = saved ? JSON.parse(saved) : [];
      
      // Finaliza automaticamente consultas que passaram do prazo
      all = autoFinalizeAppointments(all);
      
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

      // Verifica se há consultas finalizadas sem avaliação e abre modal automaticamente
      const finishedWithoutReview = filtered.find(
        (apt: any) => apt.status === "finalizada" && 
        !hasReviewedAppointment(apt.id, user?.id || 0) &&
        !reviewedInSession.has(apt.id)
      );

      if (finishedWithoutReview && !showReviewModal) {
        setPendingReviewAppointment(finishedWithoutReview);
        setSelectedAppointment(finishedWithoutReview);
        setShowReviewModal(true);
      }
    };

    load();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "appointments") load();
    };
    window.addEventListener("storage", onStorage);
    // Atualiza a cada 60 segundos para verificar se o link deve aparecer
    const interval = setInterval(load, 60000);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, [user?.email, user?.id]);

  const handleCancelAppointment = (id: number) => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      const saved = localStorage.getItem("appointments");
      const all = saved ? JSON.parse(saved) : [];
      const index = all.findIndex((a: any) => Number(a.id) === Number(id));
      if (index !== -1) {
        const ap = all[index];
        const updated = { ...ap, status: "cancelada", notes: "Cancelado pelo paciente" };
        all[index] = updated;
        localStorage.setItem("appointments", JSON.stringify(all));

        // Notifica o profissional
        addNotification({
          type: "message",
          title: "Consulta cancelada pelo paciente",
          message: `${user?.name || "Paciente"} cancelou a consulta de ${updated.date} às ${updated.time}.`,
          appointmentId: id,
          fromUserId: user?.id || 0,
          fromUserName: user?.name || "Paciente",
          toUserId: Number(updated.professionalId),
        });

        setUserAppointments(prev => prev.map(appt => appt.id === id ? updated : appt));
        toast({ title: "Consulta cancelada", description: "O profissional foi notificado." });
      }
    }
  };

  const handleCompleteAppointment = (appointment: any) => {
    if (confirm("Deseja finalizar esta consulta?")) {
      const saved = localStorage.getItem("appointments");
      const all = saved ? JSON.parse(saved) : [];
      const index = all.findIndex((a: any) => Number(a.id) === Number(appointment.id));
      if (index !== -1) {
        const updated = { ...all[index], status: "finalizada" };
        all[index] = updated;
        localStorage.setItem("appointments", JSON.stringify(all));

        // Atualiza lista local
        setUserAppointments(prev => prev.map(appt => appt.id === appointment.id ? updated : appt));
        
        // Abre modal de avaliação
        setSelectedAppointment(updated);
        setShowReviewModal(true);
        
        toast({ title: "Consulta finalizada", description: "Avalie sua experiência!" });
      }
    }
  };

  const handleOpenReview = (appointment: any) => {
    setPendingReviewAppointment(null);
    setSelectedAppointment(appointment);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    // Marca a consulta como revisada nesta sessão para evitar reabertura
    if (selectedAppointment?.id) {
      setReviewedInSession(prev => new Set([...prev, selectedAppointment.id]));
    }
    setShowReviewModal(false);
    setSelectedAppointment(null);
    setPendingReviewAppointment(null);
  };

  const handleSendMessage = (professionalId: number, professionalName: string, appointmentId?: number) => {
    setSelectedProfessional({
      id: professionalId.toString(),
      name: professionalName
    });
    setSelectedAppointmentId(appointmentId);
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
      case "finalizada":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Finalizada
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
    } else if (appointment.status === "finalizada") {
      return "Consulta finalizada";
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

  // Separate appointments into future and past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureAppointments = userAppointments.filter(apt => {
    const [year, month, day] = apt.date.split('-').map(Number);
    const aptDate = new Date(year, month - 1, day);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status !== "cancelada" && apt.status !== "finalizada";
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = userAppointments.filter(apt => {
    const [year, month, day] = apt.date.split('-').map(Number);
    const aptDate = new Date(year, month - 1, day);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate < today || apt.status === "cancelada" || apt.status === "finalizada";
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderAppointmentCard = (appointment: any, showCancel: boolean) => (
    <Card key={appointment.id} data-appointment-id={appointment.id}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
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
                        {appointment.attendanceType === "remoto" && appointment.status === "confirmada" && (
                          <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded">
                            <Monitor className="w-4 h-4 text-blue-600" />
                            {shouldShowMeetLink(appointment) && appointment.meetLink ? (
                              <a 
                                href={appointment.meetLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 underline font-medium"
                              >
                                Entrar na sala de videochamada (Jitsi Meet)
                              </a>
                            ) : (
                              <span className="text-blue-600 font-medium">
                                O link da videochamada será disponibilizado cerca de 30 minutos antes do início da consulta
                              </span>
                            )}
                          </div>
                        )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage(appointment.professionalId, appointment.professionalName || "Profissional", appointment.id)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Mensagem
            </Button>
            
            {appointment.status === "confirmada" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCompleteAppointment(appointment)}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Finalizar
              </Button>
            )}

            {appointment.status === "finalizada" && !hasReviewedAppointment(appointment.id, user?.id || 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenReview(appointment)}
                className="text-yellow-600 hover:text-yellow-700"
              >
                <Star className="w-4 h-4 mr-1" />
                Avaliar
              </Button>
            )}
            
            {showCancel && appointment.status !== "cancelada" && appointment.status !== "finalizada" && (
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

        <p className="text-sm text-gray-500 mt-2">
          {getAppointmentNotes(appointment)}
        </p>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Acesso Restrito</h3>
            <p className="text-gray-600 mb-4">Você precisa fazer login para acessar seus agendamentos.</p>
            <Button onClick={() => navigate("/")}>Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Agendamentos</h1>
            <p className="text-gray-600">Gerencie suas consultas e histórico</p>
          </div>
          <Button variant="outline" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Notificação de Avaliações Pendentes */}
        <div className="mb-6">
          <PendingReviewsNotification />
        </div>

        <Tabs defaultValue="future" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="future">
              Consultas Futuras ({futureAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Histórico ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="future" className="space-y-4">
            {futureAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Você não possui consultas futuras.</p>
                </CardContent>
              </Card>
            ) : (
              futureAppointments.map(apt => renderAppointmentCard(apt, true))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Você não possui histórico de consultas.</p>
                </CardContent>
              </Card>
            ) : (
              pastAppointments.map(apt => renderAppointmentCard(apt, false))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MessagesModal
        open={showMessages}
        onOpenChange={(open) => {
          setShowMessages(open);
          if (!open) {
            setSelectedAppointmentId(undefined);
          }
        }}
        recipientId={selectedProfessional?.id}
        recipientName={selectedProfessional?.name}
        userId={user?.id?.toString() || ""}
        userType="patient"
        appointmentId={selectedAppointmentId}
      />

      {selectedAppointment && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={handleCloseReviewModal}
          appointment={selectedAppointment}
          patientId={user?.id || 0}
          patientName={user?.name || ""}
        />
      )}
    </div>
  );
}
