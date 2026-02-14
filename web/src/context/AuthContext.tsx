import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { AuthService } from '../api/services/authService';
import { tokenStore } from '../api/apiClient';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount ───────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const token = tokenStore.getAccess();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { user: freshUser } = await AuthService.getMe();
        if (!cancelled) setUser(freshUser);
      } catch {
        tokenStore.clear();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restore();
    return () => { cancelled = true; };
  }, []);

  // ── Login ──────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const data = await AuthService.login(email, password);
    tokenStore.setAccess(data.accessToken);
    tokenStore.setRefresh(data.refreshToken);
    setUser(data.user);
  }, []);

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch {
      // ignore
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
