import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { DashboardFilters } from "@/components/DashboardFilters";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { useRegisteredPsychologists } from "@/hooks/useRegisteredPsychologists";
import { BadgeId } from "@/constants/professionalData";

const Search = () => {
  const { psychologists } = useRegisteredPsychologists();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<BadgeId[]>([]);

  // Extrair todas as especialidades únicas de todos os profissionais
  const availableSpecialties = useMemo(() => {
    const specialtiesSet = new Set<string>();
    psychologists.forEach(prof => {
      if (prof.specialties && Array.isArray(prof.specialties)) {
        prof.specialties.forEach(spec => specialtiesSet.add(spec));
      }
    });
    return Array.from(specialtiesSet).sort();
  }, [psychologists]);

  const handlePriceFilterChange = (range: string) => {
    setPriceFilter(prev => 
      prev.includes(range) 
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const handleBadgeFilterChange = (badgeId: BadgeId) => {
    setSelectedBadges(prev =>
      prev.includes(badgeId) ? prev.filter(b => b !== badgeId) : [...prev, badgeId]
    );
  };

  // Função de filtragem combinada
  const filteredPsychologists = useMemo(() => {
    return psychologists.filter(prof => {
      // Filtro por nome
      if (searchTerm && !prof.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtro por especialidades (deve ter PELO MENOS UMA das especialidades selecionadas)
      if (selectedSpecialties.length > 0) {
        const hasMatchingSpecialty = selectedSpecialties.some(selectedSpec => 
          prof.specialties?.includes(selectedSpec)
        );
        if (!hasMatchingSpecialty) return false;
      }

      // Filtro por preço
      if (priceFilter.length > 0) {
        const price = prof.price || 0;
        const matchesPrice = priceFilter.some(range => {
          if (range === "100-150") return price >= 100 && price <= 150;
          if (range === "150-200") return price >= 150 && price <= 200;
          if (range === "200+") return price >= 200;
          return false;
        });
        if (!matchesPrice) return false;
      }

      // Filtro por badges (deve ter TODAS as badges selecionadas)
      if (selectedBadges.length > 0) {
        const hasBadges = selectedBadges.every(badgeId => 
          prof.badges?.includes(badgeId)
        );
        if (!hasBadges) return false;
      }

      return true;
    });
  }, [psychologists, searchTerm, selectedSpecialties, priceFilter, selectedBadges]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Encontre seu Psicólogo
          </h1>
          <p className="text-muted-foreground">
            {filteredPsychologists.length} profissiona{filteredPsychologists.length !== 1 ? 'is' : 'l'} encontrado{filteredPsychologists.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <DashboardFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedSpecialties={selectedSpecialties}
            setSelectedSpecialties={setSelectedSpecialties}
            priceFilter={priceFilter}
            handlePriceFilterChange={handlePriceFilterChange}
            availableSpecialties={availableSpecialties}
            selectedBadges={selectedBadges}
            handleBadgeFilterChange={handleBadgeFilterChange}
          />

          <div className="lg:col-span-3">
            {filteredPsychologists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Nenhum profissional encontrado com os filtros selecionados.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tente ajustar os filtros para ver mais resultados.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPsychologists.map((professional) => (
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
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Search;