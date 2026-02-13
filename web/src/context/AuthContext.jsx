// ─────────────────────────────────────────────────────────────
// Myo Fitness – Web Auth Context
// Manages user state, token lifecycle & route protection
// ─────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../api/authApi.js';
import { tokenStore } from '../api/client.js';

/**
 * @typedef {{
 *   id: number,
 *   email: string,
 *   name: string,
 *   profilePictureUrl?: string | null,
 *   role?: 'USER' | 'COACH',
 * }} AuthUser
 *
 * @typedef {{
 *   user: AuthUser | null,
 *   loading: boolean,
 *   isAuthenticated: boolean,
 *   login: (email: string, password: string) => Promise<void>,
 *   logout: () => Promise<void>,
 * }} AuthContextValue
 */

const AuthContext = createContext(undefined);

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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
        const { user: freshUser } = await authApi.getMe();
        if (!cancelled) setUser(freshUser);
      } catch {
        // Token invalid / expired – clear silently
        tokenStore.clear();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restore();
    return () => { cancelled = true; };
  }, []);

  // ── Login ──────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);

    // Persist tokens
    tokenStore.setAccess(data.accessToken);
    tokenStore.setRefresh(data.refreshToken);

    // Set user in state
    setUser(data.user);
  }, []);

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Server-side logout failed – clear locally anyway
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  // ── Context value (memoised) ───────────────────────────────
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

// ── Hook ─────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
