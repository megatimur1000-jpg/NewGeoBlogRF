import React, { useState } from 'react';
import { UnifiedRoutePoint } from '../../types/routePoint';
import { FaGripVertical, FaTrash, FaArrowUp, FaArrowDown, FaRoute, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface RoutePointOrderProps {
  points: UnifiedRoutePoint[];
  onReorder: (newOrder: string[]) => void;
  onRemovePoint: (pointId: string) => void;
  onRebuildRoute?: () => void;
  className?: string;
}

const RoutePointOrder: React.FC<RoutePointOrderProps> = ({ 
  points, 
  onReorder, 
  onRemovePoint, 
  onRebuildRoute,
  className = '' 
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true); // По умолчанию свёрнуто

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newOrder = [...points.map(p => p.id)];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);
    
    onReorder(newOrder);
    setDraggedIndex(null);
  };

  const movePointUp = (index: number) => {
    if (index === 0) return;
    
    const newOrder = [...points.map(p => p.id)];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    onReorder(newOrder);
  };

  const movePointDown = (index: number) => {
    if (index === points.length - 1) return;
    
    const newOrder = [...points.map(p => p.id)];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onReorder(newOrder);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'favorites':
        return <span className="text-yellow-500">⭐</span>;
      case 'map-click':
        return <span className="text-green-500">📍</span>;
      case 'search':
        return <span className="text-blue-500">🔍</span>;
      case 'imported':
        return <span className="text-purple-500">📋</span>;
      default:
        return <span className="text-gray-500">•</span>;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'favorites':
        return 'border-l-yellow-400';
      case 'map-click':
        return 'border-l-green-400';
      case 'search':
        return 'border-l-blue-400';
      case 'imported':
        return 'border-l-purple-400';
      default:
        return 'border-l-gray-400';
    }
  };

  if (points.length === 0) {
    return null; // Не показываем компонент, если нет точек
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Заголовок аккордеона */}
      <div className="flex items-center justify-between p-3">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors flex-1"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <FaRoute className="text-blue-500" size={16} />
          <span className="font-medium text-gray-800">Порядок точек маршрута</span>
          <span className="text-sm text-gray-500">({points.length} точек)</span>
        </div>
        
        {/* Кнопка перестроения маршрута */}
        {onRebuildRoute && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRebuildRoute();
            }}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors mr-2"
            title="Перестроить маршрут с новым порядком"
          >
            🔄
          </button>
        )}
        
        <div 
          className="text-gray-400 cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <FaChevronDown size={14} /> : <FaChevronUp size={14} />}
        </div>
      </div>

      {/* Содержимое аккордеона */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 p-3 space-y-2">

      {points.map((point, index) => (
        <div
          key={point.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          className={`p-3 bg-white border rounded-lg shadow-sm cursor-move transition-all ${
            getSourceColor(point.source)
          } border-l-4 ${
            draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Drag handle */}
            <div className="text-gray-400 hover:text-gray-600">
              <FaGripVertical size={14} />
            </div>

            {/* Порядковый номер */}
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
              {index + 1}
            </div>

            {/* Информация о точке */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {getSourceIcon(point.source)}
                <span className="font-medium text-gray-800 truncate">
                  {point.title}
                </span>
              </div>
              
              {point.description && (
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {point.description}
                </div>
              )}
              
              <div className="text-xs text-gray-400 mt-1">
                [{point.coordinates[0].toFixed(4)}, {point.coordinates[1].toFixed(4)}]
              </div>
            </div>

            {/* Действия */}
            <div className="flex items-center gap-1">
              {/* Перемещение вверх */}
              <button
                onClick={() => movePointUp(index)}
                disabled={index === 0}
                className={`p-1 rounded ${
                  index === 0 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title="Переместить вверх"
              >
                <FaArrowUp size={12} />
              </button>

              {/* Перемещение вниз */}
              <button
                onClick={() => movePointDown(index)}
                disabled={index === points.length - 1}
                className={`p-1 rounded ${
                  index === points.length - 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title="Переместить вниз"
              >
                <FaArrowDown size={12} />
              </button>

              {/* Удаление */}
              <button
                onClick={() => onRemovePoint(point.id)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                title="Удалить точку"
              >
                <FaTrash size={12} />
              </button>
            </div>
          </div>
        </div>
      ))}

          {/* Подсказка */}
          <div className="text-xs text-gray-500 text-center mt-3 p-2 bg-gray-50 rounded">
            💡 Перетащите точки для изменения порядка или используйте кнопки ↑↓
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePointOrder;




