import { RouteData } from '../types/route';
import apiClient from './apiClient';
import storageService from '../services/storageService';

export interface CreateRouteDto {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  transport_type?: string[];
  route_data: any; // структура маршрута (например, geojson или массив точек)
  total_distance?: number;
  estimated_duration?: number;
  estimated_cost?: number;
  difficulty_level?: number;
  is_public?: boolean;
  tags?: string[];
  waypoints: Array<{
    marker_id: string;
    order_index: number;
    arrival_time?: string;
    departure_time?: string;
    duration_minutes?: number;
    notes?: string;
    is_overnight?: boolean;
  }>;
}

export interface UpdateRouteDto {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  transport_type?: string[];
  route_data?: any;
  total_distance?: number;
  estimated_duration?: number;
  estimated_cost?: number;
  difficulty_level?: number;
  is_public?: boolean;
  tags?: string[];
  waypoints?: Array<{
    marker_id: string;
    order_index: number;
    arrival_time?: string;
    departure_time?: string;
    duration_minutes?: number;
    notes?: string;
    is_overnight?: boolean;
  }>;
}

export async function getRoutes(token?: string): Promise<RouteData[]> {
  // Проверяем наличие токена перед запросом
  const actualToken = token || storageService.getItem('token');
  if (!actualToken) {
    // Для гостей возвращаем пустой массив без запроса к API
    return [];
  }
  
  try {
    const res = await apiClient.get('/routes');
    return res.data || [];
  } catch (error: any) {
    // Если 401 (Unauthorized) - это нормально для гостей, возвращаем пустой массив
    if (error.response?.status === 401) {
      return [];
    }
    throw error;
  }
}

export async function createRoute(data: CreateRouteDto, token?: string): Promise<RouteData> {
  const actualToken = token || storageService.getItem('token');
  
  // Если нет токена, сохраняем в storageService как черновик для гостей
  if (!actualToken) {
    const { saveDraft } = await import('../services/guestDrafts');
    const draft = saveDraft('route', data);
    
    // Возвращаем объект маршрута с префиксом draft
    return {
      id: `draft:${draft.id}`,
      title: data.title,
      description: data.description || '',
      points: data.waypoints?.map((wp, idx) => ({
        id: wp.marker_id || `point-${idx}`,
        latitude: 0, // Координаты будут в route_data
        longitude: 0,
        title: `Точка ${idx + 1}`,
        description: ''
      })) || [],
      totalDistance: data.total_distance,
      estimatedDuration: data.estimated_duration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      is_draft: true
    } as any;
  }
  
  const res = await apiClient.post('/routes', data);
  return res.data;
}

export async function updateRoute(id: string, data: UpdateRouteDto, token?: string): Promise<RouteData> {
  if (!token) {
    throw new Error('Токен авторизации требуется для обновления маршрута');
  }
  const res = await apiClient.put(`/routes/${id}`, data);
  return res.data;
}

export async function deleteRoute(id: string, token?: string): Promise<void> {
  if (!token) {
    throw new Error('Токен авторизации требуется для удаления маршрута');
  }
  await apiClient.delete(`/routes/${id}`);
} 