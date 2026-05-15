import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 120000, // 2 minutes for audio/video uploads
});

// Attach token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pastor_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Only redirect to login for DASHBOARD/protected routes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const protectedPaths = ['/dashboard', '/interpretations'];
      const isProtected = protectedPaths.some(p => window.location.pathname.startsWith(p));
      if (isProtected) {
        localStorage.removeItem('pastor_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;