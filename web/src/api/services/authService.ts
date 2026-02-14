import api from '../apiClient';
import { User, AuthResponse } from '../../types';

export const AuthService = {
  /** Login with email + password */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  /** Get current authenticated user info */
  getMe: async (): Promise<{ user: User }> => {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data;
  },

  /** Logout */
  logout: async (): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>('/auth/logout');
    return data;
  },

  /** Refresh the access token */
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    return data;
  },
};

export default AuthService;
