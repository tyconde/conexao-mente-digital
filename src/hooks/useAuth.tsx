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
  profileImage?: string; // 🔑 adicionamos aqui
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (userData: Omit<User, 'id'>) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  clearAllUsers: () => void;
  updateUser: (data: Partial<User>) => void; // 🔑 adicionamos aqui
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
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const emailExists = existingUsers.some((u: User) => u.email === userData.email);

      if (emailExists) {
        alert("Este email já está cadastrado!");
        return false;
      }

      const newUser: User = { ...userData, id: Date.now() };

      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

      const userForLogin = { ...newUser };
      delete userForLogin.password;
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
        delete userForLogin.password;
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
  };

  const clearAllUsers = () => {
    localStorage.removeItem("registeredUsers");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("appointments");
    setUser(null);
    alert("Todos os dados foram limpos!");
  };

  // 🔑 Novo método para atualizar usuário
  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem("currentUser", JSON.stringify(updated));
      return updated;
    });

    // Também atualiza na lista de usuários registrados
    const registeredUsers: User[] = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const updatedUsers = registeredUsers.map(u => u.id === user?.id ? { ...u, ...data } : u);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      clearAllUsers,
      isAuthenticated: !!user,
      updateUser // 🔑 adicionamos aqui
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
