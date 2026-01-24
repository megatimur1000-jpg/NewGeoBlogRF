import React, { useState } from 'react';
import { RoutePointStats as RoutePointStatsType } from '../../types/routePoint';
import { FaMapMarkerAlt, FaStar, FaSearch, FaMousePointer, FaRoute, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface RoutePointStatsProps {
  stats: RoutePointStatsType;
  className?: string;
}

const RoutePointStats: React.FC<RoutePointStatsProps> = ({ stats, className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // По умолчанию свёрнуто
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'favorites':
        return <FaStar className="text-yellow-500" size={14} />;
      case 'map-click':
        return <FaMousePointer className="text-green-500" size={14} />;
      case 'search':
        return <FaSearch className="text-blue-500" size={14} />;
      case 'imported':
        return <FaRoute className="text-purple-500" size={14} />;
      default:
        return <FaInfoCircle className="text-gray-500" size={14} />;
    }
  };

  const getSourceLabel = (sourceType: string) => {
    switch (sourceType) {
      case 'favorites':
        return 'Избранное';
      case 'map-click':
        return 'Клик по карте';
      case 'search':
        return 'Поиск';
      case 'imported':
        return 'Импорт';
      default:
        return sourceType;
    }
  };

  const getSourceColor = (sourceType: string) => {
    switch (sourceType) {
      case 'favorites':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'map-click':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'search':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'imported':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (stats.totalPoints === 0) {
    return null; // Не показываем компонент, если нет точек
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Заголовок аккордеона */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-500" size={16} />
          <span className="font-medium text-gray-800">
            Точки маршрута: {stats.totalPoints}
          </span>
          
          {/* Статус возможности построения */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            stats.canBuildRoute 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {stats.canBuildRoute ? '✓' : '✗'}
          </div>
        </div>
        
        <div className="text-gray-400">
          {isCollapsed ? <FaChevronDown size={14} /> : <FaChevronUp size={14} />}
        </div>
      </div>

      {/* Содержимое аккордеона */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 p-3">

      {/* Источники точек */}
      <div className="space-y-2">
        {stats.sources.map((source) => (
          <div key={source.type} className="flex items-center justify-between p-2 rounded-lg border">
            <div className="flex items-center gap-2">
              {getSourceIcon(source.type)}
              <span className="text-sm font-medium text-gray-700">
                {getSourceLabel(source.type)}
              </span>
              <span className="text-xs text-gray-500">
                ({source.count} {source.count === 1 ? 'точка' : source.count < 5 ? 'точки' : 'точек'})
              </span>
            </div>
            
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSourceColor(source.type)}`}>
              {source.isActive ? 'Активно' : 'Неактивно'}
            </div>
          </div>
        ))}
      </div>

      {/* Дополнительная информация */}
      {stats.canBuildRoute && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaRoute className="text-green-500" size={14} />
            <span>Маршрут можно построить</span>
          </div>
          
          {stats.estimatedDistance && (
            <div className="text-xs text-gray-500 mt-1">
              Примерное расстояние: ~{Math.round(stats.estimatedDistance)} км
            </div>
          )}
          
          {stats.estimatedDuration && (
            <div className="text-xs text-gray-500">
              Примерное время: ~{Math.round(stats.estimatedDuration)} мин
            </div>
          )}
        </div>
      )}

          {/* Рекомендации */}
          {!stats.canBuildRoute && stats.totalPoints > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <FaInfoCircle size={14} />
                <span>Для построения маршрута нужно минимум 2 точки</span>
              </div>
              <div className="text-xs text-amber-500 mt-1">
                Добавьте ещё {2 - stats.totalPoints} точку
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoutePointStats;

