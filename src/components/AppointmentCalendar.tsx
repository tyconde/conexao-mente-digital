import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface AppointmentCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  psychologistId: number;
  psychologistName: string;
}

export const AppointmentCalendar = ({ isOpen, onClose, psychologistId, psychologistName }: AppointmentCalendarProps) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const { isDateAvailable, isTimeAvailable, getDaySchedule, professionalSettings } = useAvailableSlots(psychologistId);

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("Primeira consulta");
  const [attendanceType, setAttendanceType] = useState("remoto");
  const [notes, setNotes] = useState("");
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [hasHadAppointment, setHasHadAppointment] = useState(false);

  // Verificar se paciente já teve consulta com este profissional
  useEffect(() => {
    if (user && psychologistId && isOpen) {
      const savedAppointments = localStorage.getItem("appointments");
      if (savedAppointments) {
        const allAppointments = JSON.parse(savedAppointments);
        const hadAppointment = allAppointments.some((apt: any) => 
          (apt.patientId === user.id || apt.patientEmail === user.email) &&
          apt.professionalId === psychologistId &&
          apt.status === "confirmada"
        );
        setHasHadAppointment(hadAppointment);
        // Definir o tipo de consulta baseado no histórico
        if (hadAppointment) {
          setAppointmentType("Consulta de retorno");
        } else {
          setAppointmentType("Primeira consulta");
        }
      }
    }
  }, [user, psychologistId, isOpen]); // Removido appointmentType das dependências

  // Resetar selectedTime quando mudar de data
  useEffect(() => {
    setSelectedTime("");
  }, [selectedDate]);

  const generateTimeSlots = (date?: Date) => {
    const targetDate = date || selectedDate;
    if (!targetDate || !professionalSettings) return [];

    const dayOfWeek = targetDate.getDay();
    const weekDaysMap: { [key: number]: string } = {
      0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday",
      4: "thursday", 5: "friday", 6: "saturday"
    };

    const dayKey = weekDaysMap[dayOfWeek];
    const daySchedule = getDaySchedule(dayKey);
    if (!daySchedule || !daySchedule.enabled) return [];

    const slots = [];
    const [startHour, startMinute] = daySchedule.start.split(":").map(Number);
    const [endHour, endMinute] = daySchedule.end.split(":").map(Number);

    const now = new Date();
    const isToday = targetDate.toDateString() === now.toDateString();

    for (let hour = startHour; hour < endHour; hour++) {
      const time00 = `${hour.toString().padStart(2, "0")}:00`;
      const time30 = `${hour.toString().padStart(2, "0")}:30`;
      
      // Se for hoje, só adiciona horários futuros (com margem de 30 minutos)
      if (isToday) {
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
        const time00InMinutes = hour * 60;
        const time30InMinutes = hour * 60 + 30;
        
        // Adiciona o horário :00 se ainda estiver com pelo menos 30min de antecedência
        if (time00InMinutes >= currentTimeInMinutes + 30) {
          slots.push(time00);
        }
        
        // Adiciona o horário :30 se estiver dentro do range e com antecedência
        if (hour + 1 < endHour || (hour + 1 === endHour && endMinute >= 30)) {
          if (time30InMinutes >= currentTimeInMinutes + 30) {
            slots.push(time30);
          }
        }
      } else {
        slots.push(time00);
        if (hour + 1 < endHour || (hour + 1 === endHour && endMinute >= 30)) {
          slots.push(time30);
        }
      }
    }
    return slots;
  };

  const checkExistingAppointmentOnDate = (dateStr: string) => {
    if (!user) return null;
    
    const savedAppointments = localStorage.getItem("appointments");
    if (!savedAppointments) return null;
    
    const allAppointments = JSON.parse(savedAppointments);
    return allAppointments.find((apt: any) => 
      (apt.patientId === user.id || apt.patientEmail === user.email) &&
      apt.date === dateStr &&
      (apt.status === "confirmada" || apt.status === "pendente")
    );
  };

  const proceedWithSubmit = () => {
    if (!selectedDate || !selectedTime || !user) return;

    const dateStr = selectedDate.toISOString().split("T")[0];
    
    // Gerar link do Jitsi Meet se for remoto
    const generateMeetLink = () => {
      // Gera um ID único para a sala Jitsi Meet usando timestamp e string aleatória
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 10);
      return `https://meet.jit.si/consulta-${timestamp}-${randomStr}`;
    };
    
    const appointmentData = {
      patientId: user.id,
      patientName: user.name,
      patientEmail: user.email,
      professionalId: psychologistId,
      professionalName: psychologistName,
      date: dateStr,
      time: selectedTime,
      type: appointmentType,
      attendanceType: attendanceType as "presencial" | "remoto",
      status: "pendente" as const,
      notes,
      meetLink: attendanceType === "remoto" ? generateMeetLink() : undefined,
      createdAt: new Date().toISOString(),
    };

    const savedAppointments = localStorage.getItem("appointments");
    const allAppointments = savedAppointments ? JSON.parse(savedAppointments) : [];
    const newAppointment = { ...appointmentData, id: Date.now() };
    allAppointments.push(newAppointment);
    localStorage.setItem("appointments", JSON.stringify(allAppointments));

    addNotification({
      type: "appointment_request",
      title: "Nova Solicitação de Consulta",
      message: `${user.name} solicitou uma consulta para ${dateStr} às ${selectedTime}.`,
      appointmentId: newAppointment.id,
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId: psychologistId,
    });

    toast({ title: "Solicitação enviada", description: "Sua solicitação foi enviada." });

    setSelectedDate(undefined);
    setSelectedTime("");
    setAppointmentType(hasHadAppointment ? "Consulta de retorno" : "Primeira consulta");
    setAttendanceType("remoto");
    setNotes("");
    setShowDuplicateAlert(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !user) {
      toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }

    const dateStr = selectedDate.toISOString().split("T")[0];
    
    // Verificar se horário está disponível
    if (!isTimeAvailable(dateStr, selectedTime)) {
      toast({ title: "Horário indisponível", description: "Este horário não está disponível.", variant: "destructive" });
      return;
    }

    // Verificar se já tem consulta marcada neste horário
    const savedAppointments = localStorage.getItem("appointments");
    if (savedAppointments) {
      const allAppointments = JSON.parse(savedAppointments);
      const conflictingAppointment = allAppointments.find((apt: any) => 
        apt.professionalId === psychologistId &&
        apt.date === dateStr &&
        apt.time === selectedTime &&
        (apt.status === "confirmada" || apt.status === "pendente")
      );
      
      if (conflictingAppointment) {
        toast({ 
          title: "Horário já ocupado", 
          description: "Este horário já foi reservado. Por favor, escolha outro horário.", 
          variant: "destructive" 
        });
        return;
      }
    }

    // Verificar se já tem outra consulta no mesmo dia
    const existingAppointment = checkExistingAppointmentOnDate(dateStr);
    if (existingAppointment) {
      setShowDuplicateAlert(true);
      return;
    }

    proceedWithSubmit();
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    
    // Formatar data sem problemas de timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return !isDateAvailable(dateStr);
  };

  const getBookedSlotsForDate = (date: Date) => {
    // Formatar data sem problemas de timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const savedAppointments = localStorage.getItem("appointments");
    if (!savedAppointments) return [];
    
    const allAppointments = JSON.parse(savedAppointments);
    return allAppointments
      .filter((apt: any) => 
        apt.professionalId === psychologistId && 
        apt.date === dateStr && 
        (apt.status === "confirmada" || apt.status === "pendente")
      )
      .map((apt: any) => apt.time);
  };

  const hasAvailableSlots = (date: Date) => {
    // Gerar todos os slots possíveis para este dia
    const allSlots = generateTimeSlots(date);
    if (allSlots.length === 0) return false;
    
    // Verificar quais estão ocupados
    const bookedSlots = getBookedSlotsForDate(date);
    
    // Retorna true se houver pelo menos um slot disponível
    return allSlots.some(slot => !bookedSlots.includes(slot));
  };

  const isDateFullyBooked = (date: Date) => {
    // Formatar data sem problemas de timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    if (!isDateAvailable(dateStr)) return false;
    
    const dayOfWeek = date.getDay();
    const weekDaysMap: { [key: number]: string } = {
      0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday",
      4: "thursday", 5: "friday", 6: "saturday"
    };
    
    const dayKey = weekDaysMap[dayOfWeek];
    const daySchedule = getDaySchedule(dayKey);
    if (!daySchedule || !daySchedule.enabled) return false;
    
    // Verificar se há slots disponíveis (considerando horários já passados hoje)
    return !hasAvailableSlots(date);
  };

  const timeSlots = generateTimeSlots();
  const bookedTimes = selectedDate ? getBookedSlotsForDate(selectedDate) : [];

  if (!professionalSettings) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Atenção</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <p className="text-center text-gray-600">
              Este profissional ainda não configurou seus horários de atendimento.
            </p>
            <p className="text-sm text-center text-gray-500">
              Por favor, entre em contato diretamente com {psychologistName} para agendar uma consulta.
            </p>
            <Button onClick={onClose} className="w-full">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl mx-auto">
        <DialogHeader>
          <DialogTitle>Agendar Consulta com {psychologistName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="w-full max-w-xs mx-auto space-y-3">
              <Label>Selecione a Data</Label>
              <Calendar 
                mode="single" 
                selected={selectedDate} 
                onSelect={setSelectedDate} 
                disabled={isDateDisabled}
                modifiers={{
                  available: (date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Formatar data sem problemas de timezone
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;
                    
                    return date >= today && isDateAvailable(dateStr) && hasAvailableSlots(date);
                  },
                  fullyBooked: (date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date >= today && isDateFullyBooked(date);
                  }
                }}
                modifiersClassNames={{
                  available: "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800/40",
                  fullyBooked: "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-800/40",
                  disabled: "opacity-30 cursor-not-allowed"
                }}
              />
              
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs">
                <div className="font-medium text-sm mb-2">Legenda:</div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"></div>
                  <span>Disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700"></div>
                  <span>Parcialmente ocupado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-muted border border-border opacity-50"></div>
                  <span>Indisponível</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedDate && (
                <div>
                  <Label htmlFor="time">Horário</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger><SelectValue placeholder="Selecione o horário" /></SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem 
                          key={time} 
                          value={time}
                          disabled={bookedTimes.includes(time)}
                        >
                          {time} {bookedTimes.includes(time) ? "(Ocupado)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="type">Tipo de Consulta</Label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {!hasHadAppointment && <SelectItem value="Primeira consulta">Primeira consulta</SelectItem>}
                    <SelectItem value="Consulta de retorno">Consulta de retorno</SelectItem>
                    <SelectItem value="Sessão de terapia">Sessão de terapia</SelectItem>
                    <SelectItem value="Avaliação psicológica">Avaliação psicológica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="attendanceType">Tipo de Atendimento</Label>
                <Select value={attendanceType} onValueChange={setAttendanceType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {professionalSettings.attendanceTypes.remoto && <SelectItem value="remoto">Atendimento Remoto</SelectItem>}
                    {professionalSettings.attendanceTypes.presencial && <SelectItem value="presencial">Atendimento Presencial</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Descreva brevemente o motivo da consulta..." rows={3} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1">Solicitar Agendamento</Button>
          </div>
        </form>
      </DialogContent>

      <AlertDialog open={showDuplicateAlert} onOpenChange={setShowDuplicateAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Consulta já agendada</AlertDialogTitle>
            <AlertDialogDescription>
              Você já possui uma consulta agendada para este dia. Deseja continuar e agendar outra consulta no mesmo dia?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithSubmit}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
