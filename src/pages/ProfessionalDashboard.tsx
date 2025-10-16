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
import { CreateAppointmentModal } from "../components/CreateAppointmentModal";
import { MessagesButton } from "@/components/MessagesButton";


const ProfessionalDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showPriceConfigModal, setShowPriceConfigModal] = useState(false);
  const [showProntuarioModal, setShowProntuarioModal] = useState(false);
  const [showScheduleConfigModal, setShowScheduleConfigModal] = useState(false);
  const [editingProntuario, setEditingProntuario] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const { user } = useAuth();
  const { appointments, addAppointment, updateAppointment, setAppointments } = useProfessionalAppointments();
  const { prontuarios, addProntuario, updateProntuario, deleteProntuario } = useProntuarios();
  const { conversations, sendMessage, markAsRead } = useMessages(user?.id?.toString() || "", "professional");
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; name: string } | null>(null);

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

  const loadAppointmentsFromStorage = () => {
    if (!user?.id) return;

    const stored = localStorage.getItem("appointments");
    if (stored) {
      const all = JSON.parse(stored);
      const filtered = all.filter((apt: any) => Number(apt.professionalId) === Number(user.id));
      setAppointments(filtered);
    }
  };

  useEffect(() => {
    loadAppointmentsFromStorage();
  }, [activeTab, user?.id]);

  // Listener para detectar mudanças no localStorage
  useEffect(() => {
    if (!user?.id) return;

    const handleStorageChange = () => {
      loadAppointmentsFromStorage();
    };

    // Listener customizado para mudanças diretas
    window.addEventListener("storage", handleStorageChange);
    
    // Intervalo para verificar mudanças (fallback para mudanças na mesma aba)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [user?.id]);

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

  // Calcular apenas consultas confirmadas do mês
  const confirmedThisMonth = thisMonthAppointments.filter(apt => apt.status === "confirmada");

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
      value: confirmedThisMonth.length.toString(),
      change: "+8%",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Receita Mensal",
      value: `R$ ${(confirmedThisMonth.length * consultationPrice).toLocaleString()}`,
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
    // Garantir consistência do formato e chave de armazenamento
    const saved = localStorage.getItem("appointments");
    const all = saved ? JSON.parse(saved) : [];

    const enriched = {
      ...appointmentData,
      id: Date.now(),
      professionalId: Number(user.id),
      professionalName: user.name,
      patientId: appointmentData.patientId ?? Date.now(),
      status: appointmentData.status || "pendente",
      createdAt: new Date().toISOString(),
    };

    const updated = [...all, enriched];
    localStorage.setItem("appointments", JSON.stringify(updated));
    // Atualiza estado local filtrando por profissional
    setAppointments(updated.filter((apt: any) => Number(apt.professionalId) === Number(user.id)));
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

  const handleOpenMessage = (patientId: string | number, patientName: string) => {
    setSelectedRecipient({ id: String(patientId), name: patientName });
    setIsMessagesOpen(true);
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

  const handleApproveAppointment = (id: number) => {
    updateAppointment(id, { status: "confirmada" });
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: "confirmada" } : apt
      )
    );
    // Força atualização
    window.dispatchEvent(new Event("storage"));
  };

  const handleRejectAppointment = (id: number) => {
    updateAppointment(id, { status: "cancelada" });
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: "cancelada" } : apt
      )
    );
    // Força atualização
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo, {user.name}
            </h1>
            <p className="text-gray-600">
              Gerencie sua prática profissional de forma eficiente
            </p>
          </div>
          <MessagesButton onClick={() => setIsMessagesOpen(true)} />
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
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Novo Agendamento
              </Button>
            </div>

            {/* Seção de solicitações pendentes */}
            {pendingRequests.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800">Solicitações Pendentes ({pendingRequests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="flex justify-between items-center bg-white p-4 rounded shadow">
                        <div>
                          <p className="font-medium text-gray-900">{request.patientName}</p>
                          <p className="text-sm text-gray-600">{request.type}</p>
                          <p className="text-sm text-gray-500">{formatDate(request.date)} às {request.time}</p>
                          <p className="text-sm text-gray-500">{request.patientEmail}</p>
                          <Badge className={`text-xs ${getAttendanceTypeBadge(request.attendanceType)} mt-1`}>
                            {getAttendanceTypeLabel(request.attendanceType)}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-2 text-right">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleApproveAppointment(request.id)}
                            >
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => handleRejectAppointment(request.id)}
                            >
                              Rejeitar
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="link"
                            className="text-blue-600 underline p-0"
                            onClick={() => handleOpenMessage(request.patientId, request.patientName)}
                          >
                            Enviar mensagem
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de todos os agendamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Todos os Agendamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.length > 0 ? (
                  appointments
                    .sort((a, b) => {
                      if (a.date !== b.date) return a.date.localeCompare(b.date);
                      return a.time.localeCompare(b.time);
                    })
                    .map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <p><strong>Paciente:</strong> {appointment.patientName}</p>
                        <p><strong>Data:</strong> {appointment.date}</p>
                        <p><strong>Hora:</strong> {appointment.time}</p>
                        <p><strong>Tipo:</strong> {appointment.type}</p>
                        <p><strong>Email:</strong> {appointment.patientEmail}</p>
                        <p><strong>Observações:</strong> {appointment.notes || "Nenhuma"}</p>
                        <Badge 
                          className={`mt-2 ${
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
                    ))
                ) : (
                  <p className="text-gray-500">Nenhum agendamento encontrado.</p>
                )}
              </CardContent>
            </Card>

            <CreateAppointmentModal 
              isOpen={showCreateModal} 
              onClose={() => setShowCreateModal(false)} 
              onCreate={handleCreateAppointment}
            />
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

        {activeTab === "messages" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Central de Mensagens</h3>
                <p className="text-gray-600">Gerencie suas conversas com os pacientes</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {conversations.length} conversa{conversations.length !== 1 ? 's' : ''}
                </div>
                {conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0) > 0 && (
                  <Badge variant="destructive">
                    {conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0)} não lidas
                  </Badge>
                )}
              </div>
            </div>

            {conversations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 text-lg font-medium mb-2">Nenhuma mensagem ainda</p>
                  <p className="text-gray-500 text-sm">
                    As conversas com seus pacientes aparecerão aqui
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {conversations
                  .sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime())
                  .map((conv) => (
                    <Card
                      key={conv.id}
                      onClick={() => {
                        markAsRead(conv.id);
                        setSelectedConversationId(conv.id);
                        setIsMessagesOpen(true);
                      }}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3 flex-1">
                            <Avatar>
                              <AvatarFallback>
                                {conv.patientName?.charAt(0).toUpperCase() || "P"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900">
                                  {conv.patientName}
                                </p>
                                {(conv.unreadCount || 0) > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {conv.unreadCount} nova{conv.unreadCount !== 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {conv.lastMessage}
                              </p>
                            </div>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="text-xs text-gray-500">
                              {new Date(conv.lastMessageTime || "").toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Configurações do Perfil
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
        key={selectedConversationId}
        open={isMessagesOpen}
        onOpenChange={(open) => {
          setIsMessagesOpen(open);
          if (!open) setSelectedRecipient(null);
        }}
        initialConversationId={selectedConversationId || undefined}
        recipientId={selectedRecipient?.id}
        recipientName={selectedRecipient?.name}
        userId={user?.id?.toString() || ""}
        userType="professional"
      />

    </div>
  );
};

export default ProfessionalDashboard;
