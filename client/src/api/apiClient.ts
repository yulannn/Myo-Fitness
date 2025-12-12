import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { tokenService } from "./services/tokenService";

const API_BASE_URL = "http://localhost:3000";

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    withCredentials: true,
});



let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
let isLoggingOut = false; // Flag pour indiquer qu'on est en train de se déconnecter
let failedQueue: {
    resolve: (token: string) => void;
    reject: (error: any) => void;
}[] = [];

// Fonction de rafraîchissement du token
const refreshToken = async (): Promise<string> => {
    if (!refreshPromise) {
        isRefreshing = true;

        refreshPromise = api
            .post("/auth/refresh")
            .then((res) => {
                const newToken = res.data.accessToken;
                tokenService.setAccessToken(newToken);
                return newToken;
            })
            .catch((error: AxiosError) => {
                console.error('❌ Échec du refresh token:', error.response?.status, error.response?.data);

                // Nettoyer complètement la session
                tokenService.clear();

                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('myo.auth.accessToken');

                    // Ne rediriger que si on n'est pas déjà sur une page d'authentification
                    // Pour éviter les boucles de redirection infinies
                    const isOnAuthPage = window.location.pathname.startsWith('/auth');

                    if (!isOnAuthPage) {
                        setTimeout(() => {
                            if (typeof window !== 'undefined') {
                                window.location.href = '/auth/login';
                            }
                        }, 500);
                    }
                }

                throw error;
            })
            .finally(() => {
                isRefreshing = false;
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

// Traiter la file d’attente
const processQueue = (error: any, token: string | null) => {
    failedQueue.forEach((p) => {
        if (error) {
            p.reject(error);
        } else {
            p.resolve(token!);
        }
    });
    failedQueue = [];
};

// Interceptor → Ajoute automatiquement le token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenService.getAccessToken();
    if (token && token.trim()) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de réponse
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Ne pas tenter de refresh sur les routes d'auth elles-mêmes
        if (originalRequest.url?.includes('/auth/refresh') ||
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/logout')) {
            return Promise.reject(error);
        }

        // Si 401 → token expiré
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Ne pas tenter de refresh si on est en train de se déconnecter
            if (isLoggingOut) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({
                            resolve: (token: string) => {
                                originalRequest.headers!.Authorization = `Bearer ${token}`;
                                resolve(api(originalRequest));
                            },
                            reject,
                        });
                    });
                }

                const newToken = await refreshToken();

                processQueue(null, newToken);

                originalRequest.headers!.Authorization = `Bearer ${newToken}`;

                return api(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr, null);

                // Le refresh a échoué, la session est déjà nettoyée dans refreshToken()
                // On rejette simplement l'erreur
                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(error);
    }
);

// Fonction pour indiquer qu'on est en train de se déconnecter
export const setLoggingOut = (value: boolean) => {
    isLoggingOut = value;
};

export default api;
