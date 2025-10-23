
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Home, Key } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { FavoritesList } from "@/components/FavoritesList";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { DetailedAddressForm } from "@/components/DetailedAddressForm";
import { SpecialtySelector } from "@/components/SpecialtySelector";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    profileImage: "",
    age: "",
    profession: "",
    maritalStatus: "",
    specialty: "",
    crp: "",
    hasVisualImpairment: false,
    hasHearingImpairment: false,
    knowsLibras: false,
    hasAutism: false,
    hasDownSyndrome: false,
    hasADHD: false
  });
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Carregar dados do usuário automaticamente
  useEffect(() => {
    if (user) {
      const userData = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
        .find((u: any) => u.id === user.id);
      
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        street: userData?.street || "",
        number: userData?.number || "",
        complement: userData?.complement || "",
        neighborhood: userData?.neighborhood || "",
        city: userData?.city || "",
        state: userData?.state || "",
        zipCode: userData?.zipCode || userData?.cep || "",
        profileImage: userData?.profileImage || "",
        age: userData?.age || "",
        profession: userData?.profession || "",
        maritalStatus: userData?.maritalStatus || "",
        specialty: userData?.specialty || "",
        crp: userData?.crp || "",
        hasVisualImpairment: userData?.hasVisualImpairment || false,
        hasHearingImpairment: userData?.hasHearingImpairment || false,
        knowsLibras: userData?.knowsLibras || false,
        hasAutism: userData?.hasAutism || false,
        hasDownSyndrome: userData?.hasDownSyndrome || false,
        hasADHD: userData?.hasADHD || false
      });

      // Carregar especialidades para o selector
      if (user.type === "professional" && userData?.specialty) {
        const specialtiesArray = userData.specialty.split(",").map((s: string) => s.trim());
        setSelectedSpecialties(specialtiesArray);
      }
    }

    // Scroll para seção de favoritos se houver hash na URL
    if (window.location.hash === "#favorites") {
      setTimeout(() => {
        const favoritesSection = document.getElementById("favorites");
        if (favoritesSection) {
          favoritesSection.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa fazer login para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    // Validar se todos os campos obrigatórios estão preenchidos
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || 
        !formData.street.trim() || !formData.number.trim() || !formData.neighborhood.trim() || 
        !formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    // Buscar usuários registrados
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const userIndex = registeredUsers.findIndex((u: any) => u.id === user.id);
    
    if (userIndex !== -1) {
      // Criar endereço completo para compatibilidade
      const addressParts = [
        formData.street,
        formData.number ? `nº ${formData.number}` : '',
        formData.complement,
        formData.neighborhood,
        formData.city,
        formData.state
      ].filter(Boolean);
      const fullAddress = addressParts.join(', ');
      
      // Atualizar dados do usuário
      registeredUsers[userIndex] = {
        ...registeredUsers[userIndex],
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        cep: formData.zipCode,
        profileImage: formData.profileImage,
        hasVisualImpairment: formData.hasVisualImpairment,
        hasHearingImpairment: formData.hasHearingImpairment,
        knowsLibras: formData.knowsLibras,
        ...(user.type === "patient" && {
          age: formData.age,
          profession: formData.profession,
          maritalStatus: formData.maritalStatus,
          hasAutism: formData.hasAutism,
          hasDownSyndrome: formData.hasDownSyndrome,
          hasADHD: formData.hasADHD
        }),
        ...(user.type === "professional" && {
          specialty: selectedSpecialties.join(", "),
          crp: formData.crp
        })
      };
      
      // Salvar de volta
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
      
      // Atualizar usuário atual
      const updatedUser = { ...registeredUsers[userIndex] };
      delete updatedUser.password;
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      
      // Forçar refresh da página para atualizar o contexto
      window.location.reload();
    }
    
    setIsEditing(false);
    alert("Perfil atualizado com sucesso!");
  };

  const handleImageSave = (imageData: string) => {
    setFormData(prev => ({
      ...prev,
      profileImage: imageData
    }));
    
    // Salvar imagem diretamente no localStorage
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const userIndex = registeredUsers.findIndex((u: any) => u.id === user.id);
    
    if (userIndex !== -1) {
      registeredUsers[userIndex].profileImage = imageData;
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
      
      // Atualizar usuário atual
      const updatedUser = { ...registeredUsers[userIndex] };
      delete updatedUser.password;
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      
      alert("Foto de perfil salva com sucesso!");
    }
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres!");
      return;
    }
    
    // Buscar usuários registrados
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const userIndex = registeredUsers.findIndex((u: any) => u.id === user.id);
    
    if (userIndex !== -1) {
      // Verificar senha atual
      if (registeredUsers[userIndex].password !== passwordData.currentPassword) {
        alert("Senha atual incorreta!");
        return;
      }
      
      // Atualizar senha
      registeredUsers[userIndex].password = passwordData.newPassword;
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
      
      alert("Senha alterada com sucesso!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setShowPasswordForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Button 
              variant="outline" 
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="flex items-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Início
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Foto de Perfil */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileImageUpload
              currentImage={formData.profileImage}
              userName={user.name}
              onImageSave={handleImageSave}
            />

            <div id="favorites">
              <FavoritesList />
            </div>
          </div>

          {/* Informações Pessoais */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Atualize suas informações de perfil
                  </CardDescription>
                </div>
                <Button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </>
                  ) : (
                    "Editar"
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo de Conta</Label>
                    <Input
                      id="type"
                      value={user.type === "patient" ? "Paciente" : "Psicólogo"}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  
                  {user.type === "patient" && (
                    <>
                      <div>
                        <Label htmlFor="age">Idade</Label>
                        <Input
                          id="age"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                          placeholder="Ex: 30"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profession">Profissão</Label>
                        <Input
                          id="profession"
                          value={formData.profession}
                          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                          placeholder="Ex: Engenheiro(a)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maritalStatus">Estado Civil</Label>
                        <Input
                          id="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                          placeholder="Ex: Solteiro(a)"
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div>
                  <Label className="text-base font-medium">Endereço Completo</Label>
                  <div className="mt-2">
                    <DetailedAddressForm
                      street={formData.street}
                      number={formData.number}
                      complement={formData.complement}
                      neighborhood={formData.neighborhood}
                      city={formData.city}
                      state={formData.state}
                      zipCode={formData.zipCode}
                      onStreetChange={(value) => setFormData({ ...formData, street: value })}
                      onNumberChange={(value) => setFormData({ ...formData, number: value })}
                      onComplementChange={(value) => setFormData({ ...formData, complement: value })}
                      onNeighborhoodChange={(value) => setFormData({ ...formData, neighborhood: value })}
                      onCityChange={(value) => setFormData({ ...formData, city: value })}
                      onStateChange={(value) => setFormData({ ...formData, state: value })}
                      onZipCodeChange={(value) => setFormData({ ...formData, zipCode: value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {user.type === "professional" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="crp">CRP</Label>
                      <Input
                        id="crp"
                        value={formData.crp || ""}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    {isEditing ? (
                      <SpecialtySelector 
                        selectedSpecialties={selectedSpecialties}
                        onChange={setSelectedSpecialties}
                      />
                    ) : (
                      <div>
                        <Label htmlFor="specialty">Especialidades</Label>
                        <Input
                          id="specialty"
                          value={selectedSpecialties.join(", ")}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Acessibilidade */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base">Acessibilidade</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasVisualImpairment"
                        checked={formData.hasVisualImpairment}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, hasVisualImpairment: checked as boolean })
                        }
                        disabled={!isEditing}
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
                        disabled={!isEditing}
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
                        disabled={!isEditing}
                      />
                      <label
                        htmlFor="knowsLibras"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Sou fluente em Libras
                      </label>
                    </div>
                    {user.type === "patient" && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasAutism"
                            checked={formData.hasAutism}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, hasAutism: checked as boolean })
                            }
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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

                {isEditing && (
                  <div className="text-sm text-gray-600">
                    <p>* Campos obrigatórios</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Segurança */}
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>
                  Gerencie sua senha e configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showPasswordForm ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full md:w-auto"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Digite sua senha atual"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Digite sua nova senha (mín. 6 caracteres)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirme sua nova senha"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handlePasswordChange} className="bg-primary hover:bg-primary/90">
                        Salvar Nova Senha
                      </Button>
                      <Button variant="outline" onClick={() => setShowPasswordForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
