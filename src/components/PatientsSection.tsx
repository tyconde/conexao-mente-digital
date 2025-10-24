import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageCircle, FileText, UserCircle, User, Calendar } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";

interface PatientsSectionProps {
  onViewProntuario: (patientName: string, prontuarioId?: number) => void;
  onSendMessage?: (patientId: string | number, patientName: string, appointmentId?: number) => void;
}

export const PatientsSection = ({ onViewProntuario, onSendMessage }: PatientsSectionProps) => {
  const { patients } = usePatients();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (confirmed: number, pending: number) => {
    if (pending > 0) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pendente</Badge>;
    }
    if (confirmed > 0) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Ativo</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">Inativo</Badge>;
  };

  if (patients.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">Nenhum paciente encontrado</p>
        <p className="mb-4">Os pacientes aparecerão aqui quando você tiver agendamentos confirmados</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => p.confirmedAppointments > 0 || p.pendingAppointments > 0).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Com Prontuário</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => p.hasProntuario).length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Primeira Consulta</TableHead>
                <TableHead>Total Consultas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prontuário</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {patient.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.age || "-"}
                  </TableCell>
                  <TableCell>
                    {formatDate(patient.firstAppointment)}
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <p className="font-medium">{patient.totalAppointments}</p>
                      <p className="text-xs text-gray-500">
                        {patient.confirmedAppointments} confirmadas
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(patient.confirmedAppointments, patient.pendingAppointments)}
                  </TableCell>
                  <TableCell>
                    {patient.hasProntuario ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        <FileText className="w-3 h-3 mr-1" />
                        Sim
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                        Não
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {patient.hasProntuario && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewProntuario(patient.name, patient.prontuarioId)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Ver Prontuário
                        </Button>
                      )}
                      {onSendMessage && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSendMessage(patient.id, patient.name)}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Mensagem
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
