
import { useState, useEffect } from "react";
import { useReviews } from "./useReviews";
import { BadgeId } from "@/constants/professionalData";

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
  hasVisualImpairment?: boolean;
  hasHearingImpairment?: boolean;
  badges?: BadgeId[];
  specialties?: string[];
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

      // Separar especialidades em array
      const specialtiesArray = user.specialty 
        ? user.specialty.split(',').map((s: string) => s.trim()).filter(Boolean)
        : ["Psicologia Clínica"];

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        specialty: user.specialty || "Psicologia Clínica",
        specialties: specialtiesArray,
        crp: user.crp || "",
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage || "",
        price: userPrice,
        attendanceTypes: settings.attendanceTypes,
        clinicAddress: settings.address,
        experience: reviewCount > 0 ? `${reviewCount} avaliação${reviewCount > 1 ? 'ões' : ''}` : "Recém cadastrado",
        rating: averageRating || 5.0,
        reviewCount: reviewCount,
        hasVisualImpairment: user.hasVisualImpairment || false,
        hasHearingImpairment: user.hasHearingImpairment || false,
        badges: user.badges || []
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
