import { useState, useEffect } from "react";

export interface AvailableContact {
  id: string;
  name: string;
  type: "patient" | "professional";
  appointmentId: number;
  appointmentDate: string;
}

export const useAvailableContacts = (
  userId?: string,
  userType?: "patient" | "professional"
) => {
  const [contacts, setContacts] = useState<AvailableContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !userType) {
      setContacts([]);
      setLoading(false);
      return;
    }

    loadAvailableContacts();
  }, [userId, userType]);

  const loadAvailableContacts = () => {
    setLoading(true);
    
    try {
      console.log("=== DEBUG useAvailableContacts ===");
      console.log("userId:", userId);
      console.log("userType:", userType);
      
      // Buscar todos os agendamentos
      const savedAppointments = localStorage.getItem("appointments");
      if (!savedAppointments) {
        console.log("Nenhum agendamento salvo no localStorage");
        setContacts([]);
        setLoading(false);
        return;
      }

      const allAppointments = JSON.parse(savedAppointments);
      console.log("Total de agendamentos:", allAppointments.length);
      console.log("Todos os agendamentos:", allAppointments);
      
      // Filtrar consultas confirmadas ou finalizadas (histórico de atendimento)
      const relevantAppointments = allAppointments.filter((apt: any) => {
        const statusLower = apt.status?.toLowerCase();
        const statusMatch = statusLower === "confirmada" || statusLower === "finalizada";
        // Resolver IDs possíveis em diferentes esquemas
        const resolvedProfessionalId = (apt.professionalId ?? apt.psychologistId ?? apt.professional?.id);
        const resolvedPatientId = (apt.patientId ?? apt.userId ?? apt.patient?.id);
        const userMatch = userType === "patient" 
          ? String(resolvedPatientId ?? "") === String(userId)
          : String(resolvedProfessionalId ?? "") === String(userId);
        
        console.log(`Appointment ${apt.id}:`, {
          status: apt.status,
          statusLower,
          statusMatch,
          rawPatientId: apt.patientId,
          rawUserId: apt.userId,
          rawProfessionalId: apt.professionalId,
          resolvedPatientId,
          resolvedProfessionalId,
          userMatch,
          include: statusMatch && userMatch
        });
        
        return statusMatch && userMatch;
      });
      
      console.log("Agendamentos relevantes filtrados:", relevantAppointments);

      // Buscar usuários registrados
      const savedUsers = localStorage.getItem("registeredUsers");
      const allUsers = savedUsers ? JSON.parse(savedUsers) : [];
      console.log("Usuários registrados:", allUsers);

      // Criar lista de contatos únicos
      const uniqueContacts = new Map<string, AvailableContact>();

      relevantAppointments.forEach((apt: any) => {
        // Resolver IDs e nomes com tolerância a diferentes esquemas
        const resolvedProfessionalId = (apt.professionalId ?? apt.psychologistId ?? apt.professional?.id);
        const resolvedPatientId = (apt.patientId ?? apt.userId ?? apt.patient?.id);
        const resolvedProfessionalName = apt.professionalName ?? apt.psychologist ?? apt.professional?.name ?? "Profissional";
        const resolvedPatientName = apt.patientName ?? apt.patient?.name ?? "Paciente";

        if (userType === "patient") {
          // Paciente vê psicólogos
          const contactId = resolvedProfessionalId != null ? String(resolvedProfessionalId) : undefined;
          console.log("Buscando profissional:", contactId);
          
          if (contactId && !uniqueContacts.has(contactId)) {
            const professional = allUsers.find((u: any) => String(u.id) === String(contactId));
            console.log("Profissional encontrado:", professional);
            
            uniqueContacts.set(contactId, {
              id: contactId,
              name: professional?.name || resolvedProfessionalName,
              type: "professional",
              appointmentId: apt.id,
              appointmentDate: apt.date
            });
          }
        } else {
          // Profissional vê pacientes
          const contactId = resolvedPatientId != null ? String(resolvedPatientId) : undefined;
          console.log("Buscando paciente:", contactId);
          
          if (contactId && !uniqueContacts.has(contactId)) {
            const patient = allUsers.find((u: any) => String(u.id) === String(contactId));
            console.log("Paciente encontrado:", patient);
            
            uniqueContacts.set(contactId, {
              id: contactId,
              name: patient?.name || resolvedPatientName,
              type: "patient",
              appointmentId: apt.id,
              appointmentDate: apt.date
            });
          }
        }
      });

      // Ordenar por data de consulta mais recente
      const sortedContacts = Array.from(uniqueContacts.values()).sort((a, b) => 
        new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
      );

      console.log("Contatos finais:", sortedContacts);
      setContacts(sortedContacts);
    } catch (error) {
      console.error("Erro ao carregar contatos disponíveis:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    contacts,
    loading,
    hasContacts: contacts.length > 0
  };
};
