
import { useState, useEffect } from "react";

interface RegisteredPsychologist {
  id: number;
  name: string;
  email: string;
  specialty: string;
  crp: string;
  phone: string;
  address: string;
  profileImage?: string;
  price?: number;
  attendanceTypes?: {
    remoto: boolean;
    presencial: boolean;
  };
  clinicAddress?: string;
  experience?: string;
  rating?: number;
}

export const useRegisteredPsychologists = () => {
  const [psychologists, setPsychologists] = useState<RegisteredPsychologist[]>([]);

  useEffect(() => {
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const psychologistUsers = registeredUsers.filter((user: any) => user.type === "professional");
    
    const formattedPsychologists = psychologistUsers.map((user: any) => {
      // Carregar configurações do profissional
      const settings = JSON.parse(
        localStorage.getItem(`professional_settings_${user.id}`) || 
        '{"attendanceTypes": {"remoto": true, "presencial": false}, "address": ""}'
      );
      
      // Carregar preço configurado - usar a chave correta
      const professionalPrices = JSON.parse(localStorage.getItem("professionalPrices") || "{}");
      const userPrice = professionalPrices[user.id] || 150;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        specialty: user.specialty || "Psicologia Clínica",
        crp: user.crp || "",
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage || "",
        price: userPrice,
        attendanceTypes: settings.attendanceTypes,
        clinicAddress: settings.address,
        experience: "Recém cadastrado",
        rating: 5.0
      };
    });

    setPsychologists(formattedPsychologists);
  }, []);

  return { psychologists };
};
