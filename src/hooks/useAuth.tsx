
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
  login: (email: string, password: string) => boolean;
  register: (userData: Omit<User, 'id'>) => boolean;
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

  const register = (userData: Omit<User, 'id'>): boolean => {
    try {
      // Verificar se o email já existe
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const emailExists = existingUsers.some((u: User) => u.email === userData.email);
      
      if (emailExists) {
        alert("Este email já está cadastrado!");
        return false;
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

      return true;
    } catch (error) {
      console.error("Erro no registro:", error);
      return false;
    }
  };

  const login = (email: string, password: string): boolean => {
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
        return true;
      } else {
        alert("Email ou senha incorretos!");
        return false;
      }
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
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
