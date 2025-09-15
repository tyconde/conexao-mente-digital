import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  MessageCircle, 
  Star, 
  Clock,
  Heart,
  Shield,
  User,
  Home,
  MapPin,
  Monitor
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useFavorites } from "@/hooks/useFavorites";
import { useRegisteredPsychologists } from "@/hooks/useRegisteredPsychologists";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { DashboardFilters } from "@/components/DashboardFilters";
import { PatientAppointments } from "@/components/PatientAppointments";
import { MessagesModal } from "@/components/MessagesModal";

const PatientDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState<any>(null);

  const { user } = useAuth();
  const { appointments } = useAppointments(user?.id);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { psychologists } = useRegisteredPsychologists();

  // Extrair especialidades únicas dos psicólogos registrados
  const availableSpecialties = psychologists.length > 0 
    ? ["Todas as especialidades", ...Array.from(new Set(psychologists.map(p => p.specialty)))]
    : ["Todas as especialidades", "Psicologia Clínica"];

  const filteredPsychologists = psychologists.filter(psychologist => {
    const matchesSearch = psychologist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         psychologist.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === "all" || 
                            psychologist.specialty === selectedSpecialty;
    
    const matchesPrice = priceFilter.length === 0 || 
                        priceFilter.some(range => {
                          const price = psychologist.price || 150;
                          switch(range) {
                            case "100-150": return price >= 100 && price <= 150;
                            case "150-200": return price >= 150 && price <= 200;
                            case "200+": return price >= 200;
                            default: return true;
                          }
                        });

    return matchesSearch && matchesSpecialty && matchesPrice;
  });

  const handlePriceFilterChange = (range: string) => {
    setPriceFilter(prev => 
      prev.includes(range) 
        ? prev.filter(p => p !== range)
        : [...prev, range]
    );
  };

  const handleSchedule = (psychologist: any) => {
    setSelectedPsychologist(psychologist);
    setShowCalendar(true);
  };

  const handleSendMessage = (psychologist: any) => {
    setSelectedPsychologist(psychologist);
    setShowMessages(true);
  };

  const handleFavorite = (psychologist: any) => {
    if (isFavorite(psychologist.id)) {
      removeFavorite(psychologist.id);
    } else {
      addFavorite({
        id: psychologist.id,
        name: psychologist.name,
        specialty: psychologist.specialty,
        image: psychologist.profileImage || ""
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa fazer login como paciente para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/"} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Olá, {user.name}! Como podemos ajudar você hoje?
            </h1>
            <p className="text-gray-600">
              Encontre o psicólogo ideal para suas necessidades
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/"}
            className="flex items-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Início
          </Button>
        </div>

        {/* Add appointments section before the main grid */}
        <div className="mb-8">
          <PatientAppointments />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <DashboardFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedSpecialty={selectedSpecialty}
            setSelectedSpecialty={setSelectedSpecialty}
            priceFilter={priceFilter}
            handlePriceFilterChange={handlePriceFilterChange}
            availableSpecialties={availableSpecialties}
          />

          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Psicólogos Disponíveis ({filteredPsychologists.length})
              </h2>
            </div>

            {filteredPsychologists.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-gray-500 mb-4">
                    <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Nenhum psicólogo encontrado</h3>
                    <p className="text-sm">
                      {psychologists.length === 0 
                        ? "Ainda não há psicólogos cadastrados na plataforma."
                        : "Nenhum psicólogo corresponde aos filtros selecionados."
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredPsychologists.map((psychologist) => (
                  <Card key={psychologist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                          <Avatar className="w-24 h-24">
                            <AvatarImage 
                              src={psychologist.profileImage} 
                              alt={psychologist.name}
                              className="object-cover object-center"
                            />
                            <AvatarFallback className="text-2xl">
                              {psychologist.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-grow space-y-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {psychologist.name}
                              </h3>
                              <Badge className="bg-green-100 text-green-800">
                                <Shield className="w-3 h-3 mr-1" />
                                CRP: {psychologist.crp}
                              </Badge>
                            </div>
                            <p className="text-gray-600">{psychologist.specialty}</p>
                            <p className="text-sm text-gray-500">{psychologist.experience}</p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium text-gray-700 ml-1">
                                {psychologist.rating}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">(Novo)</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {psychologist.attendanceTypes?.remoto && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Monitor className="w-3 h-3" />
                                Online
                              </Badge>
                            )}
                            {psychologist.attendanceTypes?.presencial && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                Presencial
                              </Badge>
                            )}
                          </div>

                          {psychologist.attendanceTypes?.presencial && psychologist.clinicAddress && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {psychologist.clinicAddress}
                            </p>
                          )}
                        </div>

                        <div className="flex-shrink-0 text-right space-y-3">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              R$ {psychologist.price}
                            </div>
                            <div className="text-sm text-gray-500">por sessão</div>
                          </div>

                          <div className="space-y-2">
                            <Button 
                              className="w-full bg-primary hover:bg-primary/90"
                              onClick={() => handleSchedule(psychologist)}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Agendar Consulta
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleSendMessage(psychologist)}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Enviar Mensagem
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleFavorite(psychologist)}
                            >
                              <Heart className={`w-4 h-4 mr-2 ${isFavorite(psychologist.id) ? 'fill-current text-red-500' : ''}`} />
                              {isFavorite(psychologist.id) ? 'Remover dos Favoritos' : 'Favoritar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AppointmentCalendar
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        psychologistId={selectedPsychologist?.id || 0}
        psychologistName={selectedPsychologist?.name || ""}
      />

      <MessagesModal
  open={showMessages}
  onOpenChange={setShowMessages}
  recipientId={selectedPsychologist?.id?.toString()}
  recipientName={selectedPsychologist?.name}
  userId={user?.id?.toString()}   // 🔑 novo
  userType="patient"              // 🔑 novo
/>
    </div>
  );
};

export default PatientDashboard;
