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
import { useReviews } from "@/hooks/useReviews";
import { NewAppointmentModal } from "@/components/NewAppointmentModal";
import { PriceConfigModal } from "@/components/PriceConfigModal";
import { ProntuarioModal } from "@/components/ProntuarioModal";
import { ScheduleConfigModal } from "@/components/ScheduleConfigModal";
import { PatientsSection } from "@/components/PatientsSection";
import { ReportsSection } from "@/components/ReportsSection";
import { ProfessionalReviewsList } from "@/components/ProfessionalReviewsList";
import { useMessages } from "@/hooks/useMessages";
import { MessagesModal } from "@/components/MessagesModal";
import { CreateAppointmentModal } from "../components/CreateAppointmentModal";
import { MessagesButton } from "@/components/MessagesButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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
  const { prontuarios, addProntuario, updateProntuario, deleteProntuario } = useProntuarios(Number(user?.id));
  const { conversations, sendMessage, markAsRead } = useMessages(user?.id?.toString() || "", "professional");
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; name: string } | null>(null);

  // Helper para buscar foto de perfil
  const getUserProfileImage = (userId: string): string => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const user = registeredUsers.find((u: any) => String(u.id) === String(userId));
      return user?.profileImage || "";
    } catch {
      return "";
    }
  };

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
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  console.log("=== DEBUG PROFESSIONAL DASHBOARD ===");
  console.log("Total appointments:", appointments.length);
  console.log("All appointments:", appointments);

  const todayAppointments = appointments.filter(apt => apt.date === today);
  const thisMonthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
  });
  
  const lastMonthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.getMonth() === lastMonth && aptDate.getFullYear() === lastMonthYear;
  });

  const statusLower = (s: string | undefined) => (s || "").toLowerCase();
  const isSuccess = (s: string | undefined) => {
    const sl = statusLower(s);
    return sl === "confirmada" || sl === "finalizada";
  };

  const confirmedAppointments = appointments.filter(apt => statusLower(apt.status) === "confirmada");
  const successfulAppointments = appointments.filter(apt => isSuccess(apt.status));
  
  // Pacientes únicos pelo id (fallback para email)
  const uniquePatients = new Set(
    appointments.map(apt => String((apt as any).patientId ?? apt.patientEmail ?? ""))
  ).size;

  // Get professional's price
  const consultationPrice = JSON.parse(localStorage.getItem(`consultation_price_${user?.id}`) || "150");

  // Sucesso no mês (confirmadas ou finalizadas)
  const successThisMonth = thisMonthAppointments.filter(apt => isSuccess(apt.status));
  const successLastMonth = lastMonthAppointments.filter(apt => isSuccess(apt.status));

  console.log("This month appointments:", thisMonthAppointments.length);
  console.log("Successful this month (confirmada|finalizada):", successThisMonth.length);
  console.log("Successful last month:", successLastMonth.length);
  console.log("Total successful:", successfulAppointments.length);
  console.log("Unique patients:", uniquePatients);
  console.log("Consultation price:", consultationPrice);

  // Calcular mudanças percentuais
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
  };

  const thisMonthRevenue = successThisMonth.length * consultationPrice;
  const lastMonthRevenue = successLastMonth.length * consultationPrice;
  const thisMonthConfirmationRate = thisMonthAppointments.length > 0 
    ? (successThisMonth.length / thisMonthAppointments.length) * 100 
    : 0;
  const lastMonthConfirmationRate = lastMonthAppointments.length > 0 
    ? (successLastMonth.length / lastMonthAppointments.length) * 100 
    : 0;

  const stats = [
    {
      title: "Pacientes Ativos",
      value: uniquePatients.toString(),
      change: "Total de pacientes únicos",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Consultas Este Mês",
      value: successThisMonth.length.toString(),
      change: calculateChange(successThisMonth.length, successLastMonth.length) + " vs mês anterior",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Receita Mensal",
      value: `R$ ${thisMonthRevenue.toLocaleString()}`,
      change: calculateChange(thisMonthRevenue, lastMonthRevenue) + " vs mês anterior",
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: "Taxa de Confirmação",
      value: `${thisMonthConfirmationRate.toFixed(0)}%`,
      change: calculateChange(thisMonthConfirmationRate, lastMonthConfirmationRate) + " vs mês anterior",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  console.log("Stats calculated:", stats);

  // Get pending appointment requests
  const pendingRequests = appointments.filter(apt => apt.status === "pendente");

  // Get upcoming appointments (today and tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const upcomingAppointments = appointments
    .filter(apt => 
      (apt.date === today || apt.date >= today) && 
      apt.status !== "cancelada" && 
      apt.status !== "finalizada"
    )
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bem-vindo, {user.name}
            </h1>
            <p className="text-muted-foreground">
              Gerencie sua prática profissional de forma eficiente
            </p>
          </div>
          <MessagesButton onClick={() => setIsMessagesOpen(true)} />
        </div>

        {/* Navegação por abas */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Visão Geral", icon: BarChart },
                { id: "appointments", label: "Agendamentos", icon: Calendar },
                { id: "prontuarios", label: "Prontuários", icon: FileText },
                { id: "patients", label: "Pacientes", icon: Users },
                { id: "reports", label: "Relatórios", icon: BarChart },
                { id: "messages", label: "Mensagens", icon: MessageCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
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
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">{stat.change} vs mês anterior</p>
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
                      <div key={request.id} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {request.patientName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{request.patientName}</p>
                            <p className="text-sm text-muted-foreground">{request.patientEmail}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${getAttendanceTypeBadge(request.attendanceType)}`}>
                                {getAttendanceTypeLabel(request.attendanceType)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
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

              {/* Mensagens recentes */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Mensagens Recentes
                      </CardTitle>
                      <CardDescription>
                        Suas últimas conversas com pacientes
                      </CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setIsMessagesOpen(true)}
                      variant="outline"
                    >
                      Ver Todas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {conversations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma mensagem recebida</p>
                      </div>
                    ) : (
                      conversations
                        .slice(0, 5)
                        .map((conv) => {
                          const patientName = conv.patientName || "Paciente";
                          const patientId = conv.patientId || "";
                          const patientImage = patientId ? getUserProfileImage(patientId) : "";
                          
                          const lastMessageTime = conv.lastMessageTime 
                            ? new Date(conv.lastMessageTime)
                            : new Date();
                          const now = new Date();
                          const diffMs = now.getTime() - lastMessageTime.getTime();
                          const diffMins = Math.floor(diffMs / 60000);
                          const diffHours = Math.floor(diffMs / 3600000);
                          const diffDays = Math.floor(diffMs / 86400000);
                          
                          let timeAgo = "";
                          if (diffMins < 1) timeAgo = "Agora";
                          else if (diffMins < 60) timeAgo = `${diffMins}min`;
                          else if (diffHours < 24) timeAgo = `${diffHours}h`;
                          else if (diffDays < 7) timeAgo = `${diffDays}d`;
                          else timeAgo = lastMessageTime.toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: '2-digit' 
                          });

                          return (
                            <div
                              key={conv.id}
                              onClick={() => {
                                setSelectedConversationId(conv.id);
                                setIsMessagesOpen(true);
                                markAsRead(conv.id);
                              }}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border"
                            >
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={patientImage} alt={patientName} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {patientName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-medium text-sm text-gray-900 truncate">
                                    {patientName}
                                  </p>
                                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                    {timeAgo}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-1">
                                  {conv.lastMessage || "Sem mensagens"}
                                </p>
                              </div>
                              
                              {conv.unreadCount && conv.unreadCount > 0 && (
                                <Badge 
                                  variant="default" 
                                  className="h-6 min-w-[24px] flex items-center justify-center px-2 text-xs flex-shrink-0"
                                >
                                  {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                  {conversations.length > 5 && (
                    <Button 
                      className="w-full mt-4" 
                      variant="outline" 
                      onClick={() => setIsMessagesOpen(true)}
                    >
                      Ver Todas as Mensagens
                    </Button>
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

            {/* Avaliações Recebidas */}
            <ProfessionalReviewsList professionalId={user.id} />
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

            {/* Seção de solicitações pendentes em destaque */}
            {pendingRequests.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800">Solicitações Pendentes ({pendingRequests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} data-appointment-id={request.id} className="flex justify-between items-center bg-card p-4 rounded shadow">
                        <div>
                          <p className="font-medium text-foreground">{request.patientName}</p>
                          <p className="text-sm text-muted-foreground">{request.type}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(request.date)} às {request.time}</p>
                          <p className="text-sm text-muted-foreground">{request.patientEmail}</p>
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

            {/* Tabs para filtrar por status */}
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">
                      Todos ({appointments.length})
                    </TabsTrigger>
                    <TabsTrigger value="pendente">
                      Pendentes ({appointments.filter(a => a.status === "pendente").length})
                    </TabsTrigger>
                    <TabsTrigger value="confirmada">
                      Confirmados ({appointments.filter(a => a.status === "confirmada").length})
                    </TabsTrigger>
                    <TabsTrigger value="finalizada">
                      Finalizados ({appointments.filter(a => a.status === "finalizada").length})
                    </TabsTrigger>
                    <TabsTrigger value="cancelada">
                      Cancelados ({appointments.filter(a => a.status === "cancelada").length})
                    </TabsTrigger>
                  </TabsList>

                  {["all", "pendente", "confirmada", "finalizada", "cancelada"].map((status) => (
                    <TabsContent key={status} value={status} className="space-y-4 mt-4">
                      {(() => {
                        const filtered = status === "all" 
                          ? appointments 
                          : appointments.filter(a => a.status === status);
                        
                        const sorted = filtered.sort((a, b) => {
                          if (a.date !== b.date) return a.date.localeCompare(b.date);
                          return a.time.localeCompare(b.time);
                        });

                        return sorted.length > 0 ? (
                          sorted.map((appointment) => (
                            <div key={appointment.id} data-appointment-id={appointment.id} className="border rounded-lg p-4 bg-card shadow-sm">
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
                                    : appointment.status === "finalizada"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {appointment.status}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            {status === "all" 
                              ? "Nenhum agendamento encontrado." 
                              : `Nenhum agendamento ${status === "pendente" ? "pendente" : status === "confirmada" ? "confirmado" : status === "finalizada" ? "finalizado" : "cancelado"}.`
                            }
                          </p>
                        );
                      })()}
                    </TabsContent>
                  ))}
                </Tabs>
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
                <h3 className="text-lg font-medium text-foreground">Gerenciamento de Prontuários</h3>
                <p className="text-muted-foreground">Visualize e gerencie os prontuários dos seus pacientes</p>
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
                        <div key={prontuario.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback>
                                {prontuario.paciente.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{prontuario.paciente}</p>
                              <p className="text-sm text-muted-foreground">Idade: {prontuario.idade} • Estado Civil: {prontuario.estadoCivil}</p>
                              <p className="text-sm text-muted-foreground">
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
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-muted" />
                      <p className="text-lg font-medium mb-2">Nenhum prontuário encontrado</p>
                      <p className="mb-4">Comece criando seu primeiro prontuário</p>
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
                <h3 className="text-lg font-medium text-foreground">Central de Mensagens</h3>
                <p className="text-muted-foreground">Gerencie suas conversas com os pacientes</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
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
                  <MessageCircle className="w-16 h-16 mx-auto text-muted mb-4" />
                  <p className="text-muted-foreground text-lg font-medium mb-2">Nenhuma mensagem ainda</p>
                  <p className="text-muted-foreground text-sm">
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
                                <p className="font-medium text-foreground">
                                  {conv.patientName}
                                </p>
                                {(conv.unreadCount || 0) > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {conv.unreadCount} nova{conv.unreadCount !== 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {conv.lastMessage}
                              </p>
                            </div>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="text-xs text-muted-foreground">
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
