import React from 'react';
import { FaSearch, FaStar, FaMapMarkerAlt, FaRoute, FaTimes, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { RoutePoint, PointSource } from '../../types/routeBuilder';

interface ActivePointsListProps {
  points: RoutePoint[];
  onRemovePoint: (pointId: string) => void;
  onTogglePoint: (pointId: string) => void;
  onReorderPoints: (newOrder: string[]) => void;
  onAddCoordinatePoint: () => void;
  onAddSearchPoint: () => void;
  onAddFavoritePoint: () => void;
}

const ActivePointsList: React.FC<ActivePointsListProps> = ({
  points,
  onRemovePoint,
  onTogglePoint,
  onReorderPoints,
  onAddCoordinatePoint,
  onAddSearchPoint,
  onAddFavoritePoint
}) => {
  const getSourceIcon = (source: PointSource) => {
    switch (source) {
      case 'search': return <FaSearch className="text-blue-500" />;
      case 'favorites': return <FaStar className="text-yellow-500" />;
      case 'click': return <FaMapMarkerAlt className="text-green-500" />;
      case 'coordinates': return <FaRoute className="text-purple-500" />;
      case 'route': return <FaRoute className="text-orange-500" />;
      default: return <FaMapMarkerAlt className="text-gray-500" />;
    }
  };

  const getSourceLabel = (source: PointSource, point: RoutePoint) => {
    switch (source) {
      case 'search': return 'Поиск';
      case 'favorites': return 'Избранное';
      case 'click': return 'добавлена кликом';
      case 'coordinates': return 'Координаты';
      case 'route': return `маршрут: ${point.description || 'без названия'}`;
      default: return 'Неизвестно';
    }
  };

  const movePoint = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...points.map(p => p.id)];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      onReorderPoints(newOrder);
    }
  };

  return (
    <div className="space-y-4">
      {/* Заголовок с количеством точек */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          📍 Активные точки ({points.length})
        </h3>
        {points.length >= 2 && (
          <span className="text-sm text-green-600 font-medium">
            ✅ Готов к построению
          </span>
        )}
      </div>

      {/* Список точек */}
      {points.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaMapMarkerAlt size={32} className="mx-auto mb-2 text-gray-300" />
          <p>Нет активных точек</p>
          <p className="text-sm">Добавьте точки для построения маршрута</p>
        </div>
      ) : (
        <div className="space-y-1">
          {points.map((point, index) => (
            <div
              key={point.id}
              className={`px-2 py-1.5 rounded border transition-all ${
                point.isActive 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {/* Номер и иконка источника */}
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-medium text-gray-600 w-4">
                      {index + 1}
                    </span>
                    {getSourceIcon(point.source)}
                  </div>
                  
                  {/* Информация о точке */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {point.title}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {getSourceLabel(point.source, point)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {point.coordinates[0].toFixed(4)}, {point.coordinates[1].toFixed(4)}
                    </p>
                  </div>
                </div>
                
                {/* Кнопки управления */}
                <div className="flex items-center space-x-1 ml-2">
                  {/* Кнопки изменения порядка */}
                  <button
                    onClick={() => movePoint(index, 'up')}
                    disabled={index === 0}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Переместить вверх"
                  >
                    <FaArrowUp size={10} />
                  </button>
                  <button
                    onClick={() => movePoint(index, 'down')}
                    disabled={index === points.length - 1}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Переместить вниз"
                  >
                    <FaArrowDown size={10} />
                  </button>
                  
                  {/* Кнопка включения/выключения */}
                  <button
                    onClick={() => onTogglePoint(point.id)}
                    className={`p-0.5 rounded ${
                      point.isActive 
                        ? 'text-green-600 hover:text-green-700' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title={point.isActive ? 'Выключить точку' : 'Включить точку'}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      point.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </button>
                  
                  {/* Кнопка удаления */}
                  <button
                    onClick={() => onRemovePoint(point.id)}
                    className="p-0.5 text-red-400 hover:text-red-600"
                    title="Удалить точку"
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Кнопки добавления точек */}
      <div className="border-t pt-3">
        <h4 className="text-xs font-medium text-gray-700 mb-2">
          ➕ Добавить точку:
        </h4>
        <div className="grid grid-cols-1 gap-1">
          <button
            onClick={onAddSearchPoint}
            className="flex items-center space-x-2 p-2 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <FaSearch className="text-blue-500" size={12} />
            <div>
              <div className="text-sm font-medium">🔍 Поиск адреса</div>
              <div className="text-xs text-gray-500">Найти место по названию</div>
            </div>
          </button>
          
          <button
            onClick={onAddCoordinatePoint}
            className="flex items-center space-x-2 p-2 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <FaRoute className="text-purple-500" size={12} />
            <div>
              <div className="text-sm font-medium">📍 Ввод по координатам</div>
              <div className="text-xs text-gray-500">Добавить по точным координатам</div>
            </div>
          </button>
          
          <button
            onClick={onAddFavoritePoint}
            className="flex items-center space-x-2 p-2 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <FaStar className="text-yellow-500" size={12} />
            <div>
              <div className="text-sm font-medium">⭐ Из избранного</div>
              <div className="text-xs text-gray-500">Выбрать из сохраненных мест</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivePointsList;
