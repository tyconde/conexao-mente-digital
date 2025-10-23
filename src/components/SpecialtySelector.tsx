import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SpecialtySelectorProps {
  selectedSpecialties: string[];
  onChange: (specialties: string[]) => void;
}

const COMMON_SPECIALTIES = [
  "Psicologia Clínica",
  "Psicanálise",
  "Terapia Cognitivo-Comportamental (TCC)",
  "Psicologia Infantil",
  "Psicologia do Adolescente",
  "Psicologia Familiar",
  "Psicologia Organizacional",
  "Neuropsicologia",
  "Psicologia Hospitalar",
  "Psicoterapia de Casal",
  "Terapia de Grupo",
  "Psicologia Esportiva",
  "Autismo e TEA",
  "Síndrome de Down",
  "TDAH",
  "Ansiedade e Depressão"
];

export const SpecialtySelector = ({ selectedSpecialties, onChange }: SpecialtySelectorProps) => {
  const [showOther, setShowOther] = useState(false);
  const [customSpecialty, setCustomSpecialty] = useState("");

  const handleToggleSpecialty = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      onChange(selectedSpecialties.filter(s => s !== specialty));
    } else {
      onChange([...selectedSpecialties, specialty]);
    }
  };

  const handleAddCustomSpecialty = () => {
    if (customSpecialty.trim() && !selectedSpecialties.includes(customSpecialty.trim())) {
      onChange([...selectedSpecialties, customSpecialty.trim()]);
      setCustomSpecialty("");
      setShowOther(false);
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    onChange(selectedSpecialties.filter(s => s !== specialty));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base mb-3 block">Especialidades *</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Selecione uma ou mais especialidades
        </p>

        {/* Especialidades selecionadas */}
        {selectedSpecialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
            {selectedSpecialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="gap-1">
                {specialty}
                <button
                  type="button"
                  onClick={() => handleRemoveSpecialty(specialty)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Grid de especialidades comuns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border rounded-lg">
          {COMMON_SPECIALTIES.map((specialty) => (
            <div key={specialty} className="flex items-start space-x-2">
              <Checkbox
                id={specialty}
                checked={selectedSpecialties.includes(specialty)}
                onCheckedChange={() => handleToggleSpecialty(specialty)}
              />
              <label
                htmlFor={specialty}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {specialty}
              </label>
            </div>
          ))}

          {/* Opção "Outra" */}
          <div className="flex items-start space-x-2 col-span-full">
            <Checkbox
              id="other"
              checked={showOther}
              onCheckedChange={(checked) => setShowOther(checked as boolean)}
            />
            <label
              htmlFor="other"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Outra especialidade
            </label>
          </div>
        </div>

        {/* Campo para especialidade customizada */}
        {showOther && (
          <div className="mt-3 flex gap-2">
            <Input
              value={customSpecialty}
              onChange={(e) => setCustomSpecialty(e.target.value)}
              placeholder="Digite a especialidade"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomSpecialty();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomSpecialty}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
            >
              Adicionar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
