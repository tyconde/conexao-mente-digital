
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface FavoritePsychologist {
  id: number;
  name: string;
  specialty: string;
  image: string;
  userId: number;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoritePsychologist[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const savedFavorites = localStorage.getItem("favorites");
      if (savedFavorites) {
        const allFavorites = JSON.parse(savedFavorites);
        setFavorites(allFavorites.filter((fav: FavoritePsychologist) => fav.userId === user.id));
      }
    }
  }, [user]);

  const addFavorite = (psychologist: Omit<FavoritePsychologist, "userId">) => {
    if (!user) return;

    const newFavorite = { ...psychologist, userId: user.id };
    const savedFavorites = localStorage.getItem("favorites");
    const allFavorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    
    const exists = allFavorites.some((fav: FavoritePsychologist) => 
      fav.id === psychologist.id && fav.userId === user.id
    );

    if (!exists) {
      const updatedFavorites = [...allFavorites, newFavorite];
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setFavorites(prev => [...prev, newFavorite]);
    }
  };

  const removeFavorite = (psychologistId: number) => {
    if (!user) return;

    const savedFavorites = localStorage.getItem("favorites");
    const allFavorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    const updatedFavorites = allFavorites.filter((fav: FavoritePsychologist) => 
      !(fav.id === psychologistId && fav.userId === user.id)
    );
    
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    setFavorites(prev => prev.filter(fav => fav.id !== psychologistId));
  };

  const isFavorite = (psychologistId: number) => {
    return favorites.some(fav => fav.id === psychologistId);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite
  };
};
