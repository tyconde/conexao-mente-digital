
import { useState, useEffect } from "react";

interface Appointment {
  id: number;
  psychologist: string;
  psychologistId: number;
  date: string;
  time: string;
  type: string;
  userId: number;
}

export const useAppointments = (userId?: number) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const savedAppointments = localStorage.getItem("appointments");
    if (savedAppointments) {
      const allAppointments = JSON.parse(savedAppointments);
      if (userId) {
        setAppointments(allAppointments.filter((apt: Appointment) => apt.userId === userId));
      } else {
        setAppointments(allAppointments);
      }
    }
  }, [userId]);

  const addAppointment = (appointment: Omit<Appointment, "id">) => {
    const newAppointment = {
      ...appointment,
      id: Date.now()
    };

    const savedAppointments = localStorage.getItem("appointments");
    const allAppointments = savedAppointments ? JSON.parse(savedAppointments) : [];
    const updatedAppointments = [...allAppointments, newAppointment];
    
    localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    
    if (!userId || appointment.userId === userId) {
      setAppointments(prev => [...prev, newAppointment]);
    }
  };

  return {
    appointments,
    addAppointment
  };
};
