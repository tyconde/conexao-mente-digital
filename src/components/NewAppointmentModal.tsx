
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAppointment: (appointment: {
    patientName: string;
    patientEmail: string;
    date: string;
    time: string;
    type: string;
    attendanceType: string;
    status: "confirmada" | "pendente";
    notes?: string;
    professionalId: number;
    professionalName: string;
    patientId: number;
  }) => void;
  professionalId?: number;
}

export const NewAppointmentModal = ({ 
  isOpen, 
  onClose, 
  onCreateAppointment, 
  professionalId 
}: NewAppointmentModalProps) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    date: "",
    time: "",
    type: "Primeira consulta",
    attendanceType: "remoto",
    status: "confirmada" as "confirmada" | "pendente",
    notes: ""
  });

  // Carregar configurações do profissional para mostrar opções disponíveis
  const professionalSettings = JSON.parse(
    localStorage.getItem(`professional_settings_${professionalId || user?.id}`) || 
    '{"attendanceTypes": {"remoto": true, "presencial": false}}'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.patientEmail || !formData.date || !formData.time) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Validar se a data não é no passado
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      alert("Não é possível criar agendamentos para datas passadas!");
      return;
    }

    onCreateAppointment({
      ...formData,
      professionalId: professionalId || user?.id || 0,
      professionalName: user?.name || "",
      patientId: Date.now(), // Temporary ID for manual appointments
    });

    // Reset form
    setFormData({
      patientName: "",
      patientEmail: "",
      date: "",
      time: "",
      type: "Primeira consulta",
      attendanceType: "remoto",
      status: "confirmada",
      notes: ""
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patientName">Nome do Paciente *</Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              placeholder="Nome completo do paciente"
              required
            />
          </div>

          <div>
            <Label htmlFor="patientEmail">Email do Paciente *</Label>
            <Input
              id="patientEmail"
              type="email"
              value={formData.patientEmail}
              onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <Label htmlFor="time">Horário *</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo de Consulta</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Primeira consulta">Primeira consulta</SelectItem>
                <SelectItem value="Consulta de retorno">Consulta de retorno</SelectItem>
                <SelectItem value="Sessão de terapia">Sessão de terapia</SelectItem>
                <SelectItem value="Avaliação psicológica">Avaliação psicológica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="attendanceType">Tipo de Atendimento</Label>
            <Select value={formData.attendanceType} onValueChange={(value) => setFormData({ ...formData, attendanceType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {professionalSettings.attendanceTypes.remoto && (
                  <SelectItem value="remoto">Atendimento Remoto</SelectItem>
                )}
                {professionalSettings.attendanceTypes.presencial && (
                  <SelectItem value="presencial">Atendimento Presencial</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais sobre a consulta..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Criar Agendamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
