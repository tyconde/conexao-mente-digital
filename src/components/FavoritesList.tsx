
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, User } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

export const FavoritesList = () => {
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="w-5 h-5 mr-2 text-red-500" />
          Psicólogos Favoritos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {favorites.map((psychologist) => (
            <div key={psychologist.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={psychologist.image} 
                    alt={psychologist.name}
                    className="object-cover object-center"
                  />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{psychologist.name}</div>
                  <div className="text-xs text-gray-600">{psychologist.specialty}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFavorite(psychologist.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Heart className="w-4 h-4 fill-current" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
