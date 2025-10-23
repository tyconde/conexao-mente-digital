
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, MessageCircle, MapPin, Monitor, Eye, Ear, Hand } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useReviews } from "@/hooks/useReviews";
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
  const { getProfessionalAverageRating, getProfessionalReviews } = useReviews();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  // Obter avaliações reais do profissional
  const averageRating = getProfessionalAverageRating(id);
  const reviews = getProfessionalReviews(id);
  const reviewCount = reviews.length;
  const hasReviews = reviewCount > 0;

  // Carregar configurações do profissional
  const professionalSettings = JSON.parse(
    localStorage.getItem(`professional_settings_${id}`) || 
    '{"attendanceTypes": {"remoto": true, "presencial": false}, "address": ""}'
  );

  // Buscar dados completos do profissional para pegar a imagem correta e acessibilidade
  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
  const professionalData = registeredUsers.find((u: any) => u.id === id);
  const profileImage = professionalData?.profileImage || image;
  const accessibility = {
    hasVisualImpairment: professionalData?.hasVisualImpairment || false,
    hasHearingImpairment: professionalData?.hasHearingImpairment || false,
    knowsLibras: professionalData?.knowsLibras || false
  };

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
            {hasReviews ? (
              <>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium text-foreground ml-2">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {reviewCount} avaliação{reviewCount !== 1 ? 'ões' : ''}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Sem avaliações ainda</span>
            )}
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

          {/* Acessibilidade */}
          {(accessibility.hasVisualImpairment || accessibility.hasHearingImpairment || accessibility.knowsLibras) && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">Acessibilidade:</p>
              <div className="flex flex-wrap gap-2">
                {accessibility.hasVisualImpairment && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800">
                    <Eye className="w-3 h-3" />
                    Deficiência Visual
                  </Badge>
                )}
                {accessibility.hasHearingImpairment && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-800">
                    <Ear className="w-3 h-3" />
                    Deficiência Auditiva
                  </Badge>
                )}
                {accessibility.knowsLibras && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                    <Hand className="w-3 h-3" />
                    Fluente em Libras
                  </Badge>
                )}
              </div>
            </div>
          )}

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
        open={showMessagesModal}
        onOpenChange={setShowMessagesModal}
        recipientId={id.toString()}
        recipientName={name}
        userId={user?.id?.toString() || ""}
        userType="patient"
      />
    </>
  );
};
