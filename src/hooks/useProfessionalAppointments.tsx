import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useNotifications } from "./useNotifications";
import { useToast } from "./use-toast";

export interface Appointment {
  id: number;
  patientId: string | number;
  patientName: string;
  patientEmail: string;
  professionalId: number;
  professionalName: string;
  date: string;
  time: string;
  type: string;
  attendanceType: "presencial" | "remoto";
  status: "pendente" | "confirmada" | "cancelada" | "finalizada";
  notes?: string;
  createdAt: string;
}

export const useProfessionalAppointments = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const loadAppointments = () => {
    if (!user?.id) {
      console.log("No user ID, clearing appointments");
      setAppointments([]);
      return;
    }
    
    console.log("=== DEBUG useProfessionalAppointments ===");
    console.log("User ID:", user.id);
    
    const saved = localStorage.getItem("appointments");
    if (saved) {
      const all: Appointment[] = JSON.parse(saved).map((a: any) => ({
        ...a,
        id: Number(a.id),
        professionalId: Number(a.professionalId),
        patientId: typeof a.patientId === "string" ? a.patientId : Number(a.patientId),
      }));
      
      console.log("All appointments from storage:", all.length);
      console.log("All appointments:", all);
      
      const filtered = all.filter(a => a.professionalId === Number(user.id));
      console.log("Filtered appointments for professional:", filtered.length);
      console.log("Filtered appointments:", filtered);
      
      setAppointments(filtered);
    } else {
      console.log("No appointments in storage");
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadAppointments();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "appointments") {
        loadAppointments();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user?.id]);

  const addAppointment = (appointment: Omit<Appointment, "id" | "createdAt">) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    const saved = localStorage.getItem("appointments");
    const all: Appointment[] = saved ? JSON.parse(saved) : [];
    all.push(newAppointment);
    localStorage.setItem("appointments", JSON.stringify(all));

    loadAppointments();
  };

  const updateAppointment = (id: number, updates: Partial<Appointment>) => {
    const savedAppointments = localStorage.getItem("appointments");
    if (!savedAppointments) return;

    const allAppointments: Appointment[] = JSON.parse(savedAppointments);
    const index = allAppointments.findIndex(apt => apt.id === id);
    if (index === -1) return;

    const updatedAppointment = { ...allAppointments[index], ...updates };
    allAppointments[index] = updatedAppointment;
    localStorage.setItem("appointments", JSON.stringify(allAppointments));

    // 🔄 Força recarregar local
    loadAppointments();

    // Notificações...
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
  };


  return {
    appointments,
    addAppointment,
    updateAppointment,
    setAppointments,
  };
};
