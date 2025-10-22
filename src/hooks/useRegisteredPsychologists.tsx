
import { useState, useEffect } from "react";
import { useReviews } from "./useReviews";

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
  reviewCount?: number;
}

export const useRegisteredPsychologists = () => {
  const [psychologists, setPsychologists] = useState<RegisteredPsychologist[]>([]);
  const { getProfessionalAverageRating, getProfessionalReviews, reviews } = useReviews();

  const loadPsychologists = () => {
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const psychologistUsers = registeredUsers.filter((user: any) => user.type === "professional");
    
    const formattedPsychologists = psychologistUsers.map((user: any) => {
      // Carregar configurações do profissional
      const settings = JSON.parse(
        localStorage.getItem(`professional_settings_${user.id}`) || 
        '{"attendanceTypes": {"remoto": true, "presencial": false}, "address": ""}'
      );
      
      // Carregar preço configurado
      const professionalPrices = JSON.parse(localStorage.getItem("professionalPrices") || "{}");
      const userPrice = professionalPrices[user.id] || 150;

      // Calcular nota real baseada nas avaliações
      const averageRating = getProfessionalAverageRating(user.id);
      const professionalReviews = getProfessionalReviews(user.id);
      const reviewCount = professionalReviews.length;

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
        experience: reviewCount > 0 ? `${reviewCount} avaliação${reviewCount > 1 ? 'ões' : ''}` : "Recém cadastrado",
        rating: averageRating || 5.0,
        reviewCount: reviewCount
      };
    });

    setPsychologists(formattedPsychologists);
  };

  useEffect(() => {
    loadPsychologists();
  }, [reviews]); // Recarrega quando reviews mudar

  useEffect(() => {
    // Escutar mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "registeredUsers" || e.key === "reviews" || e.key === "professionalPrices" || e.key?.startsWith("professional_settings_")) {
        loadPsychologists();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Também verificar periodicamente para mudanças na mesma aba
    const interval = setInterval(loadPsychologists, 3000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [reviews]);

  return { psychologists };
};
