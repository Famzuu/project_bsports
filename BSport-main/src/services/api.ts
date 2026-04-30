import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { BASE_URL } from '../config/env'; // import dari env

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

// interceptor tetap sama
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    console.log('TOKEN DIPAKAI:', token); // ✅ TARUH DI SINI

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default api;