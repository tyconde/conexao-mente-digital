import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, MessageCircle, MapPin, Monitor } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useReviews } from "@/hooks/useReviews";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { MessagesModal } from "./MessagesModal";
import { PROFESSIONAL_BADGES, BadgeId } from "@/constants/professionalData";
import { cn } from "@/lib/utils";

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

  // Buscar dados completos do profissional para pegar a imagem correta e badges
  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
  const professionalData = registeredUsers.find((u: any) => u.id === id);
  const profileImage = professionalData?.profileImage || image;
  const professionalBadges: BadgeId[] = professionalData?.badges || [];

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

          {/* Habilidades e Familiaridades */}
          {professionalBadges.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">Habilidades:</p>
              <div className="flex flex-wrap gap-2">
                {professionalBadges.map((badgeId) => {
                  const badgeConfig = PROFESSIONAL_BADGES.find(b => b.id === badgeId);
                  if (!badgeConfig) return null;
                  const IconComponent = badgeConfig.icon;
                  
                  // Color mapping for badges
                  const colorClasses = {
                    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                    purple: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
                    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
                    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
                    green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
                    slate: "bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300",
                    pink: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
                    cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
                    violet: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
                    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
                    rose: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
                    red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
                    lime: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
                    rainbow: "bg-gradient-to-r from-red-400 via-yellow-400 to-purple-400 text-white dark:from-red-600 dark:via-yellow-600 dark:to-purple-600",
                    orange: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
                    gray: "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300"
                  };
                  
                  return (
                    <Badge 
                      key={badgeId} 
                      variant="secondary" 
                      className={cn(
                        "flex items-center gap-1 border-0",
                        colorClasses[badgeConfig.color as keyof typeof colorClasses] || "bg-secondary text-secondary-foreground"
                      )}
                    >
                      <IconComponent className="w-3 h-3" />
                      {badgeConfig.label}
                    </Badge>
                  );
                })}
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
