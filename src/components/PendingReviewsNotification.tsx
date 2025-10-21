import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useReviews } from "@/hooks/useReviews";
import { ReviewModal } from "./ReviewModal";

export const PendingReviewsNotification = () => {
  const { user } = useAuth();
  const { hasReviewedAppointment } = useReviews();
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [dismissed, setDismissed] = useState<number[]>([]);

  useEffect(() => {
    if (!user || user.type !== "patient") return;

    const loadPendingReviews = () => {
      // Buscar consultas confirmadas que já passaram e ainda não foram avaliadas
      const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const pending = appointments.filter((apt: any) => {
        // Verificar se é uma consulta do paciente logado
        const isUserAppointment = 
          apt.patientEmail === user.email || 
          String(apt.patientId) === String(user.id);
        
        if (!isUserAppointment) return false;

        // Verificar se está confirmada
        if (apt.status !== "confirmada") return false;

        // Verificar se já passou
        const [year, month, day] = apt.date.split('-').map(Number);
        const aptDate = new Date(year, month - 1, day);
        aptDate.setHours(0, 0, 0, 0);
        
        if (aptDate >= today) return false;

        // Verificar se já foi avaliada
        if (hasReviewedAppointment(apt.id, user.id)) return false;

        // Verificar se foi dispensada
        if (dismissed.includes(apt.id)) return false;

        return true;
      });

      setPendingAppointments(pending);
    };

    loadPendingReviews();
  }, [user, dismissed]); // Removido hasReviewedAppointment das dependências

  const handleDismiss = (appointmentId: number) => {
    setDismissed([...dismissed, appointmentId]);
  };

  const handleReview = (appointment: any) => {
    setSelectedAppointment(appointment);
  };

  if (!user || user.type !== "patient" || pendingAppointments.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Star className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Você tem {pendingAppointments.length} consulta{pendingAppointments.length > 1 ? 's' : ''} para avaliar
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Ajude outros pacientes compartilhando sua experiência!
              </p>
              
              <div className="space-y-2">
                {pendingAppointments.slice(0, 3).map((apt) => (
                  <div 
                    key={apt.id} 
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-yellow-100"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{apt.professionalName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.time}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReview(apt)}
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Avaliar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismiss(apt.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {pendingAppointments.length > 3 && (
                <p className="text-xs text-gray-500 mt-2">
                  E mais {pendingAppointments.length - 3} consulta{pendingAppointments.length - 3 > 1 ? 's' : ''}...
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedAppointment && user && (
        <ReviewModal
          isOpen={!!selectedAppointment}
          onClose={() => {
            setSelectedAppointment(null);
            setDismissed([...dismissed, selectedAppointment.id]);
          }}
          appointment={selectedAppointment}
          patientId={user.id}
          patientName={user.name}
        />
      )}
    </>
  );
};
