import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || '/api';
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '');
const apiBaseUrl = normalizedBaseUrl === '/api' || normalizedBaseUrl.endsWith('/api')
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
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
  (error) => {
    return Promise.reject(error);
  }
);

export { apiBaseUrl };
export default api;
