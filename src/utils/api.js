import axios from 'axios';

const apiBaseUrl = '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  // include cookies for same-origin requests (helps OAuth/session flows)
  withCredentials: true,
});

// Add a request interceptor to include the auth token
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

// Add a response interceptor to handle session expiry (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API] Session expired or unauthorized. Clearing local state...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('authType');
      // Force a reload or redirect if we are not on a public page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
        window.location.href = '/login?error=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export { apiBaseUrl };
export default api;
