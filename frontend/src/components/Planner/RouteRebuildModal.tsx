import React, { useState, useMemo } from 'react';
import { X, ArrowUpDown, MapPin, Star, Map } from 'lucide-react';

interface ModalRoutePoint {
  id: string;
  title: string;
  coordinates: [number, number];
  description?: string;
  category?: string;
  isFavorite?: boolean;
  isNew?: boolean;
}

interface RouteRebuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRebuildRoute: (orderedPoints: ModalRoutePoint[]) => void;
  existingPoints: ModalRoutePoint[];
  newPoints: ModalRoutePoint[];
}

const RouteRebuildModal: React.FC<RouteRebuildModalProps> = ({
  isOpen,
  onClose,
  onRebuildRoute,
  existingPoints,
  newPoints
}) => {
  const [orderedPoints, setOrderedPoints] = useState<ModalRoutePoint[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Объединяем все точки при открытии модального окна
  useMemo(() => {
    if (isOpen) {
      const allPoints = [...existingPoints, ...newPoints];
      setOrderedPoints(allPoints);
    }
  }, [isOpen, existingPoints, newPoints]);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null) return;

    if (dragIndex !== index) {
      const newOrder = [...orderedPoints];
      const draggedItem = newOrder[dragIndex];
      newOrder.splice(dragIndex, 1);
      newOrder.splice(index, 0, draggedItem);
      setOrderedPoints(newOrder);
      setDragIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const movePoint = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newOrder = [...orderedPoints];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setOrderedPoints(newOrder);
  };

  const handleRebuild = () => {
    onRebuildRoute(orderedPoints);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Map className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Перестроить маршрут
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Описание */}
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <p className="text-sm text-blue-800">
            💡 Перетащите точки для изменения порядка следования. 
            Новые метки отмечены <span className="font-semibold">🆕</span>
          </p>
        </div>

        {/* Список точек */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {orderedPoints.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Нет точек для построения маршрута
            </div>
          ) : (
            <div className="space-y-3">
              {orderedPoints.map((point, index) => (
                <div
                  key={point.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`
                    flex items-center space-x-3 p-3 border rounded-lg cursor-move
                    ${dragIndex === index ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                    ${point.isNew ? 'bg-green-50 border-green-200' : 'bg-white'}
                    transition-all duration-200
                  `}
                >
                  {/* Номер */}
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>

                  {/* Иконка */}
                  <div className="flex-shrink-0">
                    {point.isFavorite ? (
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    ) : (
                      <MapPin className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Информация о точке */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-800 truncate">
                        {point.title}
                      </h3>
                      {point.isNew && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          🆕 Новая
                        </span>
                      )}
                    </div>
                    {point.description && (
                      <p className="text-sm text-gray-600 truncate">
                        {point.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Координаты: [{point.coordinates[0].toFixed(4)}, {point.coordinates[1].toFixed(4)}]
                    </p>
                  </div>

                  {/* Кнопки управления */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => movePoint(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUpDown className="w-4 h-4 text-gray-600 rotate-90" />
                    </button>
                    <button
                      onClick={() => movePoint(index, Math.min(orderedPoints.length - 1, index + 1))}
                      disabled={index === orderedPoints.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUpDown className="w-4 h-4 text-gray-600 -rotate-90" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Всего точек: <span className="font-semibold">{orderedPoints.length}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleRebuild}
              disabled={orderedPoints.length < 2}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Map className="w-4 h-4" />
              <span>Перестроить маршрут</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteRebuildModal;
