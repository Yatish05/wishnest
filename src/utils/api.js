import axios from 'axios';

/**
 * WishNest API Client Configuration
 * Security & Compatibility Architecture:
 * - Primary Auth: HttpOnly, Secure, SameSite=Lax cookies issued by /api/auth handlers.
 * - Local & Client Fallback: Bearer token in Authorization header for environments
 *   where browsers (e.g. Safari on HTTP localhost) block cookies on unencrypted origins.
 * - withCredentials: true ensures cookies are automatically sent on same-origin/cross-origin requests.
 */

const apiBaseUrl = '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach Bearer token if present in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiry (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API] Session expired or unauthorized. Clearing local state...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('authType');
      
      const protectedRoutes = ['/dashboard', '/wishlists', '/shared', '/notifications', '/ai-assistant', '/settings'];
      const isProtectedRoute = protectedRoutes.some((route) => window.location.pathname.startsWith(route));
      if (isProtectedRoute) {
        window.location.href = '/login?error=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export { apiBaseUrl };
export default api;
