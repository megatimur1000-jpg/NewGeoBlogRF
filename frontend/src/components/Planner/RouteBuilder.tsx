import React, { useState } from 'react';
import { FaRoute, FaMapMarkerAlt, FaSave, FaTimes, FaArrowUp, FaArrowDown, FaTrash } from 'react-icons/fa';
import { useRoutePlanner } from '../../contexts/RoutePlannerContext';
import { RoutePoint, RouteOptimizationOptions } from '../../types/route';
import { MarkerData } from '../../types/marker';

interface RouteBuilderProps {
  favorites: MarkerData[];
  onClose: () => void;
  onSave: (routeData: any) => void;
}

const RouteBuilder: React.FC<RouteBuilderProps> = ({ favorites, onClose, onSave }) => {
  const routePlannerContext = useRoutePlanner();

  // Проверяем, что контекст загружен
  if (!routePlannerContext) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка планировщика маршрутов...</p>
        </div>
      </div>
    );
  }

  const {
    routeBuilderState,
    addPointToRoute,
    removePointFromRoute,
    reorderRoutePoints,
    optimizeRoute,
    saveRoute,
    setRouteBuilderState
  } = routePlannerContext;

  const [routeTitle, setRouteTitle] = useState('Новый маршрут');
  const [routeDescription, setRouteDescription] = useState('');
  const [optimizationOptions, setOptimizationOptions] = useState<RouteOptimizationOptions>({
    algorithm: 'nearest',
    transportType: 'car'
  });

  // Добавить точку в маршрут
  const handleAddPoint = (marker: MarkerData) => {
    const routePoint: RoutePoint = {
      id: marker.id,
      latitude: marker.latitude,
      longitude: marker.longitude,
      title: marker.title,
      description: marker.description
    };
    addPointToRoute(routePoint);
  };

  // Удалить точку из маршрута
  const handleRemovePoint = (pointId: string) => {
    removePointFromRoute(pointId);
  };

  // Переместить точку вверх
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...routeBuilderState.routeOrder];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      reorderRoutePoints(newOrder);
    }
  };

  // Переместить точку вниз
  const handleMoveDown = (index: number) => {
    if (index < routeBuilderState.routeOrder.length - 1) {
      const newOrder = [...routeBuilderState.routeOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      reorderRoutePoints(newOrder);
    }
  };

  // Оптимизировать маршрут
  const handleOptimize = async () => {
    try {
      await optimizeRoute(optimizationOptions);
      // Здесь можно добавить уведомление об успешной оптимизации
    } catch (error) {
      }
  };

  // Сохранить маршрут
  const handleSave = async () => {
    try {
      const routeData = {
        title: routeTitle,
        description: routeDescription,
        points: routeBuilderState.selectedPoints,
        waypoints: routeBuilderState.selectedPoints.map((point: any, index: number) => ({
          id: `wp_${point.id}`,
          markerId: point.id,
          orderIndex: index,
          notes: '',
          isOvernight: false
        })),
        metadata: {
          totalDistance: 0, // Будет рассчитано при построении маршрута
          estimatedDuration: 0,
          estimatedCost: 0,
          difficultyLevel: 1,
          transportType: [optimizationOptions.transportType],
          tags: []
        },
        settings: {
          isPublic: true
        }
      };

      const savedRoute = await saveRoute(routeData);
      // Пробрасываем сохранение в избранное с выбранной категорией, если она уже есть в state
      try {
        const purpose = (routeBuilderState as any)?.purpose || (routeData as any).purpose;
        const category = (routeBuilderState as any)?.category || (routeData as any).category || purpose;
        // Сообщаем наверх, чтобы там добавили в favorites с назначением
        onSave({ ...savedRoute, purpose, category });
      } catch {
        onSave(savedRoute);
      }
      onClose();
    } catch (error) {
      }
  };

  // Перейти к следующему шагу
  const nextStep = () => {
    const steps: Array<'select' | 'order' | 'settings' | 'preview' | 'save'> = ['select', 'order', 'settings', 'preview', 'save'];
    const currentIndex = steps.indexOf(routeBuilderState.currentStep as 'select' | 'order' | 'settings' | 'preview' | 'save');
    if (currentIndex < steps.length - 1) {
      setRouteBuilderState({
        ...routeBuilderState,
        currentStep: steps[currentIndex + 1]
      });
    }
  };

  // Перейти к предыдущему шагу
  const prevStep = () => {
    const steps: Array<'select' | 'order' | 'settings' | 'preview' | 'save'> = ['select', 'order', 'settings', 'preview', 'save'];
    const currentIndex = steps.indexOf(routeBuilderState.currentStep as 'select' | 'order' | 'settings' | 'preview' | 'save');
    if (currentIndex > 0) {
      setRouteBuilderState({
        ...routeBuilderState,
        currentStep: steps[currentIndex - 1]
      });
    }
  };

  const renderStepContent = () => {
    switch (routeBuilderState.currentStep) {
      case 'select':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Выберите точки маршрута</h3>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {favorites.map(marker => (
                <div
                  key={marker.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    routeBuilderState.selectedPoints.some((p: any) => p.id === marker.id)
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleAddPoint(marker)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{marker.title}</h4>
                      <p className="text-sm text-gray-600">{marker.description}</p>
                    </div>
                    <FaMapMarkerAlt className="text-blue-500" />
                  </div>
                </div>
              ))}
            </div>
            {routeBuilderState.selectedPoints.length > 0 && (
              <button
                onClick={nextStep}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Продолжить ({routeBuilderState.selectedPoints.length} точек)
              </button>
            )}
          </div>
        );

      case 'order':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Порядок точек маршрута</h3>
            <div className="space-y-2">
              {routeBuilderState.selectedPoints.map((point: any, index: number) => (
                <div key={point.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <div>
                      <h4 className="font-medium">{point.title}</h4>
                      <p className="text-sm text-gray-600">{point.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-500 hover:text-blue-500 disabled:opacity-50"
                    >
                      <FaArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === routeBuilderState.selectedPoints.length - 1}
                      className="p-1 text-gray-500 hover:text-blue-500 disabled:opacity-50"
                    >
                      <FaArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => handleRemovePoint(point.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={prevStep}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Назад
              </button>
              <button
                onClick={nextStep}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Настройки
              </button>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Настройки маршрута</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название маршрута
                </label>
                <input
                  type="text"
                  value={routeTitle}
                  onChange={(e) => setRouteTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введите название маршрута"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={routeDescription}
                  onChange={(e) => setRouteDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Описание маршрута"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип транспорта
                </label>
                <select
                  value={optimizationOptions.transportType}
                  onChange={(e) => setOptimizationOptions(prev => ({ ...prev, transportType: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="car">Автомобиль</option>
                  <option value="walk">Пешком</option>
                  <option value="bike">Велосипед</option>
                  <option value="bus">Общественный транспорт</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Алгоритм оптимизации
                </label>
                <select
                  value={optimizationOptions.algorithm}
                  onChange={(e) => setOptimizationOptions(prev => ({ ...prev, algorithm: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="nearest">Ближайший</option>
                  <option value="fastest">Быстрый</option>
                  <option value="scenic">Живописный</option>
                  <option value="custom">Пользовательский</option>
                </select>
              </div>

              <button
                onClick={handleOptimize}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                Оптимизировать маршрут
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={prevStep}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Назад
              </button>
              <button
                onClick={nextStep}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Предварительный просмотр
              </button>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Предварительный просмотр</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">{routeTitle}</h4>
              {routeDescription && (
                <p className="text-gray-600 mb-3">{routeDescription}</p>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Количество точек:</span>
                  <span className="font-medium">{routeBuilderState.selectedPoints.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Тип транспорта:</span>
                  <span className="font-medium">{optimizationOptions.transportType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Алгоритм:</span>
                  <span className="font-medium">{optimizationOptions.algorithm}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="font-medium mb-2">Точки маршрута:</h5>
                <div className="space-y-1">
                  {routeBuilderState.selectedPoints.map((point: any, index: number) => (
                    <div key={point.id} className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500">#{index + 1}</span>
                      <span>{point.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={prevStep}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Назад
              </button>
              <button
                onClick={nextStep}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Сохранить маршрут
              </button>
            </div>
          </div>
        );

      case 'save':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Сохранение маршрута</h3>
            
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <FaSave />
                <span className="font-medium">Маршрут готов к сохранению!</span>
              </div>
              <p className="text-green-700 mt-2">
                Нажмите "Сохранить" чтобы добавить маршрут в вашу коллекцию.
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={prevStep}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Назад
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                Сохранить маршрут
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FaRoute className="text-blue-500" size={24} />
            <h2 className="text-xl font-semibold">Построение маршрута</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Прогресс */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-2">
            {['select', 'order', 'settings', 'preview', 'save'].map((step, index) => (
              <React.Fragment key={step}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    routeBuilderState.currentStep === step
                      ? 'bg-blue-500 text-white'
                      : index < ['select', 'order', 'settings', 'preview', 'save'].indexOf(routeBuilderState.currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 4 && (
                  <div
                    className={`flex-1 h-1 rounded ${
                      index < ['select', 'order', 'settings', 'preview', 'save'].indexOf(routeBuilderState.currentStep)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Контент */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default RouteBuilder;
