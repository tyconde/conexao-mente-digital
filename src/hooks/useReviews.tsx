import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export interface Review {
  id: number;
  patientId: number;
  patientName: string;
  professionalId: number;
  professionalName: string;
  appointmentId: number;
  rating: number;
  comment?: string;
  date: string;
}

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    const savedReviews = localStorage.getItem("reviews");
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    }
  };

  const addReview = (review: Omit<Review, "id" | "date">): boolean => {
    try {
      // Verificar se já existe avaliação para este agendamento
      const existingReview = reviews.find(
        r => r.appointmentId === review.appointmentId && r.patientId === review.patientId
      );

      if (existingReview) {
        console.log("Avaliação já existe para esta consulta");
        return false;
      }

      const newReview: Review = {
        ...review,
        id: Date.now(),
        date: new Date().toISOString()
      };

      const updatedReviews = [...reviews, newReview];
      localStorage.setItem("reviews", JSON.stringify(updatedReviews));
      setReviews(updatedReviews);
      
      return true;
    } catch (error) {
      console.error("Erro ao adicionar avaliação:", error);
      return false;
    }
  };

  const hasReviewedAppointment = (appointmentId: number, patientId: number): boolean => {
    return reviews.some(
      r => r.appointmentId === appointmentId && r.patientId === patientId
    );
  };

  const getProfessionalReviews = (professionalId: number): Review[] => {
    return reviews.filter(r => r.professionalId === professionalId);
  };

  const getProfessionalAverageRating = (professionalId: number): number => {
    const professionalReviews = getProfessionalReviews(professionalId);
    if (professionalReviews.length === 0) return 0;

    const sum = professionalReviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / professionalReviews.length).toFixed(1));
  };

  const getPatientReviews = (patientId: number): Review[] => {
    return reviews.filter(r => r.patientId === patientId);
  };

  return {
    reviews,
    addReview,
    hasReviewedAppointment,
    getProfessionalReviews,
    getProfessionalAverageRating,
    getPatientReviews,
    loadReviews
  };
};
