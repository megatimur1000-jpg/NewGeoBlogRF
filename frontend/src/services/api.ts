import axios from 'axios';
import storageService from './storageService';

const api = axios.create({
  baseURL: '/api', // Используем относительный путь через Vite proxy
});

// Добавляем токен из storageService в каждый запрос
api.interceptors.request.use((config) => {
  const token = storageService.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
