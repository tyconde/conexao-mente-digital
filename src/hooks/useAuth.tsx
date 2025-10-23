
import { useState, useEffect, createContext, useContext } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: "patient" | "professional";
  age?: string;
  profession?: string;
  maritalStatus?: string;
  crp?: string;
  specialty?: string;
  password: string; // Para validação (em produção seria hash)
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; message?: string };
  register: (userData: Omit<User, 'id'>) => { success: boolean; message?: string };
  logout: () => void;
  isAuthenticated: boolean;
  clearAllUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const register = (userData: Omit<User, 'id'>): { success: boolean; message?: string } => {
    try {
      // Verificar se o email já existe
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const emailExists = existingUsers.some((u: User) => u.email === userData.email);
      
      if (emailExists) {
        return { success: false, message: "Este email já está cadastrado! Tente fazer login ou use outro email." };
      }

      // Criar novo usuário
      const newUser: User = {
        ...userData,
        id: Date.now()
      };

      // Salvar na lista de usuários registrados
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

      // Fazer login automático
      const userForLogin = { ...newUser };
      delete userForLogin.password; // Não manter senha no estado do usuário logado
      setUser(userForLogin as User);
      localStorage.setItem("currentUser", JSON.stringify(userForLogin));

      return { success: true };
    } catch (error) {
      console.error("Erro no registro:", error);
      return { success: false, message: "Ocorreu um erro ao realizar o cadastro. Por favor, tente novamente." };
    }
  };

  const login = (email: string, password: string): { success: boolean; message?: string } => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const foundUser = registeredUsers.find((u: User) => 
        u.email === email && u.password === password
      );

      if (foundUser) {
        const userForLogin = { ...foundUser };
        delete userForLogin.password; // Não manter senha no estado
        setUser(userForLogin as User);
        localStorage.setItem("currentUser", JSON.stringify(userForLogin));
        return { success: true };
      } else {
        return { success: false, message: "Email ou senha incorretos! Verifique seus dados e tente novamente." };
      }
    } catch (error) {
      console.error("Erro no login:", error);
      return { success: false, message: "Ocorreu um erro ao fazer login. Por favor, tente novamente." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    // Não removemos mais os agendamentos no logout para preservar dados entre contas
  };

  const clearAllUsers = () => {
    localStorage.removeItem("registeredUsers");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("appointments");
    setUser(null);
    alert("Todos os dados foram limpos!");
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      clearAllUsers,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro do AuthProvider");
  }
  return context;
};
