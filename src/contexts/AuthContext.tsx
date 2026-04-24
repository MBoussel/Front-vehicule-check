import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getCurrentUser, login as loginRequest } from "../api/authApi";
import type { CurrentUser } from "../types/auth";
import { getToken, removeToken, saveToken } from "../utils/storage";

interface AuthContextValue {
  user: CurrentUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function bootstrap() {
      const storedToken = getToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(storedToken);
        setToken(storedToken);
        setUser(currentUser);
      } catch (error) {
        removeToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void bootstrap();
  }, []);

  async function login(email: string, password: string) {
    const response = await loginRequest(email, password);
    saveToken(response.access_token);
    setToken(response.access_token);

    const currentUser = await getCurrentUser(response.access_token);
    setUser(currentUser);
  }

  function logout() {
    removeToken();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}