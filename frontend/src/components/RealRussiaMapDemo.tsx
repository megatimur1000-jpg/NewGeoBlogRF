import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Play, Train } from 'lucide-react';
import { getRoutePolyline } from '../services/routingService';

interface Marker {
  id: string;
  position: { x: number; y: number };
  title: string;
  description: string;
  delay: number;
}

const RealRussiaMapDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [trainPosition, setTrainPosition] = useState({ x: 0, y: 0 });
  const [showRoute, setShowRoute] = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [showTrain, setShowTrain] = useState(false);
  const [realRoutePoints, setRealRoutePoints] = useState<Array<{x: number, y: number}>>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const markers: Marker[] = [
    {
      id: 'moscow',
      position: { x: 20, y: 40 }, // ИЗМЕНИТЕ КООРДИНАТЫ ЗДЕСЬ
      title: 'Красная площадь',
      description: 'Москва',
      delay: 2000
    },
    {
      id: 'chelyabinsk',
      position: { x: 50, y: 35 }, // ИЗМЕНИТЕ КООРДИНАТЫ ЗДЕСЬ
      title: 'Челябинский метеорит',
      description: 'Челябинск',
      delay: 6000
    },
    {
      id: 'vladivostok',
      position: { x: 85, y: 30 }, // ИЗМЕНИТЕ КООРДИНАТЫ ЗДЕСЬ
      title: 'Золотой мост',
      description: 'Владивосток',
      delay: 12000
    }
  ];

  // Реальные координаты городов России
  const realCities = [
    { name: 'Москва', lat: 55.7558, lng: 37.6176 },
    { name: 'Челябинск', lat: 55.1644, lng: 61.4368 },
    { name: 'Владивосток', lat: 43.1056, lng: 131.8735 }
  ];

  // Функция для получения реального маршрута
  const getRealRoute = async () => {
    try {
      const points: [number, number][] = realCities.map(city => [city.lng, city.lat]);
      const polyline = await getRoutePolyline(points);
      
      // Конвертируем координаты полилинии в проценты для отображения на карте
      const routePoints = polyline.map(([lat, lng]) => {
        // Простая проекция: конвертируем координаты в проценты
        const x = ((lng - 37.6176) / (131.8735 - 37.6176)) * 80 + 20; // От 20% до 100%
        const y = ((lat - 55.7558) / (43.1056 - 55.7558)) * 20 + 40; // От 40% до 60%
        return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
      });
      
      return routePoints;
    } catch (error) {
      console.error('Ошибка получения реального маршрута:', error);
      // Возвращаем упрощенный маршрут в случае ошибки
      return [
        { x: 20, y: 40 }, // Москва
        { x: 35, y: 37 }, // Челябинск
        { x: 85, y: 30 }  // Владивосток
      ];
    }
  };

  const routePoints = [
    { x: 20, y: 40 }, // Москва
    { x: 25, y: 39 }, // Пермь
    { x: 30, y: 38 }, // Екатеринбург
    { x: 35, y: 37 }, // Челябинск
    { x: 45, y: 36 }, // Омск
    { x: 55, y: 35 }, // Новосибирск
    { x: 65, y: 34 }, // Красноярск
    { x: 75, y: 33 }, // Иркутск
    { x: 85, y: 30 }  // Владивосток
  ];

  // Загружаем реальный маршрут при инициализации
  useEffect(() => {
    const loadRealRoute = async () => {
      const route = await getRealRoute();
      setRealRoutePoints(route);
    };
    loadRealRoute();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startInfiniteAnimation();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const startInfiniteAnimation = () => {
    const animateCycle = () => {
      setCurrentStep(0);
      setShowRoute(false);
      setTrainPosition({ x: 0, y: 0 });
      setActivePopup(null);
      setShowTrain(false);
      setAnimationCycle(prev => prev + 1);

      // 1. Появление метки Москвы (через 2 секунды)
      setTimeout(() => {
        setCurrentStep(1);
        console.log('Метка Москвы появилась');
      }, 2000);
      
      // 2. Появление попапа Москвы (через 4 секунды)
      setTimeout(() => {
        setActivePopup('moscow');
        console.log('Попап Москвы появился');
      }, 4000);
      
      // 3. Закрытие попапа Москвы (через 7 секунд)
      setTimeout(() => {
        setActivePopup(null);
        console.log('Попап Москвы закрылся');
      }, 7000);
      
      // 4. Появление маршрута (через 8 секунд)
      setTimeout(() => {
        setShowRoute(true);
        console.log('Маршрут появился');
      }, 8000);
      
      // 5. Анимация поезда (через 9 секунд)
      setTimeout(() => {
        setShowTrain(true);
        animateTrain();
        console.log('Поезд начал движение');
      }, 9000);
      
      // 6. Появление метки Челябинска (через 15 секунд)
      setTimeout(() => {
        setCurrentStep(2);
        console.log('Метка Челябинска появилась');
      }, 15000);
      
      // 7. Появление попапа Челябинска (через 17 секунд)
      setTimeout(() => {
        setActivePopup('chelyabinsk');
        console.log('Попап Челябинска появился');
      }, 17000);
      
      // 8. Закрытие попапа Челябинска (через 20 секунд)
      setTimeout(() => {
        setActivePopup(null);
        console.log('Попап Челябинска закрылся');
      }, 20000);
      
      // 9. Появление метки Владивостока (через 25 секунд)
      setTimeout(() => {
        setCurrentStep(3);
        console.log('Метка Владивостока появилась');
      }, 25000);
      
      // 10. Появление попапа Владивостока (через 27 секунд)
      setTimeout(() => {
        setActivePopup('vladivostok');
        console.log('Попап Владивостока появился');
      }, 27000);
      
      // 11. Закрытие попапа Владивостока (через 30 секунд)
      setTimeout(() => {
        setActivePopup(null);
        console.log('Попап Владивостока закрылся');
      }, 30000);
      
      // Перезапуск через 35 секунд
      setTimeout(() => {
        if (isPlaying) {
          console.log('Перезапуск анимации');
          animateCycle();
        }
      }, 35000);
    };

    animateCycle();
  };

  const animateTrain = () => {
    let progress = 0;
    const animate = () => {
      progress += 0.005; // Замедлили в 2 раза
      if (progress <= 1) {
        // Используем реальный маршрут если он загружен, иначе fallback
        const pointsToUse = realRoutePoints.length > 0 ? realRoutePoints : routePoints;
        
        const pointIndex = Math.floor(progress * (pointsToUse.length - 1));
        const nextPointIndex = Math.min(pointIndex + 1, pointsToUse.length - 1);
        const localProgress = (progress * (pointsToUse.length - 1)) % 1;
        
        const currentPoint = pointsToUse[pointIndex];
        const nextPoint = pointsToUse[nextPointIndex];
        
        // Конвертируем проценты в абсолютные координаты для поезда
        const x = (currentPoint.x + (nextPoint.x - currentPoint.x) * localProgress) / 100 * 600;
        const y = (currentPoint.y + (nextPoint.y - currentPoint.y) * localProgress) / 100 * 400;
        
        setTrainPosition({ x, y });
        requestAnimationFrame(animate);
      } else {
        console.log('Поезд доехал до конечной точки');
      }
    };
    animate();
  };

  const getRoutePath = () => {
    if (!showRoute) return '';
    
    // Используем реальный маршрут если он загружен, иначе fallback
    const pointsToUse = realRoutePoints.length > 0 ? realRoutePoints : routePoints;
    
    return pointsToUse.map((point, index) => {
      // Конвертируем проценты в абсолютные координаты
      const x = (point.x / 100) * 600; // 600px ширина контейнера
      const y = (point.y / 100) * 400; // 400px высота контейнера
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const shouldShowMarker = (marker: Marker) => {
    const markerIndex = markers.indexOf(marker);
    return currentStep >= markerIndex + 1;
  };

  return (
    <div className="relative w-full h-[600px] bg-white overflow-hidden">
      {/* Карта России с вашим изображением */}
      <div 
        ref={mapRef}
        className="absolute inset-0 bg-white"
        style={{
          backgroundImage: `url('/images/1644870539_4-abrakadabra-fun-p-siluet-rossii-na-prozrachnom-fone-4.png')`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        {/* Маршрут */}
        {showRoute && (
          <svg className="absolute inset-0 w-full h-full z-10">
            <path
              d={getRoutePath()}
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeDasharray="10,5"
              className="animate-pulse"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))'
              }}
            />
            {/* Дополнительная линия для лучшей видимости */}
            <path
              d={getRoutePath()}
              fill="none"
              stroke="#ffffff"
              strokeWidth="6"
              strokeDasharray="10,5"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Поезд */}
        {showTrain && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ 
              left: `${trainPosition.x}px`, 
              top: `${trainPosition.y}px`,
              transition: 'all 0.1s ease-out'
            }}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg animate-bounce">
              <Train className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Метки */}
        {markers.map((marker) => {
          const shouldShow = shouldShowMarker(marker);
          if (!shouldShow) return null;

          return (
            <div key={marker.id}>
              {/* Маркер */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${marker.position.x}%`, top: `${marker.position.y}%` }}
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg animate-pulse">
                    <MapPin className="w-5 h-5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  
                  {/* Попап */}
                  {activePopup === marker.id && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 p-4 transition-all duration-500 ease-in-out animate-fadeIn">
                      <h3 className="font-bold text-gray-900 text-sm">{marker.title}</h3>
                      <p className="text-gray-600 text-xs mt-1">{marker.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Панель управления */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>{isPlaying ? 'Пауза' : 'Запуск'}</span>
              </button>
              
              <div className="text-sm text-gray-600">
                Цикл #{animationCycle} • {isPlaying ? 'Идёт демо...' : 'На паузе'}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Train className="w-4 h-4" />
              <span>Транссибирская магистраль</span>
            </div>
          </div>
        </div>
      </div>

      {/* Информационная панель */}
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
          <h3 className="font-bold text-gray-900 text-sm">ГеоБлог.РФ</h3>
          <p className="text-xs text-gray-600">
            Путешествие по России: от Москвы до Владивостока по Транссибирской магистрали
          </p>
          <div className="text-xs text-gray-500 mt-1">
            Маршрут: {showRoute ? 'Показан' : 'Скрыт'} | Поезд: {showTrain ? 'Движется' : 'Стоит'} | Попап: {activePopup || 'Нет'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealRussiaMapDemo;
