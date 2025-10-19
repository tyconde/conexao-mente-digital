import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "./NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/router";

export const Navigation = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "selectType">("login");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter(); // ✅ Next.js router

  const handleEditProfile = () => {
    router.push("/edit-profile"); // ✅ Navegação correta
    setDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-primary">
              PsiConnect
            </a>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-700 hover:text-primary transition-colors">
              Início
            </a>
            <a href="/about" className="text-gray-700 hover:text-primary transition-colors">
              Sobre
            </a>
            <a href="/contact" className="text-gray-700 hover:text-primary transition-colors">
              Contato
            </a>
          </nav>

          <div className="flex items-center space-x-4 relative">
            {user ? (
              <>
                <NotificationBell />

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
