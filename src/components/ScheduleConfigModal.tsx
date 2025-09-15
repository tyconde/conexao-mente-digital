import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";

interface ScheduleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WeekSchedule {
  [key: string]: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface ProfessionalSettings {
  schedule: WeekSchedule;
  attendanceTypes: {
    presencial: boolean;
    remoto: boolean;
  };
  address: string;
}

const weekDays = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" }
];

export const ScheduleConfigModal = ({ isOpen, onClose }: ScheduleConfigModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [settings, setSettings] = useState<ProfessionalSettings>(() => {
    const saved = localStorage.getItem(`professional_settings_${user?.id}`);
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      schedule: {
        monday: { enabled: false, start: "08:00", end: "18:00" },
        tuesday: { enabled: false, start: "08:00", end: "18:00" },
        wednesday: { enabled: false, start: "08:00", end: "18:00" },
        thursday: { enabled: false, start: "08:00", end: "18:00" },
        friday: { enabled: false, start: "08:00", end: "18:00" },
        saturday: { enabled: false, start: "08:00", end: "18:00" },
        sunday: { enabled: false, start: "08:00", end: "18:00" }
      },
      attendanceTypes: {
        presencial: false,
        remoto: true
      },
      address: ""
    };
  });

  const handleScheduleChange = (day: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value
        }
      }
    }));
  };

  const handleAttendanceTypeChange = (type: "presencial" | "remoto", checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      attendanceTypes: {
        ...prev.attendanceTypes,
        [type]: checked
      }
    }));
  };

  const handleSave = () => {
    if (!settings.attendanceTypes.presencial && !settings.attendanceTypes.remoto) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um tipo de atendimento.",
        variant: "destructive",
      });
      return;
    }

    if (settings.attendanceTypes.presencial && !settings.address.trim()) {
      toast({
        title: "Erro",
        description: "Para atendimento presencial, é necessário informar o endereço.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem(`professional_settings_${user?.id}`, JSON.stringify(settings));
    
    toast({
      title: "Sucesso",
      description: "Configurações salvas com sucesso!",
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Configurações de Horários e Atendimento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Tipos de Atendimento */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tipos de Atendimento</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remoto"
                  checked={settings.attendanceTypes.remoto}
                  onCheckedChange={(checked) => handleAttendanceTypeChange("remoto", checked as boolean)}
                />
                <Label htmlFor="remoto">Atendimento Remoto (Online)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="presencial"
                  checked={settings.attendanceTypes.presencial}
                  onCheckedChange={(checked) => handleAttendanceTypeChange("presencial", checked as boolean)}
                />
                <Label htmlFor="presencial">Atendimento Presencial</Label>
              </div>
            </div>
          </div>

          {/* Endereço do Consultório */}
          {settings.attendanceTypes.presencial && (
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Endereço do Consultório
              </Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Rua, número, bairro, cidade, CEP"
                rows={3}
              />
            </div>
          )}

          {/* Horários da Semana */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Horários Disponíveis</Label>
            <div className="space-y-3">
              {weekDays.map((day) => (
                <div key={day.key} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex items-center space-x-2 w-32">
                    <Checkbox
                      id={day.key}
                      checked={settings.schedule[day.key].enabled}
                      onCheckedChange={(checked) => 
                        handleScheduleChange(day.key, "enabled", checked as boolean)
                      }
                    />
                    <Label htmlFor={day.key} className="text-sm">{day.label}</Label>
                  </div>
                  
                  {settings.schedule[day.key].enabled && (
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Das</Label>
                      <Input
                        type="time"
                        value={settings.schedule[day.key].start}
                        onChange={(e) => handleScheduleChange(day.key, "start", e.target.value)}
                        className="w-24"
                      />
                      <Label className="text-sm">até</Label>
                      <Input
                        type="time"
                        value={settings.schedule[day.key].end}
                        onChange={(e) => handleScheduleChange(day.key, "end", e.target.value)}
                        className="w-24"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
