
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Save, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Prontuario, useProntuarios } from "@/hooks/useProntuarios";
import { useAuth } from "@/hooks/useAuth";
import { usePatients } from "@/hooks/usePatients";
import { useProfessionalAppointments } from "@/hooks/useProfessionalAppointments";

interface ProntuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  prontuarioId?: number;
  editingProntuario?: any; // ou o tipo correto do prontuário
  addProntuario?: (prontuario: Omit<Prontuario, "id" | "dataCriacao" | "dataUltimaAtualizacao">) => void;
  updateProntuario?: (id: string, updates: Partial<Prontuario>) => void;
  deleteProntuario?: (id: number) => void;
}

export const ProntuarioModal = ({ isOpen, onClose, patientName, prontuarioId }: ProntuarioModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { prontuarios, addProntuario, updateProntuario } = useProntuarios();
  const { patients } = usePatients();
  const { appointments } = useProfessionalAppointments();
  
  const [selectedPatient, setSelectedPatient] = useState(patientName);
  
  // Filtrar pacientes com consultas confirmadas
  const confirmedPatients = patients.filter(p => p.confirmedAppointments > 0);
  
  // Buscar prontuário existente
  const existingProntuario = prontuarios.find(p => 
    p.id === prontuarioId || p.paciente.toLowerCase() === selectedPatient.toLowerCase()
  );
  
  // Buscar dados do paciente selecionado
  const selectedPatientData = patients.find(p => p.name === selectedPatient);
  
  // Buscar dados completos do usuário registrado
  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
  const selectedUserData = registeredUsers.find((u: any) => 
    u.name === selectedPatient && u.type === "patient"
  );
  
  // Buscar consultas confirmadas e realizadas do paciente selecionado (data passada)
  const today = new Date().toISOString().split('T')[0];
  const patientCompletedAppointments = appointments.filter(apt => 
    apt.patientName === selectedPatient && 
    apt.status === "confirmada" &&
    apt.date < today
  );

  const [formData, setFormData] = useState({
    paciente: selectedPatient,
    psicologo: user?.name || "",
    idade: existingProntuario?.idade || selectedPatientData?.age || "",
    profissao: existingProntuario?.profissao || "",
    estadoCivil: existingProntuario?.estadoCivil || "",
    telefone: existingProntuario?.telefone || "",
    email: existingProntuario?.email || selectedPatientData?.email || "",
    endereco: existingProntuario?.endereco || "",
    cpf: existingProntuario?.cpf || "",
    motivoConsulta: existingProntuario?.motivoConsulta || "",
    historicoMedico: existingProntuario?.historicoMedico || "",
    medicamentos: existingProntuario?.medicamentos || "",
    observacoes: existingProntuario?.observacoes || "",
    demandaInicial: existingProntuario?.demandaInicial || "",
    objetivoTratamento: existingProntuario?.objetivoTratamento || "",
    evolucaoPaciente: existingProntuario?.evolucaoPaciente || "",
    anotacoesGerais: existingProntuario?.anotacoesGerais || ""
  });
  
  const [selectedAppointment, setSelectedAppointment] = useState<string>("");

  const [sessions, setSessions] = useState(existingProntuario?.sessoes || []);
  const [newSession, setNewSession] = useState({
    data: new Date().toISOString().split('T')[0],
    observacoes: "",
    evolucao: "",
    proximaConsulta: ""
  });
  
  // Atualizar dados quando paciente é selecionado
  useEffect(() => {
    if (selectedPatient) {
      const patientData = patients.find(p => p.name === selectedPatient);
      const existingPront = prontuarios.find(p => p.paciente.toLowerCase() === selectedPatient.toLowerCase());
      
      const userData = registeredUsers.find((u: any) => 
        u.name === selectedPatient && u.type === "patient"
      );
      
      setFormData({
        paciente: selectedPatient,
        psicologo: user?.name || "",
        idade: existingPront?.idade || patientData?.age || userData?.age || "",
        profissao: existingPront?.profissao || userData?.profession || "",
        estadoCivil: existingPront?.estadoCivil || userData?.maritalStatus || "",
        telefone: existingPront?.telefone || userData?.phone || "",
        email: existingPront?.email || patientData?.email || userData?.email || "",
        endereco: existingPront?.endereco || userData?.address || "",
        cpf: existingPront?.cpf || "",
        motivoConsulta: existingPront?.motivoConsulta || "",
        historicoMedico: existingPront?.historicoMedico || "",
        medicamentos: existingPront?.medicamentos || "",
        observacoes: existingPront?.observacoes || "",
        demandaInicial: existingPront?.demandaInicial || "",
        objetivoTratamento: existingPront?.objetivoTratamento || "",
        evolucaoPaciente: existingPront?.evolucaoPaciente || "",
        anotacoesGerais: existingPront?.anotacoesGerais || ""
      });
      
      setSessions(existingPront?.sessoes || []);
    }
  }, [selectedPatient, patients, prontuarios, user]);
  
  // Preencher sessão com dados da consulta selecionada
  const handleSelectAppointment = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    const appointment = patientCompletedAppointments.find(apt => apt.id.toString() === appointmentId);
    if (appointment) {
      setNewSession({
        data: appointment.date,
        observacoes: `Consulta ${appointment.type} realizada em ${appointment.date} às ${appointment.time}`,
        evolucao: "",
        proximaConsulta: ""
      });
    }
  };

  const handleSave = () => {
    if (!formData.paciente.trim()) {
      toast({
        title: "Erro",
        description: "Nome do paciente é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    const prontuarioData = {
      ...formData,
      sessoes: sessions,
      professionalId: parseInt(user?.id?.toString() || "0"),
      dataAtualizacao: new Date().toISOString()
    };

    if (existingProntuario) {
      updateProntuario(existingProntuario.id.toString(), prontuarioData);
      toast({
        title: "Sucesso",
        description: "Prontuário atualizado com sucesso!",
      });
    } else {
      addProntuario(prontuarioData);
      toast({
        title: "Sucesso",
        description: "Prontuário criado com sucesso!",
      });
    }

    onClose();
  };

  const handleAddSession = () => {
    if (!newSession.observacoes.trim()) {
      toast({
        title: "Erro",
        description: "Observações da sessão são obrigatórias.",
        variant: "destructive",
      });
      return;
    }

    const sessionWithId = {
      ...newSession,
      id: Date.now(),
      dataRegistro: new Date().toISOString()
    };

    setSessions([...sessions, sessionWithId]);
    setNewSession({
      data: new Date().toISOString().split('T')[0],
      observacoes: "",
      evolucao: "",
      proximaConsulta: ""
    });

    toast({
      title: "Sucesso",
      description: "Sessão adicionada com sucesso!",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {existingProntuario ? `Prontuário - ${selectedPatient}` : "Novo Prontuário"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Paciente */}
          {!prontuarioId && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Selecionar Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um paciente com consultas confirmadas" />
                  </SelectTrigger>
                  <SelectContent>
                    {confirmedPatients.map(patient => (
                      <SelectItem key={patient.id} value={patient.name}>
                        {patient.name} - {patient.confirmedAppointments} consulta(s) confirmada(s)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPatientData && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    <p>📧 {selectedPatientData.email}</p>
                    <p>📅 Primeira consulta: {new Date(selectedPatientData.firstAppointment).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idade">Idade</Label>
                <Input
                  id="idade"
                  value={formData.idade}
                  onChange={(e) => setFormData({...formData, idade: e.target.value})}
                  placeholder="Ex: 35 anos"
                />
              </div>
              <div>
                <Label htmlFor="profissao">Profissão</Label>
                <Input
                  id="profissao"
                  value={formData.profissao}
                  onChange={(e) => setFormData({...formData, profissao: e.target.value})}
                  placeholder="Ex: Engenheiro"
                />
              </div>
              <div>
                <Label htmlFor="estadoCivil">Estado Civil</Label>
                <Input
                  id="estadoCivil"
                  value={formData.estadoCivil}
                  onChange={(e) => setFormData({...formData, estadoCivil: e.target.value})}
                  placeholder="Ex: Solteiro(a)"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  placeholder="Endereço completo"
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações Clínicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Clínicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="motivoConsulta">Motivo da Consulta</Label>
                <Textarea
                  id="motivoConsulta"
                  value={formData.motivoConsulta}
                  onChange={(e) => setFormData({...formData, motivoConsulta: e.target.value})}
                  placeholder="Descreva o motivo principal da consulta..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="historicoMedico">Histórico Médico</Label>
                <Textarea
                  id="historicoMedico"
                  value={formData.historicoMedico}
                  onChange={(e) => setFormData({...formData, historicoMedico: e.target.value})}
                  placeholder="Histórico médico relevante..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="medicamentos">Medicamentos em Uso</Label>
                <Textarea
                  id="medicamentos"
                  value={formData.medicamentos}
                  onChange={(e) => setFormData({...formData, medicamentos: e.target.value})}
                  placeholder="Liste os medicamentos em uso..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="observacoes">Observações Gerais</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Observações gerais sobre o paciente..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sessões */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registro de Sessões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista de sessões existentes */}
              {sessions.length > 0 && (
                <div className="space-y-3">
                  {sessions.map((session, index) => (
                    <div key={session.id || index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Sessão {index + 1}</h4>
                        <span className="text-sm text-gray-500">{session.data}</span>
                      </div>
                      <p className="text-sm mb-2">{session.observacoes}</p>
                      {session.evolucao && (
                        <p className="text-sm text-gray-600">
                          <strong>Evolução:</strong> {session.evolucao}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Nova sessão */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Nova Sessão
                </h4>
                
                {/* Seleção de Consulta Realizada */}
                {patientCompletedAppointments.length > 0 && (
                  <div className="mb-4">
                    <Label htmlFor="selectAppointment">Selecionar Consulta Realizada (Opcional)</Label>
                    <Select value={selectedAppointment} onValueChange={handleSelectAppointment}>
                      <SelectTrigger id="selectAppointment">
                        <SelectValue placeholder="Escolha uma consulta para registrar" />
                      </SelectTrigger>
                      <SelectContent>
                        {patientCompletedAppointments.map(apt => (
                          <SelectItem key={apt.id} value={apt.id.toString()}>
                            {new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.time} - {apt.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionDate">Data</Label>
                    <Input
                      id="sessionDate"
                      type="date"
                      value={newSession.data}
                      onChange={(e) => setNewSession({...newSession, data: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="proximaConsulta">Próxima Consulta</Label>
                    <Input
                      id="proximaConsulta"
                      type="date"
                      value={newSession.proximaConsulta}
                      onChange={(e) => setNewSession({...newSession, proximaConsulta: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="sessionObs">Observações da Sessão</Label>
                    <Textarea
                      id="sessionObs"
                      value={newSession.observacoes}
                      onChange={(e) => setNewSession({...newSession, observacoes: e.target.value})}
                      placeholder="Registre as observações desta sessão..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionEvolucao">Evolução</Label>
                    <Textarea
                      id="sessionEvolucao"
                      value={newSession.evolucao}
                      onChange={(e) => setNewSession({...newSession, evolucao: e.target.value})}
                      placeholder="Descreva a evolução do paciente..."
                      rows={2}
                    />
                  </div>
                </div>
                <Button onClick={handleAddSession} className="mt-3">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Sessão
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Prontuário
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
