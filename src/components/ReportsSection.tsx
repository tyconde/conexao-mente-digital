import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Calendar, Users, DollarSign, TrendingUp } from "lucide-react";
import { useProfessionalAppointments } from "@/hooks/useProfessionalAppointments";
import { usePatients } from "@/hooks/usePatients";

interface ReportsSectionProps {
  consultationPrice: number;
}

export const ReportsSection = ({ consultationPrice }: ReportsSectionProps) => {
  const { appointments } = useProfessionalAppointments();
  const { patients } = usePatients();

  // Dados para gráfico mensal
  const monthlyData = () => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      const monthAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getMonth() === date.getMonth() && 
               aptDate.getFullYear() === date.getFullYear() &&
               apt.status === "confirmada";
      });
      
      last6Months.push({
        month: monthName,
        consultas: monthAppointments.length,
        receita: monthAppointments.length * consultationPrice
      });
    }
    
    return last6Months;
  };

  // Dados para gráfico de pizza (tipos de atendimento)
  const attendanceTypeData = () => {
    const presencial = appointments.filter(apt => apt.attendanceType === "presencial").length;
    const remoto = appointments.filter(apt => apt.attendanceType === "remoto").length;
    
    return [
      { name: "Presencial", value: presencial, color: "#3b82f6" },
      { name: "Remoto", value: remoto, color: "#10b981" }
    ];
  };

  const totalRevenue = appointments.filter(apt => apt.status === "confirmada").length * consultationPrice;
  const avgAppointmentsPerPatient = patients.length > 0 ? 
    appointments.filter(apt => apt.status === "confirmada").length / patients.length : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultas Confirmadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(apt => apt.status === "confirmada").length}
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
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média Consultas/Paciente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {avgAppointmentsPerPatient.toFixed(1)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Consultas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="consultas" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Atendimento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceTypeData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceTypeData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receita Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
              <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
