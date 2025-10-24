import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { useRegisteredPsychologists } from "@/hooks/useRegisteredPsychologists";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { psychologists } = useRegisteredPsychologists();
  const navigate = useNavigate();
  
  // Mostrar apenas os primeiros 6 profissionais
  const featuredPsychologists = psychologists.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      
      {/* Seção de Profissionais */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Nossos Profissionais
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Encontre o psicólogo ideal para sua jornada de autoconhecimento e bem-estar.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredPsychologists.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                id={professional.id}
                name={professional.name}
                specialty={professional.specialty}
                experience={professional.experience || "Recém cadastrado"}
                rating={professional.rating || 5.0}
                price={professional.price || 150}
                image={professional.profileImage ? 
                  professional.profileImage : 
                  "/lovable-uploads/b64b7a88-15de-433a-a0f9-53def99e2ff7.png"
                }
              />
            ))}
          </div>

          {psychologists.length > 6 && (
            <div className="text-center">
              <Button 
                size="lg"
                onClick={() => navigate('/search')}
                className="gap-2"
              >
                <Search className="w-5 h-5" />
                Ver todos os profissionais ({psychologists.length})
              </Button>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
