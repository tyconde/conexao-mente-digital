
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import { FavoritesList } from "./FavoritesList";

interface DashboardFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedSpecialty: string;
  setSelectedSpecialty: (specialty: string) => void;
  priceFilter: string[];
  handlePriceFilterChange: (range: string) => void;
  availableSpecialties: string[];
}

export const DashboardFilters = ({
  searchTerm,
  setSearchTerm,
  selectedSpecialty,
  setSelectedSpecialty,
  priceFilter,
  handlePriceFilterChange,
  availableSpecialties
}: DashboardFiltersProps) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Buscar por nome
            </label>
            <Input
              placeholder="Nome do psicólogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Especialidade
            </label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              {availableSpecialties.map((spec, index) => (
                <option key={index} value={index === 0 ? "all" : spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Faixa de preço
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  checked={priceFilter.includes("100-150")}
                  onChange={() => handlePriceFilterChange("100-150")}
                />
                <span className="text-sm">R$ 100 - R$ 150</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  checked={priceFilter.includes("150-200")}
                  onChange={() => handlePriceFilterChange("150-200")}
                />
                <span className="text-sm">R$ 150 - R$ 200</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  checked={priceFilter.includes("200+")}
                  onChange={() => handlePriceFilterChange("200+")}
                />
                <span className="text-sm">R$ 200+</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <FavoritesList />
    </div>
  );
};
