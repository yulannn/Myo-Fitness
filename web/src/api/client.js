// ─────────────────────────────────────────────────────────────
// Myo Fitness – Web API Client
// Lightweight fetch wrapper with automatic JWT refresh & retry
// ─────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${API_BASE}/api/v1`;

// ── Token helpers (localStorage – acceptable for web SPA) ────
const TOKEN_KEYS = {
  access: 'myo.web.accessToken',
  refresh: 'myo.web.refreshToken',
};

export const tokenStore = {
  getAccess: () => localStorage.getItem(TOKEN_KEYS.access),
  setAccess: (t) => localStorage.setItem(TOKEN_KEYS.access, t),
  getRefresh: () => localStorage.getItem(TOKEN_KEYS.refresh),
  setRefresh: (t) => localStorage.setItem(TOKEN_KEYS.refresh, t),
  clear: () => {
    localStorage.removeItem(TOKEN_KEYS.access);
    localStorage.removeItem(TOKEN_KEYS.refresh);
  },
};

// ── Refresh lock (avoid parallel refresh calls) ──────────────
let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const rt = tokenStore.getRefresh();
    if (!rt) throw new Error('No refresh token');

    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });

    if (!res.ok) {
      tokenStore.clear();
      throw new Error('Refresh failed');
    }

    const data = await res.json();
    tokenStore.setAccess(data.accessToken);
    tokenStore.setRefresh(data.refreshToken);
    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// ── Core request function ────────────────────────────────────
/**
 * @param {string} endpoint  – ex: "/auth/login"
 * @param {object} options
 * @param {string} [options.method]
 * @param {object} [options.body]
 * @param {object} [options.headers]
 * @param {boolean} [options.auth]     – attach Bearer token (default true)
 * @param {boolean} [options._retry]   – internal: prevent infinite loops
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers: extraHeaders = {},
    auth = true,
    _retry = false,
  } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (auth) {
    const token = tokenStore.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  // ── Auto-refresh on 401 ────────────────────────────────────
  if (res.status === 401 && auth && !_retry) {
    // Don't try refresh on auth endpoints
    if (endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh')) {
      const errBody = await res.json().catch(() => ({}));
      throw new ApiError(res.status, errBody);
    }

    try {
      await refreshAccessToken();
      return apiRequest(endpoint, { ...options, _retry: true });
    } catch {
      tokenStore.clear();
      // Redirect to login if not already there
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      throw new ApiError(401, { message: 'Session expirée – veuillez vous reconnecter' });
    }
  }

  // ── Handle errors ──────────────────────────────────────────
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new ApiError(res.status, errBody);
  }

  return res.json();
}

// ── Custom error class ───────────────────────────────────────
export class ApiError extends Error {
  constructor(status, body = {}) {
    const msg =
      typeof body.message === 'string'
        ? body.message
        : Array.isArray(body.message)
          ? body.message.join('. ')
          : body.error || 'Une erreur est survenue';
    super(msg);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}
