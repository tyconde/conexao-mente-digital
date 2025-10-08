
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Prontuario, useProntuarios } from "@/hooks/useProntuarios";
import { useAuth } from "@/hooks/useAuth";

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
  
  // Buscar prontuário existente
  const existingProntuario = prontuarios.find(p => 
    p.id === prontuarioId || p.paciente.toLowerCase() === patientName.toLowerCase()
  );

  const [formData, setFormData] = useState({
    paciente: patientName,
    psicologo: user?.name || "",
    idade: existingProntuario?.idade || "",
    profissao: existingProntuario?.profissao || "",
    estadoCivil: existingProntuario?.estadoCivil || "",
    telefone: existingProntuario?.telefone || "",
    email: existingProntuario?.email || "",
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

  const [sessions, setSessions] = useState(existingProntuario?.sessoes || []);
  const [newSession, setNewSession] = useState({
    data: new Date().toISOString().split('T')[0],
    observacoes: "",
    evolucao: "",
    proximaConsulta: ""
  });

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
            Prontuário - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                <h4 className="font-medium mb-3">Nova Sessão</h4>
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
