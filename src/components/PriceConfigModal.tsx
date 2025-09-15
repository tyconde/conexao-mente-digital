
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface PriceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrice: number;
  onPriceUpdate: (price: number) => void;
}

export const PriceConfigModal = ({ isOpen, onClose, currentPrice, onPriceUpdate }: PriceConfigModalProps) => {
  const [price, setPrice] = useState(currentPrice.toString());
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSave = () => {
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido para a consulta.",
        variant: "destructive",
      });
      return;
    }

    // Salvar preço no localStorage
    localStorage.setItem(`consultation_price_${user?.id}`, JSON.stringify(priceValue));
    onPriceUpdate(priceValue);

    toast({
      title: "Sucesso",
      description: `Valor da consulta atualizado para R$ ${priceValue.toFixed(2)}`,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Configurar Valor da Consulta
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Valor da Consulta (R$)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150.00"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Valor
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
