import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthSuccessResponse, AuthUser } from '../types/auth.type';
import { AuthFetchDataService } from '../api/services/authService';
import { tokenService } from '../api/services/tokenService';
import { logAnalyticsEvent, AnalyticsEvents, setAnalyticsUserId } from '../utils/analytics';
import { setLoggingOut } from '../api/apiClient';

interface MeResponse {
    user: AuthUser;
}

interface AuthContextValue {
    user: AuthUser | null;
    accessToken: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    applyAuthResult: (payload: AuthSuccessResponse) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const ACCESS_TOKEN_KEY = 'myo.auth.accessToken';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(() =>
        typeof window === 'undefined' ? null : window.localStorage.getItem(ACCESS_TOKEN_KEY)
    );
    const [initialised, setInitialised] = useState(false);

    const clearSession = useCallback(() => {
        setUser(null);
        setAccessToken(null);
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
        queryClient.removeQueries({ queryKey: ['auth'] });
    }, [queryClient]);

    const { data, isFetching, error } = useQuery<MeResponse, Error>({
        queryKey: ['auth', 'me'],
        queryFn: () => {
            if (!accessToken) {
                throw new Error('Missing access token');
            }
            return AuthFetchDataService.getCurrentUser(accessToken);
        },
        enabled: Boolean(accessToken),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 1,
    });

    useEffect(() => {
        if (data?.user) {
            setUser(data.user);
            setInitialised(true);
            // Set Analytics user ID when user is loaded
            setAnalyticsUserId(data.user.id.toString());
        }
    }, [data]);

    useEffect(() => {
        if (error) {
            clearSession();
            setInitialised(true);
        }
    }, [error, clearSession]);

    useEffect(() => {
        if (!accessToken) {
            setInitialised(true);
        }
    }, [accessToken]);

    const applyAuthResult = useCallback(
        (payload: AuthSuccessResponse) => {
            setUser(payload.user);
            setAccessToken(payload.accessToken);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
            }
            queryClient.setQueryData(['auth', 'me'], { user: payload.user });

            // Track login event in Analytics
            logAnalyticsEvent(AnalyticsEvents.USER_LOGIN, {
                user_id: payload.user.id,
                timestamp: new Date().toISOString()
            });
            setAnalyticsUserId(payload.user.id.toString());
        },
        [queryClient]
    );

    const logout = useCallback(async () => {
        // Indiquer qu'on est en train de se déconnecter pour empêcher les refresh
        setLoggingOut(true);

        // Track logout event before clearing session
        if (user) {
            logAnalyticsEvent(AnalyticsEvents.USER_LOGOUT, {
                user_id: user.id,
                timestamp: new Date().toISOString()
            });
        }
        setAnalyticsUserId(null);

        // Sauvegarder le token actuel avant de le nettoyer
        const currentToken = accessToken;

        // Nettoyer immédiatement la session locale pour éviter que des requêtes ne se déclenchent
        clearSession();
        tokenService.clear();

        // Annuler toutes les requêtes en cours et vider le cache
        queryClient.cancelQueries();
        queryClient.clear();

        // Appeler l'API de logout en dernier avec le token sauvegardé
        if (currentToken) {
            try {
                await AuthFetchDataService.logout(currentToken);
            } catch {
                // Ignore logout errors - la session est déjà nettoyée localement
            }
        }

        // Réinitialiser le flag de logout
        setLoggingOut(false);

        // Note: Pas besoin de redirection ici - le ProtectedRoute redirigera automatiquement
        // vers /auth/login dès que isAuthenticated devient false
    }, [accessToken, clearSession, queryClient, user]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            accessToken,
            loading: !initialised || isFetching,
            isAuthenticated: Boolean(user && accessToken),
            applyAuthResult,
            logout,
        }),
        [user, accessToken, initialised, isFetching, applyAuthResult, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
