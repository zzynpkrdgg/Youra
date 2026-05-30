import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — JWT token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('youra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — 401'de logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('youra_token');
      localStorage.removeItem('youra_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
