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

  // Carrega os agendamentos do profissional logado
  const loadAppointments = () => {
    const savedAppointments = localStorage.getItem("appointments");
    if (savedAppointments && user?.id) {
      const allAppointments: Appointment[] = JSON.parse(savedAppointments);
      const professionalAppointments = allAppointments.filter(
        apt => apt.professionalId === Number(user.id)
      );
      setAppointments(professionalAppointments);
    }
  };

  useEffect(() => {
    loadAppointments();

    // Listener para atualizações em tempo real no localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "appointments") {
        loadAppointments();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user?.id]);

  const updateAppointment = (id: number, updates: Partial<Appointment>) => {
    const savedAppointments = localStorage.getItem("appointments");
    if (!savedAppointments) return;

    const allAppointments: Appointment[] = JSON.parse(savedAppointments);
    const index = allAppointments.findIndex(apt => apt.id === id);
    if (index === -1) return;

    const updatedAppointment = { ...allAppointments[index], ...updates };
    allAppointments[index] = updatedAppointment;
    localStorage.setItem("appointments", JSON.stringify(allAppointments));

    // Notificação para o paciente
    if (updates.status === "confirmada") {
      addNotification({
        type: "appointment_approved",
        title: "Consulta Confirmada",
        message: `Sua consulta para ${updatedAppointment.date} às ${updatedAppointment.time} foi confirmada.`,
        appointmentId: id,
        fromUserId: user?.id || 0,
        fromUserName: user?.name || "Profissional",
        toUserId: Number(updatedAppointment.patientId),
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
        toUserId: Number(updatedAppointment.patientId),
      });

      toast({
        title: "Consulta rejeitada",
        description: "O paciente foi notificado sobre a rejeição.",
      });
    }

    loadAppointments();
  };

  const addAppointment = (appointment: Omit<Appointment, "id">) => {
    const newAppointment: Appointment = {
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
