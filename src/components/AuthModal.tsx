import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Users, AlertCircle, Loader2, MapPin, User, Lock, Briefcase } from "lucide-react";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordConfirmation, 
  validateFullName,
  validatePhone,
  validateCRP,
  formatPhone,
  formatCRP as formatCRPNumber
} from "@/lib/validation";
import { fetchAddressByCEP, formatCEP } from "@/lib/cep";
import { SpecialtySelector } from "./SpecialtySelector";
import { toast } from "sonner";

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
    confirmPassword: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    age: "",
    profession: "",
    maritalStatus: "",
    crp: "",
    hasVisualImpairment: false,
    hasHearingImpairment: false,
    knowsLibras: false,
    hasAutism: false,
    hasDownSyndrome: false,
    hasADHD: false
  });
  
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [currentTab, setCurrentTab] = useState("personal");
  const firstErrorRef = useRef<HTMLInputElement>(null);

  const { login, register, clearAllUsers } = useAuth();

  // Sincroniza o mode interno com o mode passado do Navigation
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  const validateField = (fieldName: string, value: string) => {
    let validation;
    
    switch (fieldName) {
      case "name":
        validation = validateFullName(value);
        break;
      case "email":
        validation = validateEmail(value);
        break;
      case "password":
        validation = validatePassword(value);
        break;
      case "confirmPassword":
        validation = validatePasswordConfirmation(formData.password, value);
        break;
      case "phone":
        validation = validatePhone(value);
        break;
      case "crp":
        validation = validateCRP(value);
        break;
      default:
        validation = { isValid: true };
    }
    
    if (!validation.isValid && validation.message) {
      setErrors(prev => ({ ...prev, [fieldName]: validation.message! }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    
    return validation.isValid;
  };

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    const value = formData[fieldName as keyof typeof formData];
    if (typeof value === 'string') {
      validateField(fieldName, value);
    }
  };

  const handleFieldChange = (fieldName: string, value: string | boolean) => {
    setFormData({ ...formData, [fieldName]: value });
    
    // Valida em tempo real apenas se o campo já foi tocado e for string
    if (touchedFields[fieldName] && typeof value === 'string') {
      validateField(fieldName, value);
    }
  };

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value);
    setFormData({ ...formData, cep: formatted });
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleCRPChange = (value: string) => {
    const formatted = formatCRPNumber(value);
    setFormData({ ...formData, crp: formatted });
  };

  const handleCEPBlur = async () => {
    setTouchedFields(prev => ({ ...prev, cep: true }));
    
    const cleanedCEP = formData.cep.replace(/\D/g, '');
    
    if (cleanedCEP.length !== 8) {
      setErrors(prev => ({ ...prev, cep: "Digite um CEP válido com 8 dígitos." }));
      return;
    }

    setIsLoadingCEP(true);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.cep;
      return newErrors;
    });

    try {
      const addressData = await fetchAddressByCEP(formData.cep);
      
      if (addressData) {
        setFormData(prev => ({
          ...prev,
          street: addressData.logradouro || prev.street,
          neighborhood: addressData.bairro || prev.neighborhood,
          city: addressData.localidade || prev.city,
          state: addressData.uf || prev.state,
          complement: addressData.complemento || prev.complement,
        }));
        toast.success("Endereço encontrado!");
      } else {
        setErrors(prev => ({ ...prev, cep: "CEP não encontrado. Verifique e tente novamente." }));
        toast.error("CEP não encontrado");
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, cep: "Erro ao buscar CEP. Tente novamente." }));
      toast.error("Erro ao buscar CEP");
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos os campos como tocados
    const allFields = Object.keys(formData);
    const touched = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouchedFields(touched);

    if (mode === "login") {
      // Validações básicas para login
      const emailValidation = validateEmail(formData.email);
      
      if (!emailValidation.isValid) {
        setErrors({ email: emailValidation.message! });
        toast.error(emailValidation.message);
        return;
      }

      const result = login(formData.email, formData.password);
      if (result.success) {
        handleClose();
        toast.success("Login realizado com sucesso!");
      } else {
        toast.error(result.message || "Erro ao fazer login");
      }
    } else {
      // Validações completas para cadastro
      const newErrors: Record<string, string> = {};
      
      const nameValidation = validateFullName(formData.name);
      if (!nameValidation.isValid) newErrors.name = nameValidation.message!;
      
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) newErrors.email = emailValidation.message!;
      
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) newErrors.password = passwordValidation.message!;
      
      const confirmPasswordValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword);
      if (!confirmPasswordValidation.isValid) newErrors.confirmPassword = confirmPasswordValidation.message!;
      
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) newErrors.phone = phoneValidation.message!;
      
      if (userType === "professional") {
        const crpValidation = validateCRP(formData.crp);
        if (!crpValidation.isValid) newErrors.crp = crpValidation.message!;
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        const firstError = Object.values(newErrors)[0];
        toast.error(firstError);
        
        // Focar no primeiro campo com erro
        setTimeout(() => {
          firstErrorRef.current?.focus();
        }, 100);
        return;
      }

      // Montar endereço completo
      const fullAddress = [
        formData.street,
        formData.number ? `nº ${formData.number}` : '',
        formData.complement,
        formData.neighborhood,
        formData.city,
        formData.state
      ].filter(Boolean).join(', ');

      // Validação de especialidades para profissionais
      if (userType === "professional" && selectedSpecialties.length === 0) {
        toast.error("Selecione pelo menos uma especialidade");
        setCurrentTab("personal");
        return;
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: fullAddress || `CEP: ${formData.cep}`,
        cep: formData.cep,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.cep,
        type: userType,
        hasVisualImpairment: formData.hasVisualImpairment,
        hasHearingImpairment: formData.hasHearingImpairment,
        knowsLibras: formData.knowsLibras,
        ...(userType === "patient" && {
          age: formData.age,
          profession: formData.profession,
          maritalStatus: formData.maritalStatus
        }),
        ...(userType === "professional" && {
          crp: formData.crp,
          specialty: selectedSpecialties.join(", ")
        })
      };

      const result = register(userData);
      if (result.success) {
        handleClose();
        toast.success("Cadastro realizado com sucesso! Bem-vindo(a)!");
      } else {
        toast.error(result.message || "Erro ao realizar cadastro");
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
      confirmPassword: "",
      phone: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      age: "",
      profession: "",
      maritalStatus: "",
      crp: "",
      hasVisualImpairment: false,
      hasHearingImpairment: false,
      knowsLibras: false,
      hasAutism: false,
      hasDownSyndrome: false,
      hasADHD: false
    });
    setSelectedSpecialties([]);
    setErrors({});
    setTouchedFields({});
    setCurrentTab("personal");
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" ? "Entrar" : "Cadastrar"} - PsiConnect
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" ? (
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

              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal" className="text-xs sm:text-sm">
                    <User className="w-4 h-4 mr-1" />
                    Pessoal
                  </TabsTrigger>
                  <TabsTrigger value="address" className="text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    Endereço
                  </TabsTrigger>
                  <TabsTrigger value="security" className="text-xs sm:text-sm">
                    <Lock className="w-4 h-4 mr-1" />
                    Senha
                  </TabsTrigger>
                </TabsList>

                {/* ABA 1: Informações Pessoais */}
                <TabsContent value="personal" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      ref={errors.name ? firstErrorRef : undefined}
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      required
                      placeholder="Digite seu nome completo"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      ref={errors.email && Object.keys(errors)[0] === "email" ? firstErrorRef : undefined}
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      required
                      placeholder="seu@email.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      ref={errors.phone && !errors.name ? firstErrorRef : undefined}
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      required
                      placeholder="(11) 99999-9999"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {userType === "patient" && (
                    <>
                      <div>
                        <Label htmlFor="age">Idade</Label>
                        <Input
                          id="age"
                          value={formData.age}
                          onChange={(e) => handleFieldChange("age", e.target.value)}
                          required
                          placeholder="Ex: 30 anos"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profession">Profissão</Label>
                        <Input
                          id="profession"
                          value={formData.profession}
                          onChange={(e) => handleFieldChange("profession", e.target.value)}
                          placeholder="Ex: Engenheiro(a)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maritalStatus">Estado Civil</Label>
                        <Input
                          id="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={(e) => handleFieldChange("maritalStatus", e.target.value)}
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
                          ref={errors.crp && !errors.name && !errors.phone ? firstErrorRef : undefined}
                          id="crp"
                          value={formData.crp}
                          onChange={(e) => handleCRPChange(e.target.value)}
                          onBlur={() => handleBlur("crp")}
                          required
                          placeholder="00/000000"
                          aria-invalid={!!errors.crp}
                          aria-describedby={errors.crp ? "crp-error" : undefined}
                          className={errors.crp ? "border-destructive" : ""}
                        />
                        {errors.crp && (
                          <p id="crp-error" className="text-sm text-destructive flex items-center gap-1 mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.crp}
                          </p>
                        )}
                      </div>
                      
                      <SpecialtySelector 
                        selectedSpecialties={selectedSpecialties}
                        onChange={setSelectedSpecialties}
                      />
                    </>
                  )}

                  {/* Acessibilidade */}
                  <div className="space-y-3">
                    <Label className="text-base">Acessibilidade</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasVisualImpairment"
                          checked={formData.hasVisualImpairment}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, hasVisualImpairment: checked as boolean })
                          }
                        />
                        <label
                          htmlFor="hasVisualImpairment"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Tenho deficiência visual
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasHearingImpairment"
                          checked={formData.hasHearingImpairment}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, hasHearingImpairment: checked as boolean })
                          }
                        />
                        <label
                          htmlFor="hasHearingImpairment"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Tenho deficiência auditiva
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="knowsLibras"
                          checked={formData.knowsLibras}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, knowsLibras: checked as boolean })
                          }
                        />
                        <label
                          htmlFor="knowsLibras"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Sou fluente em Libras
                        </label>
                      </div>
                      {userType === "patient" && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasAutism"
                              checked={formData.hasAutism}
                              onCheckedChange={(checked) => 
                                setFormData({ ...formData, hasAutism: checked as boolean })
                              }
                            />
                            <label
                              htmlFor="hasAutism"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Tenho autismo/TEA
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasDownSyndrome"
                              checked={formData.hasDownSyndrome}
                              onCheckedChange={(checked) => 
                                setFormData({ ...formData, hasDownSyndrome: checked as boolean })
                              }
                            />
                            <label
                              htmlFor="hasDownSyndrome"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Tenho síndrome de Down
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasADHD"
                              checked={formData.hasADHD}
                              onCheckedChange={(checked) => 
                                setFormData({ ...formData, hasADHD: checked as boolean })
                              }
                            />
                            <label
                              htmlFor="hasADHD"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Tenho TDAH
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    onClick={() => setCurrentTab("address")} 
                    className="w-full"
                  >
                    Próximo: Endereço
                  </Button>
                </TabsContent>

                {/* ABA 2: Endereço */}
                <TabsContent value="address" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label htmlFor="cep">CEP</Label>
                      <div className="relative">
                        <Input
                          id="cep"
                          value={formData.cep}
                          onChange={(e) => handleCEPChange(e.target.value)}
                          onBlur={handleCEPBlur}
                          maxLength={9}
                          placeholder="00000-000"
                          aria-invalid={!!errors.cep}
                          aria-describedby={errors.cep ? "cep-error" : undefined}
                          className={errors.cep ? "border-destructive" : ""}
                        />
                        {isLoadingCEP && (
                          <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-muted-foreground" />
                        )}
                      </div>
                      {errors.cep && (
                        <p id="cep-error" className="text-sm text-destructive flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.cep}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="street">Rua/Avenida</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => handleFieldChange("street", e.target.value)}
                        placeholder="Nome da rua"
                        disabled={isLoadingCEP}
                      />
                    </div>

                    <div>
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={formData.number}
                        onChange={(e) => handleFieldChange("number", e.target.value)}
                        placeholder="123"
                        disabled={isLoadingCEP}
                      />
                    </div>

                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={formData.complement}
                        onChange={(e) => handleFieldChange("complement", e.target.value)}
                        placeholder="Apto, bloco..."
                        disabled={isLoadingCEP}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={(e) => handleFieldChange("neighborhood", e.target.value)}
                        placeholder="Nome do bairro"
                        disabled={isLoadingCEP}
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleFieldChange("city", e.target.value)}
                        placeholder="Cidade"
                        disabled={isLoadingCEP}
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleFieldChange("state", e.target.value)}
                        placeholder="UF"
                        maxLength={2}
                        disabled={isLoadingCEP}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setCurrentTab("personal")} 
                      className="w-full"
                    >
                      Voltar
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setCurrentTab("security")} 
                      className="w-full"
                    >
                      Próximo: Senha
                    </Button>
                  </div>
                </TabsContent>

                {/* ABA 3: Senha */}
                <TabsContent value="security" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      ref={errors.password && !errors.email && !errors.name && !errors.phone && !errors.crp ? firstErrorRef : undefined}
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleFieldChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      required
                      placeholder="Digite sua senha"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      className={errors.password ? "border-destructive" : ""}
                    />
                    <PasswordStrengthIndicator password={formData.password} />
                    {errors.password && (
                      <p id="password-error" className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      ref={errors.confirmPassword && !errors.password && !errors.email && !errors.name && !errors.phone && !errors.crp ? firstErrorRef : undefined}
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                      onBlur={() => handleBlur("confirmPassword")}
                      required
                      placeholder="Digite sua senha novamente"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                      className={errors.confirmPassword ? "border-destructive" : ""}
                    />
                    {errors.confirmPassword && (
                      <p id="confirmPassword-error" className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setCurrentTab("address")} 
                      className="w-full"
                    >
                      Voltar
                    </Button>
                    <Button type="submit" className="w-full">
                      Finalizar Cadastro
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <Button type="button" variant="outline" onClick={handleBackToSelectType} className="w-full">
                Voltar para Seleção de Tipo
              </Button>
            </>
          ) : (
            // LOGIN FORM
            <>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  ref={errors.email && Object.keys(errors)[0] === "email" ? firstErrorRef : undefined}
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  required
                  placeholder="seu@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  ref={errors.password && !errors.email ? firstErrorRef : undefined}
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleFieldChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  required
                  placeholder="Digite sua senha"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </>
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
