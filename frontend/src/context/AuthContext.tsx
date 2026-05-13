import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type UserRole } from "../lib/api";

type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  } | null;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "hrms_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!token) {
      delete api.defaults.headers.common.Authorization;
      setUser(null);
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    api.get<AuthUser>("/auth/me").then((res) => setUser(res.data)).catch(() => {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    });
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await api.post<{ token: string; user: AuthUser }>("/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
