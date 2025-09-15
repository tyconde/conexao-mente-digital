
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users } from "lucide-react";

interface UserTypeSelectorProps {
  onSelectType: (type: "patient" | "professional") => void;
  onBack: () => void;
}

export const UserTypeSelector = ({ onSelectType, onBack }: UserTypeSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Escolha seu perfil</h2>
        <p className="text-muted-foreground">Selecione como você deseja se cadastrar</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary"
          onClick={() => onSelectType("patient")}
        >
          <CardHeader className="text-center">
            <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-xl">Sou Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Busco atendimento psicológico profissional
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary"
          onClick={() => onSelectType("professional")}
        >
          <CardHeader className="text-center">
            <div className="w-28 h-28 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-16 h-16 text-secondary" />
            </div>
            <CardTitle className="text-xl">Sou Psicólogo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Quero gerenciar minha prática profissional
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </div>
  );
};
