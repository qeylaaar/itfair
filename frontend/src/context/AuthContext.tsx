import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react"; 
import { jwtDecode } from "jwt-decode";
import axios from "axios";

interface AuthContextProps {
  token: string | null;
  user: any; // bisa di-typer lebih bagus
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextProps>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setUser(decoded);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } catch (e) {
          console.error("Token invalid");
          setUser(null);
          setToken(null);
          localStorage.removeItem("token"); // Membersihkan token yang tidak valid
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"]; // Membersihkan header axios
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};