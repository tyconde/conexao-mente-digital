import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  MessageCircle,
  Clock,
  Settings,
  User,
  FileText,
  BarChart,
  Plus
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProfessionalAppointments } from "@/hooks/useProfessionalAppointments";
import { useProntuarios } from "@/hooks/useProntuarios";
import { NewAppointmentModal } from "@/components/NewAppointmentModal";
import { PriceConfigModal } from "@/components/PriceConfigModal";
import { ProntuarioModal } from "@/components/ProntuarioModal";
import { ScheduleConfigModal } from "@/components/ScheduleConfigModal";
import { PatientsSection } from "@/components/PatientsSection";
import { ReportsSection } from "@/components/ReportsSection";
import { useMessages } from "@/hooks/useMessages";
import { MessagesModal } from "@/components/MessagesModal";

const ProfessionalDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showPriceConfigModal, setShowPriceConfigModal] = useState(false);
  const [showProntuarioModal, setShowProntuarioModal] = useState(false);
  const [showScheduleConfigModal, setShowScheduleConfigModal] = useState(false);
  const [editingProntuario, setEditingProntuario] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const { user } = useAuth();
  const { appointments, addAppointment, updateAppointment } = useProfessionalAppointments();
  const { prontuarios, addProntuario, updateProntuario, deleteProntuario } = useProntuarios();
  const { conversations, sendMessage, markAsRead } = useMessages(user?.id?.toString() || "", "professional");
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Improved redirect logic - only redirect if user is confirmed to not be professional
  useEffect(() => {
    const checkAuth = () => {
      if (!user) {
        window.location.href = "/";
        return;
      }
      
      if (user.type !== "professional") {
        alert("Acesso negado. Apenas profissionais podem acessar esta área.");
        window.location.href = "/";
        return;
      }
    };

    // Add a small delay to ensure auth state is properly loaded
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, [user]);

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (user.type !== "professional") {
    return null; // Component will redirect via useEffect
  }

  // Calculate stats based on real data
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const todayAppointments = appointments.filter(apt => apt.date === today);
  const thisMonthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
  });
  const confirmedAppointments = appointments.filter(apt => apt.status === "confirmada");
  const uniquePatients = new Set(appointments.map(apt => apt.patientEmail)).size;

  // Get professional's price
  const consultationPrice = JSON.parse(localStorage.getItem(`consultation_price_${user?.id}`) || "150");

  const stats = [
    {
      title: "Pacientes Ativos",
      value: uniquePatients.toString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Consultas Este Mês",
      value: thisMonthAppointments.length.toString(),
      change: "+8%",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Receita Mensal",
      value: `R$ ${(thisMonthAppointments.length * consultationPrice).toLocaleString()}`,
      change: "+15%",
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: "Taxa de Confirmação",
      value: `${appointments.length > 0 ? Math.round((confirmedAppointments.length / appointments.length) * 100) : 0}%`,
      change: "+3%",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  // Get pending appointment requests
  const pendingRequests = appointments.filter(apt => apt.status === "pendente");

  // Get upcoming appointments (today and tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const upcomingAppointments = appointments
    .filter(apt => apt.date === today || apt.date === tomorrowStr)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    })
    .slice(0, 5);

  const handleCreateAppointment = (appointmentData: any) => {
    addAppointment(appointmentData);
  };

  const handleEditProntuario = (prontuario: any) => {
    setEditingProntuario(prontuario);
    setSelectedPatientName(prontuario.paciente);
    setShowProntuarioModal(true);
  };

  const handleViewProntuario = (patientName: string, prontuarioId?: number) => {
    if (prontuarioId) {
      const prontuario = prontuarios.find(p => p.id === prontuarioId);
      if (prontuario) {
        setEditingProntuario(prontuario);
        setSelectedPatientName(prontuario.paciente);
        setShowProntuarioModal(true);
      }
    } else {
      setActiveTab("prontuarios");
    }
  };

  const handleCreateNewProntuario = () => {
    setEditingProntuario(null);
    setSelectedPatientName("Novo Paciente");
    setShowProntuarioModal(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) return "Hoje";
    if (dateStr === tomorrow.toISOString().split('T')[0]) return "Amanhã";
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getAttendanceTypeLabel = (type: string) => {
    return type === "presencial" ? "Presencial" : "Remoto";
  };

  const getAttendanceTypeBadge = (type: string) => {
    return type === "presencial" 
      ? "bg-blue-100 text-blue-800" 
      : "bg-green-100 text-green-800";
  };

  const handleApproveAppointment = (appointmentId: number) => {
    updateAppointment(appointmentId, { status: "confirmada" });
  };

  const handleRejectAppointment = (appointmentId: number) => {
    updateAppointment(appointmentId, { status: "cancelada" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo, {user.name}
          </h1>
          <p className="text-gray-600">
            Gerencie sua prática profissional de forma eficiente
          </p>
        </div>

        {/* Navegação por abas */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Visão Geral", icon: BarChart },
                { id: "appointments", label: "Agendamentos", icon: Calendar },
                { id: "prontuarios", label: "Prontuários", icon: FileText },
                { id: "patients", label: "Pacientes", icon: Users },
                { id: "reports", label: "Relatórios", icon: BarChart },
                { id: "messages", label: "Mensagens", icon: MessageCircle },
                { id: "settings", label: "Configurações", icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-green-600">{stat.change} vs mês anterior</p>
                      </div>
                      <div className={`${stat.color}`}>
                        <stat.icon className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mostrar solicitações pendentes se houver */}
            {pendingRequests.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800">
                    <Clock className="w-5 h-5 mr-2" />
                    Solicitações de Agendamento Pendentes ({pendingRequests.length})
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    Você tem solicitações de agendamento aguardando sua aprovação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {request.patientName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{request.patientName}</p>
                            <p className="text-sm text-gray-600">{request.patientEmail}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${getAttendanceTypeBadge(request.attendanceType)}`}>
                                {getAttendanceTypeLabel(request.attendanceType)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDate(request.date)} às {request.time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveAppointment(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectAppointment(request.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingRequests.length > 3 && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setActiveTab("appointments")}
                      >
                        Ver todas as {pendingRequests.length} solicitações
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Próximos agendamentos */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Próximos Agendamentos
                      </CardTitle>
                      <CardDescription>
                        Suas consultas para hoje e amanhã
                      </CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setShowNewAppointmentModal(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Novo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments.length > 0 ? (
                      upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                <User className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{appointment.patientName}</p>
                              <p className="text-sm text-gray-600">{appointment.type}</p>
                              <Badge className={`text-xs ${getAttendanceTypeBadge(appointment.attendanceType)}`}>
                                {getAttendanceTypeLabel(appointment.attendanceType)}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{appointment.time}</p>
                            <p className="text-sm text-gray-600">{formatDate(appointment.date)}</p>
                            <Badge 
                              className={`mt-1 ${
                                appointment.status === "confirmada" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum agendamento próximo</p>
                        <Button 
                          onClick={() => setShowNewAppointmentModal(true)}
                          className="mt-4"
                          variant="outline"
                        >
                          Criar primeiro agendamento
                        </Button>
                      </div>
                    )}
                  </div>
                  {upcomingAppointments.length > 0 && (
                    <Button className="w-full mt-4" variant="outline" onClick={() => setActiveTab("appointments")}>
                      Ver Todos os Agendamentos
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Mensagens recentes placeholder */}
              <Card>
    <CardContent className="space-y-3 max-h-64 overflow-y-auto">
      {conversations.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhuma mensagem recebida.</p>
      ) : (
        conversations
          .slice(0, 5) // mostra só as 5 últimas conversas
          .map((conv) => (
            <div
              key={conv.id}
              className="flex justify-between items-center border-b last:border-0 pb-2"
            >
              <div>
                <p className="font-medium text-sm">
                  {conv.patientName || conv.professionalName}
                </p>
                <p className="text-xs text-gray-600 line-clamp-1">
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          ))
      )}
    </CardContent>
  </Card>
            </div>

            {/* Ações rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesse rapidamente as funcionalidades mais usadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    className="h-20 flex flex-col items-center justify-center space-y-2" 
                    variant="outline"
                    onClick={() => setShowNewAppointmentModal(true)}
                  >
                    <Calendar className="w-6 h-6" />
                    <span className="text-sm">Novo Agendamento</span>
                  </Button>
                  <Button 
                    className="h-20 flex flex-col items-center justify-center space-y-2" 
                    variant="outline"
                    onClick={handleCreateNewProntuario}
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-sm">Criar Prontuário</span>
                  </Button>
                  <Button 
                    className="h-20 flex flex-col items-center justify-center space-y-2" 
                    variant="outline"
                    onClick={() => setShowPriceConfigModal(true)}
                  >
                    <DollarSign className="w-6 h-6" />
                    <span className="text-sm">Configurar Preços</span>
                  </Button>
                  <Button 
                    className="h-20 flex flex-col items-center justify-center space-y-2" 
                    variant="outline"
                    onClick={() => setShowScheduleConfigModal(true)}
                  >
                    <Clock className="w-6 h-6" />
                    <span className="text-sm">Configurar Horários</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Gerenciamento de Agendamentos</h3>
                <p className="text-gray-600">Visualize e gerencie todos os seus agendamentos</p>
              </div>
              <Button 
                onClick={() => setShowNewAppointmentModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Agendamento
              </Button>
            </div>

            {/* Seção de solicitações pendentes */}
            {pendingRequests.length > 0 && (
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800">
                    Solicitações Pendentes ({pendingRequests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {request.patientName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{request.patientName}</p>
                            <p className="text-sm text-gray-600">{request.patientEmail}</p>
                            <p className="text-sm text-gray-500">{request.type}</p>
                            <Badge className={`text-xs ${getAttendanceTypeBadge(request.attendanceType)}`}>
                              {getAttendanceTypeLabel(request.attendanceType)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{request.date} às {request.time}</p>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Aguardando aprovação
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveAppointment(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectAppointment(request.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de todos os agendamentos */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {appointments.length > 0 ? (
                    appointments
                      .sort((a, b) => {
                        if (a.date !== b.date) return b.date.localeCompare(a.date);
                        return b.time.localeCompare(a.time);
                      })
                      .map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback>
                                {appointment.patientName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{appointment.patientName}</p>
                              <p className="text-sm text-gray-600">{appointment.patientEmail}</p>
                              <p className="text-sm text-gray-500">{appointment.type}</p>
                              <Badge className={`text-xs ${getAttendanceTypeBadge(appointment.attendanceType)}`}>
                                {getAttendanceTypeLabel(appointment.attendanceType)}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{appointment.date} às {appointment.time}</p>
                            <Badge 
                              className={`mt-1 ${
                                appointment.status === "confirmada" 
                                  ? "bg-green-100 text-green-800" 
                                  : appointment.status === "pendente"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Nenhum agendamento encontrado</p>
                      <p className="mb-4">Comece criando seu primeiro agendamento</p>
                      <Button 
                        onClick={() => setShowNewAppointmentModal(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Criar Agendamento
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "prontuarios" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Gerenciamento de Prontuários</h3>
                <p className="text-gray-600">Visualize e gerencie os prontuários dos seus pacientes</p>
              </div>
              <Button 
                onClick={handleCreateNewProntuario}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Prontuário
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {prontuarios.length > 0 ? (
                    prontuarios
                      .sort((a, b) => new Date(b.dataUltimaAtualizacao).getTime() - new Date(a.dataUltimaAtualizacao).getTime())
                      .map((prontuario) => (
                        <div key={prontuario.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback>
                                {prontuario.paciente.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{prontuario.paciente}</p>
                              <p className="text-sm text-gray-600">Idade: {prontuario.idade} • Estado Civil: {prontuario.estadoCivil}</p>
                              <p className="text-sm text-gray-500">
                                Última atualização: {new Date(prontuario.dataUltimaAtualizacao).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditProntuario(prontuario)}
                            >
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteProntuario(prontuario.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Nenhum prontuário encontrado</p>
                      <p className="mb-4">Comece criando seu primeiro prontuário</p>
                      <Button 
                        onClick={handleCreateNewProntuario}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Criar Prontuário
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "patients" && (
          <PatientsSection 
            onViewProntuario={handleViewProntuario}
          />
        )}

        {activeTab === "reports" && (
          <ReportsSection 
            consultationPrice={consultationPrice}
          />
        )}

        {/* Outras abas placeholder */}
        {["messages", "settings"].includes(activeTab) && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === "messages" && (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Central de Mensagens</h3>
    {conversations.length === 0 ? (
      <p className="text-gray-600">Nenhuma mensagem recebida até agora.</p>
    ) : (
      conversations.map((conv) => (
        <Card
  key={conv.id}
  onClick={() => {
    markAsRead(conv.id);
    setSelectedConversationId(conv.id); // define conversa selecionada
    setIsMessagesOpen(true); // abre modal
  }}
  className="cursor-pointer"
>
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="font-medium text-gray-900">
                {conv.patientName}
              </p>
              <p className="text-sm text-gray-600 truncate w-48">
                {conv.lastMessage}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{new Date(conv.lastMessageTime).toLocaleTimeString()}</p>
              {conv.unreadCount > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {conv.unreadCount}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))
    )}
  </div>
)}
              {activeTab === "settings" && "Configurações do Perfil"}
            </h3>

          </div>
        )}
      </div>

      <NewAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        onCreateAppointment={handleCreateAppointment}
        professionalId={user?.id}
      />

      <PriceConfigModal
        isOpen={showPriceConfigModal}
        onClose={() => setShowPriceConfigModal(false)}
        currentPrice={consultationPrice}
        onPriceUpdate={(price) => {
          // This will be handled by the PriceConfigModal component
        }}
      />

      <ProntuarioModal
        isOpen={showProntuarioModal}
        onClose={() => {
          setShowProntuarioModal(false);
          setEditingProntuario(null);
          setSelectedPatientName("");
        }}
        patientName={selectedPatientName}
        prontuarioId={editingProntuario?.id}
      />

      <ScheduleConfigModal
        isOpen={showScheduleConfigModal}
        onClose={() => setShowScheduleConfigModal(false)}
      />

            <MessagesModal
        key={selectedConversationId} // 🔑 força recriar modal ao selecionar conversa
        open={isMessagesOpen}
        onOpenChange={setIsMessagesOpen}
        initialConversationId={selectedConversationId || undefined}
      />

    </div>
  );
};

export default ProfessionalDashboard;
