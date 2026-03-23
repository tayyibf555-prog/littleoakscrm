import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, type MeResponse } from '@/api/auth';
import { setAccessToken } from '@/api/client';

interface AuthContextType {
  user: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to restore session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const { data } = await authApi.refresh();
        setAccessToken(data.accessToken);
        const { data: me } = await authApi.me();
        setUser(me);
      } catch {
        // No valid session
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    setAccessToken(data.accessToken);
    const { data: me } = await authApi.me();
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
