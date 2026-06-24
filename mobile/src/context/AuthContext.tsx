import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../api/client";
import type { CurrentUser } from "../types";

interface AuthContextValue {
  user: CurrentUser | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  completePasswordReset: (email: string, code: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const me = await api<CurrentUser>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
      await setToken(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) {
          setUser(null);
          return;
        }
        await loadMe();
      } finally {
        setInitializing(false);
      }
    })();
  }, [loadMe]);

  const applySession = useCallback(async (token: string, nextUser: CurrentUser) => {
    await setToken(token);
    setUser(nextUser);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api<{ token: string; user: CurrentUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await applySession(result.token, result.user);
  }, [applySession]);

  const completePasswordReset = useCallback(async (email: string, code: string, newPassword: string) => {
    const result = await api<{ token: string; user: CurrentUser }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
    });
    await applySession(result.token, result.user);
  }, [applySession]);

  const signOut = useCallback(async () => {
    await setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, initializing, signIn, completePasswordReset, signOut, refresh: loadMe }),
    [user, initializing, signIn, completePasswordReset, signOut, loadMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
