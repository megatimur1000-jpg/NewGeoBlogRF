import { useState, useEffect } from 'react';
import { Route } from '../types/route';
import apiClient from '../api/apiClient';

// Хук для работы с избранными маршрутами
export const useFavoriteRoutes = () => {
  const [favoriteRoutes, setFavoriteRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка избранных маршрутов
  const loadFavoriteRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем избранные маршруты с бэкенда
      const response = await apiClient.get('/routes/favorites');
      setFavoriteRoutes(response.data);
    } catch (err) {
      setError('Ошибка загрузки избранных маршрутов');
    } finally {
      setLoading(false);
    }
  };

  // Получение маршрута по ID
  const getRouteById = (routeId: string): Route | undefined => {
    return favoriteRoutes.find(route => route.id === routeId);
  };

  // Добавление маршрута в избранное
  const addToFavorites = async (route: Route) => {
    try {
      await apiClient.post(`/routes/${route.id}/favorite`);
      setFavoriteRoutes(prev => [...prev, { ...route, isFavorite: true }]);
    } catch (err) {
      setError('Ошибка добавления маршрута в избранное');
    }
  };

  // Удаление из избранного
  const removeFromFavorites = async (routeId: string) => {
    try {
      await apiClient.delete(`/routes/${routeId}/favorite`);
      setFavoriteRoutes(prev => prev.filter(route => route.id !== routeId));
    } catch (err) {
      setError('Ошибка удаления маршрута из избранного');
    }
  };

  // Загружаем маршруты при монтировании
  useEffect(() => {
    loadFavoriteRoutes();
  }, []);

  return {
    favoriteRoutes,
    loading,
    error,
    loadFavoriteRoutes,
    getRouteById,
    addToFavorites,
    removeFromFavorites
  };
};

export default useFavoriteRoutes;

