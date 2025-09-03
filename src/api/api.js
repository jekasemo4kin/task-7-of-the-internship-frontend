import axios from 'axios';
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && typeof token === 'string' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default api;