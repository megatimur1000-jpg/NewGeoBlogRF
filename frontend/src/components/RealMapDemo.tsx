import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Play, Train } from 'lucide-react';

interface Marker {
  id: string;
  position: { x: number; y: number };
  title: string;
  description: string;
  delay: number;
}

const RealMapDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [trainPosition, setTrainPosition] = useState({ x: 0, y: 0 });
  const [showRoute, setShowRoute] = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const markers: Marker[] = [
    {
      id: 'moscow',
      position: { x: 15, y: 35 },
      title: 'Москва',
      description: 'Столица России',
      delay: 2000
    },
    {
      id: 'chelyabinsk',
      position: { x: 45, y: 30 },
      title: 'Челябинск',
      description: 'Уральский регион',
      delay: 6000
    },
    {
      id: 'vladivostok',
      position: { x: 85, y: 25 },
      title: 'Владивосток',
      description: 'Дальний Восток',
      delay: 12000
    }
  ];

  const routePoints = [
    { x: 15, y: 35 }, // Москва
    { x: 25, y: 32 }, // Пермь
    { x: 35, y: 30 }, // Екатеринбург
    { x: 45, y: 30 }, // Челябинск
    { x: 55, y: 28 }, // Омск
    { x: 65, y: 26 }, // Новосибирск
    { x: 75, y: 25 }, // Красноярск
    { x: 85, y: 25 }  // Владивосток
  ];

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
      setAnimationCycle(prev => prev + 1);

      // Появление Москвы
      setTimeout(() => setCurrentStep(1), 1000);
      
      // Появление маршрута
      setTimeout(() => setShowRoute(true), 2000);
      
      // Анимация поезда
      setTimeout(() => animateTrain(), 3000);
      
      // Появление Челябинска
      setTimeout(() => setCurrentStep(2), 8000);
      
      // Появление Владивостока
      setTimeout(() => setCurrentStep(3), 15000);
      
      // Перезапуск через 20 секунд
      setTimeout(() => {
        if (isPlaying) {
          animateCycle();
        }
      }, 20000);
    };

    animateCycle();
  };

  const animateTrain = () => {
    let progress = 0;
    const animate = () => {
      progress += 0.01;
      if (progress <= 1) {
        const pointIndex = Math.floor(progress * (routePoints.length - 1));
        const nextPointIndex = Math.min(pointIndex + 1, routePoints.length - 1);
        const localProgress = (progress * (routePoints.length - 1)) % 1;
        
        const currentPoint = routePoints[pointIndex];
        const nextPoint = routePoints[nextPointIndex];
        
        const x = currentPoint.x + (nextPoint.x - currentPoint.x) * localProgress;
        const y = currentPoint.y + (nextPoint.y - currentPoint.y) * localProgress;
        
        setTrainPosition({ x, y });
        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const getRoutePath = () => {
    if (!showRoute) return '';
    return routePoints.map((point, index) => {
      return `${index === 0 ? 'M' : 'L'} ${point.x}% ${point.y}%`;
    }).join(' ');
  };

  const shouldShowMarker = (marker: Marker) => {
    const markerIndex = markers.indexOf(marker);
    return currentStep >= markerIndex + 1;
  };

  return (
    <div className="relative w-full h-[500px] bg-white rounded-xl overflow-hidden border border-gray-200 shadow-lg">
      {/* Карта России с реальными очертаниями */}
      <div 
        ref={mapRef}
        className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50"
      >
        {/* Реальные очертания России (SVG) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
          <path
            d="M 50 200 
               L 80 180 L 120 190 L 160 185 L 200 195 L 240 190 L 280 200 L 320 195 L 360 205 L 400 200 L 440 210 L 480 205 L 520 215 L 560 210 L 600 220 L 640 215 L 680 225 L 720 220 L 760 230 L 800 225 L 840 235 L 880 230 L 920 240 L 960 235 L 980 245
               L 980 280 L 960 290 L 940 285 L 920 295 L 900 290 L 880 300 L 860 295 L 840 305 L 820 300 L 800 310 L 780 305 L 760 315 L 740 310 L 720 320 L 700 315 L 680 325 L 660 320 L 640 330 L 620 325 L 600 335 L 580 330 L 560 340 L 540 335 L 520 345 L 500 340 L 480 350 L 460 345 L 440 355 L 420 350 L 400 360 L 380 355 L 360 365 L 340 360 L 320 370 L 300 365 L 280 375 L 260 370 L 240 380 L 220 375 L 200 385 L 180 380 L 160 390 L 140 385 L 120 395 L 100 390 L 80 400 L 60 395 L 40 405 L 20 400 L 0 410
               L 0 380 L 20 370 L 40 375 L 60 365 L 80 370 L 100 360 L 120 365 L 140 355 L 160 360 L 180 350 L 200 355 L 220 345 L 240 350 L 260 340 L 280 345 L 300 335 L 320 340 L 340 330 L 360 335 L 380 325 L 400 330 L 420 320 L 440 325 L 460 315 L 480 320 L 500 310 L 520 315 L 540 305 L 560 310 L 580 300 L 600 305 L 620 295 L 640 300 L 660 290 L 680 295 L 700 285 L 720 290 L 740 280 L 760 285 L 780 275 L 800 280 L 820 270 L 840 275 L 860 265 L 880 270 L 900 260 L 920 265 L 940 255 L 960 260 L 980 250
               L 980 200 L 960 190 L 940 195 L 920 185 L 900 190 L 880 180 L 860 185 L 840 175 L 820 180 L 800 170 L 780 175 L 760 165 L 740 170 L 720 160 L 700 165 L 680 155 L 660 160 L 640 150 L 620 155 L 600 145 L 580 150 L 560 140 L 540 145 L 520 135 L 500 140 L 480 130 L 460 135 L 440 125 L 420 130 L 400 120 L 380 125 L 360 115 L 340 120 L 320 110 L 300 115 L 280 105 L 260 110 L 240 100 L 220 105 L 200 95 L 180 100 L 160 90 L 140 95 L 120 85 L 100 90 L 80 80 L 60 85 L 40 75 L 20 80 L 0 70
               Z"
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="2"
          />
          
          {/* Внутренние границы регионов */}
          <path
            d="M 200 200 L 200 300 L 400 300 L 400 200 Z"
            fill="none"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="1"
          />
          <path
            d="M 400 200 L 400 300 L 600 300 L 600 200 Z"
            fill="none"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="1"
          />
          <path
            d="M 600 200 L 600 300 L 800 300 L 800 200 Z"
            fill="none"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="1"
          />
        </svg>

        {/* Маршрут */}
        {showRoute && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
            <path
              d={getRoutePath()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="8,4"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Поезд */}
        {currentStep >= 1 && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ 
              left: `${trainPosition.x}%`, 
              top: `${trainPosition.y}%`,
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
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 p-4 animate-fadeIn">
                    <h3 className="font-bold text-gray-900 text-sm">{marker.title}</h3>
                    <p className="text-gray-600 text-xs mt-1">{marker.description}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors">
                        <Navigation className="w-3 h-3 inline mr-1" />
                        Маршрут
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors">
                        Сохранить
                      </button>
                    </div>
                  </div>
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
        </div>
      </div>
    </div>
  );
};

export default RealMapDemo;
