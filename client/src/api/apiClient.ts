import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { tokenService } from "../utils/tokenService";

const api = axios.create({
    baseURL: "http://localhost:3000/api/v1",
    withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
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
    if (token) {
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

        // Si 401 → token expiré
        if (error.response?.status === 401 && !originalRequest._retry) {
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
                tokenService.clear();
                throw refreshErr;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
