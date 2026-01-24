import apiClient from '../api/apiClient';
import storageService from './storageService';
import { Route } from '../types/route';

// Интерфейс для API ответа
export interface RouteApiData {
  id: string;
  title: string;
  description?: string;
  coordinates: [number, number][];
  distance?: number;
  duration?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

// Функция для преобразования API данных в Route
const transformApiDataToRoute = (apiData: RouteApiData): Route => {
  return {
    id: apiData.id,
    title: apiData.title,
    description: apiData.description,
    points: apiData.coordinates.map((coord, index) => ({
      id: `${apiData.id}-point-${index}`,
      latitude: coord[0],  // первый элемент - latitude
      longitude: coord[1], // второй элемент - longitude
      title: `Точка ${index + 1}`,
      description: ''
    })),
    totalDistance: apiData.distance,
    estimatedDuration: apiData.duration ? parseInt(apiData.duration) : undefined,
    createdAt: apiData.created_at,
    updatedAt: apiData.updated_at
  };
};

export const getRouteById = async (routeId: string): Promise<Route | null> => {
  try {
    // Проверяем наличие токена перед запросом
    const token = storageService.getItem('token');
    if (!token) {
      // Для гостей возвращаем null
      return null;
    }
    
    const response = await apiClient.get(`/routes/${routeId}`);
    
    if (response.data) {
      return transformApiDataToRoute(response.data);
    }
    return null;
  } catch (error: any) {
    // Если 401 (Unauthorized) - это нормально для гостей, возвращаем null
    if (error.response?.status === 401) {
      return null;
    }
    return null;
  }
};

// Функция для получения всех маршрутов
export const getAllRoutes = async (): Promise<Route[]> => {
  try {
    // Проверяем наличие токена перед запросом
    const token = storageService.getItem('token');
    if (!token) {
      // Для гостей возвращаем пустой массив
      return [];
    }
    
    const response = await apiClient.get('/routes');
    
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(transformApiDataToRoute);
    }
    return [];
  } catch (error: any) {
    // Если 401 (Unauthorized) - это нормально для гостей, возвращаем пустой массив
    if (error.response?.status === 401) {
      return [];
    }
    return [];
  }
};

// Экспортируем объект сервиса для совместимости
export const routeService = {
  getRouteById,
  getAllRoutes
};

// Экспортируем типы для совместимости
export type RouteData = Route;