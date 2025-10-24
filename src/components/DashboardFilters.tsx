
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, Search, DollarSign, Briefcase, Sparkles } from "lucide-react";
import { FavoritesList } from "./FavoritesList";
import { PROFESSIONAL_BADGES, BadgeId } from "@/constants/professionalData";

interface DashboardFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedSpecialties: string[];
  setSelectedSpecialties: (specialties: string[]) => void;
  priceFilter: string[];
  handlePriceFilterChange: (range: string) => void;
  availableSpecialties: string[];
  selectedBadges: BadgeId[];
  handleBadgeFilterChange: (badgeId: BadgeId) => void;
}

export const DashboardFilters = ({
  searchTerm,
  setSearchTerm,
  selectedSpecialties,
  setSelectedSpecialties,
  priceFilter,
  handlePriceFilterChange,
  availableSpecialties,
  selectedBadges,
  handleBadgeFilterChange
}: DashboardFiltersProps) => {
  
  const handleSpecialtyToggle = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty));
    } else {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };

  return (
    <div className="lg:col-span-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buscar por nome */}
          <div className="space-y-2">
            <Label htmlFor="search" className="flex items-center gap-2 text-sm font-medium">
              <Search className="w-4 h-4" />
              Buscar por nome
            </Label>
            <Input
              id="search"
              placeholder="Nome do psicólogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Especialidades */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="w-4 h-4" />
              Especialidades
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-muted/20">
              {availableSpecialties.map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox
                    id={`specialty-${specialty}`}
                    checked={selectedSpecialties.includes(specialty)}
                    onCheckedChange={() => handleSpecialtyToggle(specialty)}
                  />
                  <label
                    htmlFor={`specialty-${specialty}`}
                    className="text-sm leading-none cursor-pointer flex-1"
                  >
                    {specialty}
                  </label>
                </div>
              ))}
            </div>
            {selectedSpecialties.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {selectedSpecialties.length} especialidade{selectedSpecialties.length > 1 ? 's' : ''} selecionada{selectedSpecialties.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Habilidades e Familiaridades */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Habilidades e Familiaridades
            </Label>
            <div className="space-y-2 max-h-64 overflow-y-auto p-2 border rounded-md bg-muted/20">
              {PROFESSIONAL_BADGES.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`badge-${badge.id}`}
                      checked={selectedBadges.includes(badge.id as BadgeId)}
                      onCheckedChange={() => handleBadgeFilterChange(badge.id as BadgeId)}
                    />
                    <label
                      htmlFor={`badge-${badge.id}`}
                      className="text-sm leading-none cursor-pointer flex items-center gap-2 flex-1"
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {badge.label}
                    </label>
                  </div>
                );
              })}
            </div>
            {selectedBadges.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {selectedBadges.length} habilidade{selectedBadges.length > 1 ? 's' : ''} selecionada{selectedBadges.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Faixa de preço */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-4 h-4" />
              Faixa de preço
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="price-100-150"
                  checked={priceFilter.includes("100-150")}
                  onCheckedChange={() => handlePriceFilterChange("100-150")}
                />
                <label
                  htmlFor="price-100-150"
                  className="text-sm leading-none cursor-pointer"
                >
                  R$ 100 - R$ 150
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="price-150-200"
                  checked={priceFilter.includes("150-200")}
                  onCheckedChange={() => handlePriceFilterChange("150-200")}
                />
                <label
                  htmlFor="price-150-200"
                  className="text-sm leading-none cursor-pointer"
                >
                  R$ 150 - R$ 200
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="price-200-plus"
                  checked={priceFilter.includes("200+")}
                  onCheckedChange={() => handlePriceFilterChange("200+")}
                />
                <label
                  htmlFor="price-200-plus"
                  className="text-sm leading-none cursor-pointer"
                >
                  R$ 200+
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FavoritesList />
    </div>
  );
};