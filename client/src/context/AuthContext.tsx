import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthSuccessResponse, AuthUser } from '../types/auth.type';
import { AuthFetchDataService } from '../api/services/authService';
import { tokenService } from '../api/services/tokenService';
import { logAnalyticsEvent, AnalyticsEvents, setAnalyticsUserId } from '../utils/analytics';

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
        if (accessToken) {
            try {
                await AuthFetchDataService.logout(accessToken);
            } catch {
                // Ignore logout errors
            }
        }

        // Track logout event before clearing session
        if (user) {
            logAnalyticsEvent(AnalyticsEvents.USER_LOGOUT, {
                user_id: user.id,
                timestamp: new Date().toISOString()
            });
        }
        setAnalyticsUserId(null);

        clearSession();
        tokenService.clear();
        queryClient.clear();
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
