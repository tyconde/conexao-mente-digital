
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "./NotificationBell";

export const Navigation = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout } = useAuth();

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

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBell />
                <span className="text-gray-700">Olá, {user.name}</span>
                <Button
                  onClick={() => {
                    if (user.type === "professional") {
                      window.location.href = "/professional-dashboard";
                    } else {
                      window.location.href = "/patient-dashboard";
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  {user.type === "professional" ? "Painel de Gestão" : "Fazer Agendamento"}
                </Button>
                <Button onClick={logout} variant="ghost" size="sm">
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setShowAuthModal(true)}>
                  Entrar
                </Button>
                <Button 
                  onClick={() => setShowAuthModal(true)} 
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
        mode="login"
        userType="patient"
      />
    </header>
  );
};
