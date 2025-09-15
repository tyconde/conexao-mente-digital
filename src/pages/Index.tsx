
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { useRegisteredPsychologists } from "@/hooks/useRegisteredPsychologists";
import { ProfessionalCard } from "@/components/ProfessionalCard";

const Index = () => {
  const { psychologists } = useRegisteredPsychologists();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      
      {/* Seção de Profissionais */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nossos Profissionais
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encontre o psicólogo ideal para sua jornada de autoconhecimento e bem-estar.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {psychologists.map((professional) => (
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
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
