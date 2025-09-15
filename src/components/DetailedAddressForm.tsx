
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DetailedAddressFormProps {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  onStreetChange: (value: string) => void;
  onNumberChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onZipCodeChange: (value: string) => void;
  disabled?: boolean;
}

export const DetailedAddressForm = ({
  street,
  number,
  neighborhood,
  city,
  state,
  zipCode,
  onStreetChange,
  onNumberChange,
  onNeighborhoodChange,
  onCityChange,
  onStateChange,
  onZipCodeChange,
  disabled = false
}: DetailedAddressFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="street">Rua/Avenida *</Label>
          <Input
            id="street"
            value={street}
            onChange={(e) => onStreetChange(e.target.value)}
            disabled={disabled}
            className={disabled ? "bg-gray-50" : ""}
            placeholder="Nome da rua ou avenida"
            required
          />
        </div>
        <div>
          <Label htmlFor="number">Número *</Label>
          <Input
            id="number"
            value={number}
            onChange={(e) => onNumberChange(e.target.value)}
            disabled={disabled}
            className={disabled ? "bg-gray-50" : ""}
            placeholder="123"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="neighborhood">Bairro *</Label>
          <Input
            id="neighborhood"
            value={neighborhood}
            onChange={(e) => onNeighborhoodChange(e.target.value)}
            disabled={disabled}
            className={disabled ? "bg-gray-50" : ""}
            placeholder="Nome do bairro"
            required
          />
        </div>
        <div>
          <Label htmlFor="zipCode">CEP *</Label>
          <Input
            id="zipCode"
            value={zipCode}
            onChange={(e) => onZipCodeChange(e.target.value)}
            disabled={disabled}
            className={disabled ? "bg-gray-50" : ""}
            placeholder="00000-000"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Cidade *</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={disabled}
            className={disabled ? "bg-gray-50" : ""}
            placeholder="Nome da cidade"
            required
          />
        </div>
        <div>
          <Label htmlFor="state">Estado *</Label>
          <Input
            id="state"
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            disabled={disabled}
            className={disabled ? "bg-gray-50" : ""}
            placeholder="SP"
            maxLength={2}
            required
          />
        </div>
      </div>
    </div>
  );
};
