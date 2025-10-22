
import { useState, useEffect } from "react";
import { useProfessionalAppointments } from "./useProfessionalAppointments";
import { useProntuarios } from "./useProntuarios";

interface Patient {
  id: string;
  name: string;
  email: string;
  age?: string;
  firstAppointment: string;
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  lastAppointment?: string;
  hasProntuario: boolean;
  prontuarioId?: number;
}

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const { appointments } = useProfessionalAppointments();
  const { prontuarios } = useProntuarios();

  useEffect(() => {
    if (!appointments.length) {
      setPatients([]);
      return;
    }

    // Agrupar agendamentos por paciente
    const patientMap = new Map<string, Patient>();

    appointments.forEach(appointment => {
      const patientKey = appointment.patientEmail;
      
      if (!patientMap.has(patientKey)) {
        patientMap.set(patientKey, {
          id: patientKey,
          name: appointment.patientName,
          email: appointment.patientEmail,
          firstAppointment: appointment.date,
          totalAppointments: 0,
          confirmedAppointments: 0,
          pendingAppointments: 0,
          hasProntuario: false
        });
      }

      const patient = patientMap.get(patientKey)!;
      
      // Atualizar estatísticas
      patient.totalAppointments++;
      
      if (appointment.status === "confirmada" || appointment.status === "finalizada") {
        patient.confirmedAppointments++;
      } else if (appointment.status === "pendente") {
        patient.pendingAppointments++;
      }

      // Encontrar primeira e última consulta
      if (appointment.date < patient.firstAppointment) {
        patient.firstAppointment = appointment.date;
      }
      
      if (!patient.lastAppointment || appointment.date > patient.lastAppointment) {
        patient.lastAppointment = appointment.date;
      }
    });

    // Verificar se paciente tem prontuário e adicionar idade
    patientMap.forEach(patient => {
      const prontuario = prontuarios.find(p => 
        p.paciente.toLowerCase() === patient.name.toLowerCase()
      );
      
      if (prontuario) {
        patient.hasProntuario = true;
        patient.prontuarioId = prontuario.id;
        patient.age = prontuario.idade;
      }
    });

    setPatients(Array.from(patientMap.values()));
  }, [appointments, prontuarios]);

  return { patients };
};
