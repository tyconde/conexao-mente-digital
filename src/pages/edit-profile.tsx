import { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit3, Save, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const EditProfile = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState<any>({
    name: "",
    email: "",
    password: "",
    address: "",
    profileImage: ""
  });
  const [editing, setEditing] = useState(true); // Já começa editando

  // Inicializa os dados do usuário
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        address: user.address || "",
        password: "",
        profileImage: (user as any).profileImage || ""
      });
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
            <Button onClick={() => (window.location.href = "/")} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData((prev: any) => ({ ...prev, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (updateUser) {
      updateUser(profileData);
    }
    setEditing(false);
    alert("Perfil atualizado com sucesso!");
    window.location.href = "/patient-dashboard"; // redireciona após salvar
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
            <CardDescription>Atualize suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24">
                  {profileData.profileImage ? (
                    <AvatarImage src={profileData.profileImage} alt={profileData.name} />
                  ) : (
                    <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <label className="text-sm mt-2 cursor-pointer text-primary hover:underline">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  Alterar foto
                </label>
              </div>

              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="border rounded-lg p-2 w-full"
                  placeholder="Nome completo"
                />
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="border rounded-lg p-2 w-full"
                  placeholder="E-mail"
                />
                <input
                  type="password"
                  name="password"
                  value={profileData.password}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="border rounded-lg p-2 w-full"
                  placeholder="Nova senha"
                />
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="border rounded-lg p-2 w-full"
                  placeholder="Endereço"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => (window.location.href = "/patient-dashboard")}
              >
                <Home className="w-4 h-4 mr-2" /> Voltar
              </Button>

              <Button
                className="flex items-center bg-green-600 hover:bg-green-700"
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" /> Salvar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
