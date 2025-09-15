
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AppointmentCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  psychologistId: number;
  psychologistName: string;
}

export const AppointmentCalendar = ({ 
  isOpen, 
  onClose, 
  psychologistId, 
  psychologistName 
}: AppointmentCalendarProps) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const { isDateAvailable, isTimeAvailable, getDaySchedule, professionalSettings } = useAvailableSlots(psychologistId);
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("Primeira consulta");
  const [attendanceType, setAttendanceType] = useState("remoto");
  const [notes, setNotes] = useState("");

  const generateTimeSlots = () => {
    if (!selectedDate || !professionalSettings) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const weekDaysMap: { [key: number]: string } = {
      0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday",
      4: "thursday", 5: "friday", 6: "saturday"
    };
    
    const dayKey = weekDaysMap[dayOfWeek];
    const daySchedule = getDaySchedule(dayKey);
    
    if (!daySchedule || !daySchedule.enabled) return [];
    
    const slots = [];
    const [startHour, startMinute] = daySchedule.start.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.end.split(':').map(Number);
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour + 1 < endHour || (hour + 1 === endHour && endMinute >= 30)) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    
    return slots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !user) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const dateStr = selectedDate.toISOString().split('T')[0];
    
    if (!isTimeAvailable(dateStr, selectedTime)) {
      toast({
        title: "Horário indisponível",
        description: "Este horário não está disponível para agendamento.",
        variant: "destructive",
      });
      return;
    }

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
      createdAt: new Date().toISOString(),
    };

    // Salvar agendamento
    const savedAppointments = localStorage.getItem("appointments");
    const allAppointments = savedAppointments ? JSON.parse(savedAppointments) : [];
    const newAppointment = { ...appointmentData, id: Date.now() };
    allAppointments.push(newAppointment);
    localStorage.setItem("appointments", JSON.stringify(allAppointments));

    // Enviar notificação para o profissional
    addNotification({
      type: "appointment_request",
      title: "Nova Solicitação de Consulta",
      message: `${user.name} solicitou uma consulta para ${dateStr} às ${selectedTime}.`,
      appointmentId: newAppointment.id,
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId: psychologistId,
    });

    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de agendamento foi enviada ao profissional.",
    });

    // Reset form
    setSelectedDate(undefined);
    setSelectedTime("");
    setAppointmentType("Primeira consulta");
    setAttendanceType("remoto");
    setNotes("");
    onClose();
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    
    const dateStr = date.toISOString().split('T')[0];
    return !isDateAvailable(dateStr);
  };

  const timeSlots = generateTimeSlots();

  if (!professionalSettings) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">
            <p>Carregando horários disponíveis...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agendar Consulta com {psychologistName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Selecione a Data</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                className={cn("rounded-md border pointer-events-auto")}
              />
            </div>
            
            <div className="space-y-4">
              {selectedDate && (
                <div>
                  <Label htmlFor="time">Horário</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label htmlFor="type">Tipo de Consulta</Label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Primeira consulta">Primeira consulta</SelectItem>
                    <SelectItem value="Consulta de retorno">Consulta de retorno</SelectItem>
                    <SelectItem value="Sessão de terapia">Sessão de terapia</SelectItem>
                    <SelectItem value="Avaliação psicológica">Avaliação psicológica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="attendanceType">Tipo de Atendimento</Label>
                <Select value={attendanceType} onValueChange={setAttendanceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {professionalSettings.attendanceTypes.remoto && (
                      <SelectItem value="remoto">Atendimento Remoto</SelectItem>
                    )}
                    {professionalSettings.attendanceTypes.presencial && (
                      <SelectItem value="presencial">Atendimento Presencial</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Descreva brevemente o motivo da consulta..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Solicitar Agendamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
