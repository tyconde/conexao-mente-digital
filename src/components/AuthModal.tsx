import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Users } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register" | "selectType";
  userType: "patient" | "professional";
}

export const AuthModal = ({ isOpen, onClose, mode: initialMode, userType: initialUserType }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register" | "selectType">(initialMode);
  const [userType, setUserType] = useState<"patient" | "professional">(initialUserType);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    age: "",
    profession: "",
    maritalStatus: "",
    crp: "",
    specialty: ""
  });

  const { login, register, clearAllUsers } = useAuth();

  // Sincroniza o mode interno com o mode passado do Navigation
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "login") {
      const success = login(formData.email, formData.password);
      if (success) {
        handleClose();
      }
    } else {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        type: userType,
        ...(userType === "patient" && {
          age: formData.age,
          profession: formData.profession,
          maritalStatus: formData.maritalStatus
        }),
        ...(userType === "professional" && {
          crp: formData.crp,
          specialty: formData.specialty
        })
      };

      const success = register(userData);
      if (success) {
        handleClose();
      }
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
    setMode(initialMode);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      age: "",
      profession: "",
      maritalStatus: "",
      crp: "",
      specialty: ""
    });
  };

  const handleSelectUserType = (type: "patient" | "professional") => {
    setUserType(type);
    setMode("register");
  };

  const handleBackToSelectType = () => {
    setMode("selectType");
  };

  // ===========================
  // Render - Seleção de tipo
  // ===========================
  if (mode === "selectType") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cadastro - PsiConnect</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Como você gostaria de usar a plataforma?
              </h3>
              <p className="text-gray-600">
                Escolha o tipo de conta que melhor se adequa ao seu perfil
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-blue-500"
                onClick={() => handleSelectUserType("patient")}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Sou Paciente</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Busco atendimento psicológico profissional
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Agendar consultas</li>
                    <li>• Conversar com psicólogos</li>
                    <li>• Acompanhar histórico</li>
                  </ul>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-green-500"
                onClick={() => handleSelectUserType("professional")}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Sou Psicólogo</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Quero gerenciar minha prática profissional
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Gerenciar agendamentos</li>
                    <li>• Criar prontuários</li>
                    <li>• Controlar financeiro</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setMode("login")}
                className="mx-auto"
              >
                Já tenho uma conta - Fazer login
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ===========================
  // Render - Login ou Cadastro
  // ===========================
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" ? "Entrar" : "Cadastrar"} - PsiConnect
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div className="text-center mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  userType === "patient" 
                    ? "bg-blue-100 text-blue-800" 
                    : "bg-green-100 text-green-800"
                }`}>
                  {userType === "patient" ? (
                    <>
                      <Heart className="w-4 h-4 mr-1" />
                      Cadastro como Paciente
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-1" />
                      Cadastro como Psicólogo
                    </>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Digite seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="Rua, número, bairro, cidade - UF"
                />
              </div>
              {userType === "patient" && (
                <>
                  <div>
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                      placeholder="Ex: 30 anos"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profession">Profissão</Label>
                    <Input
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      placeholder="Ex: Engenheiro(a)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maritalStatus">Estado Civil</Label>
                    <Input
                      id="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                      placeholder="Ex: Solteiro(a)"
                    />
                  </div>
                </>
              )}
              {userType === "professional" && (
                <>
                  <div>
                    <Label htmlFor="crp">CRP</Label>
                    <Input
                      id="crp"
                      value={formData.crp}
                      onChange={(e) => setFormData({ ...formData, crp: e.target.value })}
                      required
                      placeholder="CRP 00/000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Input
                      id="specialty"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      required
                      placeholder="Ex: Psicologia Clínica"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Digite sua senha"
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full">
            {mode === "login" ? "Entrar" : "Cadastrar"}
          </Button>

          {mode === "register" && (
            <Button type="button" variant="outline" onClick={handleBackToSelectType} className="w-full">
              Voltar para Seleção de Tipo
            </Button>
          )}
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Não tem uma conta?" : "Já tem uma conta?"}
          </p>
          <Button
            variant="link"
            onClick={() => setMode(mode === "login" ? "selectType" : "login")}
          >
            {mode === "login" ? "Cadastre-se" : "Fazer login"}
          </Button>
        </div>

        <div className="border-t pt-4">
          <Button variant="destructive" size="sm" onClick={clearAllUsers} className="w-full">
            🗑️ Limpar Todos os Dados (Dev)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
