import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
});

// ── Token helpers (localStorage) ────────────────────────────────
const TOKEN_KEYS = {
  access: 'myo.web.accessToken',
  refresh: 'myo.web.refreshToken',
};

export const tokenStore = {
  getAccess: () => localStorage.getItem(TOKEN_KEYS.access),
  setAccess: (t: string) => localStorage.setItem(TOKEN_KEYS.access, t),
  getRefresh: () => localStorage.getItem(TOKEN_KEYS.refresh),
  setRefresh: (t: string) => localStorage.setItem(TOKEN_KEYS.refresh, t),
  clear: () => {
    localStorage.removeItem(TOKEN_KEYS.access);
    localStorage.removeItem(TOKEN_KEYS.refresh);
  },
};

// ── Interceptors & Refresh Logic ────────────────────────────────
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.getAccess();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const rt = tokenStore.getRefresh();
        if (!rt) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refreshToken: rt,
        });

        tokenStore.setAccess(data.accessToken);
        tokenStore.setRefresh(data.refreshToken);

        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStore.clear();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
