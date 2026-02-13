// ─────────────────────────────────────────────────────────────
// Myo Fitness – Auth API Service (Web)
// Thin wrappers around the generic API client for auth endpoints
// ─────────────────────────────────────────────────────────────

import { apiRequest } from './client.js';

export const authApi = {
  /**
   * Login with email + password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{accessToken: string, refreshToken: string, user: object}>}
   */
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false, // no token needed for login
    }),

  /**
   * Get current authenticated user info.
   * @returns {Promise<{user: object}>}
   */
  getMe: () => apiRequest('/auth/me'),

  /**
   * Logout – Invalidate server-side refresh token.
   * @returns {Promise<{message: string}>}
   */
  logout: () =>
    apiRequest('/auth/logout', { method: 'POST' }),

  /**
   * Refresh the access token.
   * Handled automatically by the client interceptor, but exposed for manual use.
   * @param {string} refreshToken
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   */
  refresh: (refreshToken) =>
    apiRequest('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    }),
};

export default authApi;
