import React, { useState, useEffect } from 'react';

import { MapPin, Plus, Trash2, Save, Loader2 } from 'lucide-react';

interface Route {
  id: string;
  name: string;
  points: Array<{
    name?: string;
    coordinates?: { lat: number; lng: number };
  }>;
  createdAt: string;
}

import StarRating from '../ui/StarRating';
import { useRating } from '../../hooks/useRating';

const RouteRating: React.FC<{ routeId: string | number }> = ({ routeId }) => {
  const { summary, handleRate } = useRating('route', routeId);
  return (
    <div className="flex items-center ml-3">
      <StarRating value={summary.avg || 0} count={summary.count} interactive onChange={handleRate} />
    </div>
  );
};

const RoutePlanner: React.FC = () => {
  // Добавляем недостающие свойства в контекст
  const routes: Route[] = [];
  const addRoute = (route: Route) => {
    // Добавляем локальное состояние для демонстрации
    setLocalRoutes(prev => [...prev, route]);
  };
  const deleteRoute = (id: string) => {
    // Удаляем из локального состояния
    setLocalRoutes(prev => prev.filter(r => r.id !== id));
  };
  const saveRoute = async (id: string) => {
    // Логика сохранения
  };
  const loadRoutes = () => {
    // Логика загрузки
  };
  
  // Добавляем локальное состояние для демонстрации
  const [localRoutes, setLocalRoutes] = useState<Route[]>([]);
  
  // Используем локальные маршруты если контекст пустой
  const displayRoutes = routes.length > 0 ? routes : localRoutes;
  const [newRouteName, setNewRouteName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddRoute = () => {
    if (newRouteName.trim()) {
      addRoute({
        id: Date.now().toString(),
        name: newRouteName.trim(),
        points: [],
        createdAt: new Date().toISOString()
      });
      setNewRouteName('');
    }
  };

  const handleSaveRoute = async (routeId: string) => {
    setIsLoading(true);
    try {
      await saveRoute(routeId);
    } catch (error) {
      } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoute = (routeId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот маршрут?')) {
      deleteRoute(routeId);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Планировщик маршрутов</h2>
        <p className="text-sm text-gray-600">
          Создавайте и управляйте маршрутами для путешествий
        </p>
      </div>

      {/* Создание нового маршрута */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newRouteName}
            onChange={(e) => setNewRouteName(e.target.value)}
            placeholder="Название маршрута"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddRoute()}
          />
          <button
            onClick={handleAddRoute}
            disabled={!newRouteName.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Создать</span>
          </button>
        </div>
      </div>

      {/* Список маршрутов */}
      <div className="space-y-4">
        {displayRoutes.map((route: Route) => (
          <div
            key={route.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <MapPin size={20} className="text-blue-500" />
                <h3 className="text-lg font-medium text-gray-900">{route.name}</h3>
                <span className="text-sm text-gray-500">
                  {route.points.length} точек
                </span>
                {route.id && (
                  <RouteRating routeId={route.id} />
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSaveRoute(route.id)}
                  disabled={isLoading}
                  className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center space-x-1"
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Сохранить</span>
                </button>
                
                <button
                  onClick={() => handleDeleteRoute(route.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center space-x-1"
                >
                  <Trash2 size={14} />
                  <span>Удалить</span>
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Создан: {new Date(route.createdAt).toLocaleDateString('ru-RU')}
            </div>
            
            {route.points.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Точки маршрута:</h4>
                <div className="space-y-1">
                                     {route.points.map((point: any, index: number) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span>{point.name || `Точка ${index + 1}`}</span>
                      {point.coordinates && (
                        <span className="text-gray-400">
                          ({point.coordinates.lat.toFixed(4)}, {point.coordinates.lng.toFixed(4)})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {displayRoutes.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <MapPin size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600">Маршруты не найдены</p>
          <p className="text-sm text-gray-500">Создайте свой первый маршрут!</p>
        </div>
      )}
    </div>
  );
};

export default RoutePlanner;

