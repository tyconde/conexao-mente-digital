import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "./NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
<<<<<<< HEAD
import { useRouter } from "next/router";
=======
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Heart, ChevronDown } from "lucide-react";
>>>>>>> 09576e8 (fix: corrigido bug que exibia domingos como disponíveis no calendário de agendamento)

export const Navigation = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "selectType">("login");
<<<<<<< HEAD
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter(); // ✅ Next.js router

  const handleEditProfile = () => {
    router.push("/edit-profile"); // ✅ Navegação correta
    setDropdownOpen(false);
  };
=======
  const [profileImage, setProfileImage] = useState<string>("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const userData = registeredUsers.find((u: any) => u.id === user.id);
      setProfileImage(userData?.profileImage || "");
    }
  }, [user]);
>>>>>>> 09576e8 (fix: corrigido bug que exibia domingos como disponíveis no calendário de agendamento)

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              PsiConnect
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
              Início
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">
              Sobre
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors">
              Contato
            </Link>
          </nav>

          <div className="flex items-center space-x-4 relative">
            {user ? (
              <>
                <NotificationBell />
<<<<<<< HEAD

                {/* Avatar do usuário com dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center focus:outline-none"
                  >
                    <Avatar className="w-10 h-10">
                      {user.profileImage ? (
                        <AvatarImage src={user.profileImage} alt={user.name} />
                      ) : (
                        <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                      <button
                        onClick={handleEditProfile}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Editar Perfil
                      </button>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Sair
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-gray-700 ml-2 hidden md:inline">Olá, {user.name}</span>

                <Button
                  onClick={() => {
                    if (user.type === "professional") {
                      router.push("/professional-dashboard");
                    } else {
                      router.push("/patient-dashboard");
=======
                <span className="text-gray-700">Olá, {user.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={profileImage} alt={user.name} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 z-50">
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/favorites")} className="cursor-pointer">
                      <Heart className="w-4 h-4 mr-2 text-red-500" />
                      Favoritos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={() => {
                    if (user.type === "professional") {
                      navigate("/professional-dashboard");
                    } else {
                      navigate("/patient-dashboard");
>>>>>>> 09576e8 (fix: corrigido bug que exibia domingos como disponíveis no calendário de agendamento)
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  {user.type === "professional" ? "Painel de Gestão" : "Fazer Agendamento"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuthModal(true);
                  }}
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => {
                    setAuthMode("selectType");
                    setShowAuthModal(true);
                  }}
                  variant="outline"
                >
                  Cadastrar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        userType="patient"
      />
    </header>
  );
};
