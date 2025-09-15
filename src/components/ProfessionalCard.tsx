
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, MessageCircle, MapPin, Monitor } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { MessagesModal } from "./MessagesModal";

interface ProfessionalCardProps {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  price: number;
  image: string;
}

export const ProfessionalCard = ({ 
  id,
  name, 
  specialty, 
  experience, 
  rating, 
  price, 
  image 
}: ProfessionalCardProps) => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  // Carregar configurações do profissional
  const professionalSettings = JSON.parse(
    localStorage.getItem(`professional_settings_${id}`) || 
    '{"attendanceTypes": {"remoto": true, "presencial": false}, "address": ""}'
  );

  // Buscar dados completos do profissional para pegar a imagem correta
  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
  const professionalData = registeredUsers.find((u: any) => u.id === id);
  const profileImage = professionalData?.profileImage || image;

  const handleSchedule = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (user.type !== "patient") {
      alert("Apenas pacientes podem agendar consultas");
      return;
    }

    // Redireciona para o dashboard do paciente
    window.location.href = "/patient-dashboard";
  };

  const handleMessage = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (user.type !== "patient") {
      alert("Apenas pacientes podem enviar mensagens");
      return;
    }

    setShowMessagesModal(true);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-card">
        <CardHeader className="p-0">
          <div className="relative">
            <img 
              src={profileImage} 
              alt={name}
              className="w-full h-48 object-cover object-center"
              style={{ objectPosition: "center 20%" }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/lovable-uploads/b64b7a88-15de-433a-a0f9-53def99e2ff7.png";
              }}
            />
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary text-primary-foreground">
                CRP Verificado
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground">{name}</h3>
            <p className="text-muted-foreground">{specialty}</p>
            <p className="text-sm text-muted-foreground">{experience} de experiência</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-foreground ml-1">{rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">47 avaliações</span>
          </div>

          {/* Tipos de Atendimento */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {professionalSettings.attendanceTypes.remoto && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Monitor className="w-3 h-3" />
                  Online
                </Badge>
              )}
              {professionalSettings.attendanceTypes.presencial && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Presencial
                </Badge>
              )}
            </div>
            
            {professionalSettings.attendanceTypes.presencial && professionalSettings.address && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {professionalSettings.address}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-foreground">R$ {price}</span>
              <span className="text-muted-foreground">/sessão</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleSchedule}>
                <Calendar className="w-4 h-4 mr-1" />
                Agendar
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleMessage}>
                <MessageCircle className="w-4 h-4 mr-1" />
                Conversar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="register"
        userType="patient"
      />

      <MessagesModal
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
        recipientId={id.toString()}
        recipientName={name}
      />
    </>
  );
};
