import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { Heart, ArrowLeft, User, MessageCircle, Calendar, Star } from "lucide-react";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { MessagesModal } from "@/components/MessagesModal";

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState<any>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Você precisa fazer login para acessar seus favoritos.</p>
            <Button onClick={() => navigate("/")} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSchedule = (psychologist: any) => {
    setSelectedPsychologist(psychologist);
    setShowCalendar(true);
  };

  const handleSendMessage = (psychologist: any) => {
    setSelectedPsychologist(psychologist);
    setShowMessages(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Button 
              variant="outline" 
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500" />
              Meus Psicólogos Favoritos
            </h1>
            <p className="text-gray-600 mt-2">Profissionais que você salvou para consultar depois</p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum favorito ainda
              </h3>
              <p className="text-gray-600 mb-6">
                Você ainda não favoritou nenhum psicólogo. Navegue pelos profissionais e adicione seus favoritos!
              </p>
              <Button onClick={() => navigate("/patient-dashboard")}>
                Encontrar Psicólogos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((psychologist) => (
              <Card key={psychologist.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center mb-4">
                    <Avatar className="w-24 h-24 mb-4">
                      <AvatarImage 
                        src={psychologist.image} 
                        alt={psychologist.name}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        <User className="w-12 h-12" />
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {psychologist.name}
                    </h3>
                    <Badge variant="secondary" className="mb-2">
                      {psychologist.specialty}
                    </Badge>
                    <div className="flex items-center text-yellow-500 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-2 text-sm text-gray-600">(5.0)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleSchedule(psychologist)}
                      className="w-full"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Consulta
                    </Button>
                    <Button 
                      onClick={() => handleSendMessage(psychologist)}
                      variant="outline"
                      className="w-full"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                    <Button
                      onClick={() => removeFavorite(psychologist.id)}
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Heart className="w-4 h-4 mr-2 fill-current" />
                      Remover dos Favoritos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedPsychologist && (
        <>
          <AppointmentCalendar
            isOpen={showCalendar}
            onClose={() => {
              setShowCalendar(false);
              setSelectedPsychologist(null);
            }}
            psychologistId={selectedPsychologist.id}
            psychologistName={selectedPsychologist.name}
          />
          <MessagesModal
            open={showMessages}
            onOpenChange={(open) => {
              setShowMessages(open);
              if (!open) setSelectedPsychologist(null);
            }}
            recipientId={selectedPsychologist.id.toString()}
            recipientName={selectedPsychologist.name}
            userId={user?.id?.toString() || ""}
            userType="patient"
          />
        </>
      )}
    </div>
  );
};

export default Favorites;
