
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useNotifications } from "./useNotifications";
import { useToast } from "./use-toast";

export interface Appointment {
  id: number;
  patientId: number | string;
  patientName: string;
  patientEmail: string;
  professionalId: number;
  professionalName: string;
  date: string;
  time: string;
  type: string;
  attendanceType: "presencial" | "remoto";
  status: "pendente" | "confirmada" | "cancelada";
  notes?: string;
  createdAt: string;
}

export const useProfessionalAppointments = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user?.id]);

  const loadAppointments = () => {
    const savedAppointments = localStorage.getItem("appointments");
    if (savedAppointments) {
      const allAppointments = JSON.parse(savedAppointments);
      const professionalAppointments = allAppointments.filter(
        (apt: Appointment) => apt.professionalId === parseInt(user?.id?.toString() || "0")
      );
      setAppointments(professionalAppointments);
    }
  };

  const updateAppointment = (id: number, updates: Partial<Appointment>) => {
    const savedAppointments = localStorage.getItem("appointments");
    if (savedAppointments) {
      const allAppointments = JSON.parse(savedAppointments);
      const appointmentIndex = allAppointments.findIndex((apt: Appointment) => apt.id === id);
      
      if (appointmentIndex !== -1) {
        const updatedAppointment = { ...allAppointments[appointmentIndex], ...updates };
        allAppointments[appointmentIndex] = updatedAppointment;
        localStorage.setItem("appointments", JSON.stringify(allAppointments));
        
        // Enviar notificação para o paciente
        if (updates.status === "confirmada") {
          addNotification({
            type: "appointment_approved",
            title: "Consulta Confirmada",
            message: `Sua consulta para ${updatedAppointment.date} às ${updatedAppointment.time} foi confirmada.`,
            appointmentId: id,
            fromUserId: user?.id || 0,
            fromUserName: user?.name || "Profissional",
            toUserId: updatedAppointment.patientId as number,
          });
          
          toast({
            title: "Consulta confirmada",
            description: "O paciente foi notificado sobre a confirmação.",
          });
        } else if (updates.status === "cancelada") {
          addNotification({
            type: "appointment_rejected",
            title: "Consulta Rejeitada",
            message: `Sua solicitação de consulta para ${updatedAppointment.date} às ${updatedAppointment.time} foi rejeitada.`,
            appointmentId: id,
            fromUserId: user?.id || 0,
            fromUserName: user?.name || "Profissional",
            toUserId: updatedAppointment.patientId as number,
          });
          
          toast({
            title: "Consulta rejeitada",
            description: "O paciente foi notificado sobre a rejeição.",
          });
        }
        
        loadAppointments();
      }
    }
  };

  const addAppointment = (appointment: Omit<Appointment, "id">) => {
    const newAppointment = {
      ...appointment,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    const savedAppointments = localStorage.getItem("appointments");
    const allAppointments = savedAppointments ? JSON.parse(savedAppointments) : [];
    allAppointments.push(newAppointment);
    localStorage.setItem("appointments", JSON.stringify(allAppointments));
    loadAppointments();
  };

  return {
    appointments,
    updateAppointment,
    addAppointment,
  };
};
