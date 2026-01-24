import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Play, Plane } from 'lucide-react';

interface Marker {
  id: string;
  position: { x: number; y: number };
  title: string;
  description: string;
  delay: number;
}

const SimpleMapDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [planePosition, setPlanePosition] = useState({ x: 0, y: 0 });
  const [showRoute, setShowRoute] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const markers: Marker[] = [
    {
      id: 'moscow',
      position: { x: 20, y: 30 },
      title: 'Москва',
      description: 'Столица России',
      delay: 2000
    },
    {
      id: 'chelyabinsk',
      position: { x: 50, y: 35 },
      title: 'Челябинск',
      description: 'Уральский регион',
      delay: 6000
    },
    {
      id: 'kamchatka',
      position: { x: 90, y: 20 },
      title: 'Камчатка',
      description: 'Дальний Восток',
      delay: 12000
    }
  ];

  const steps = [
    { action: 'start', delay: 0 },
    { action: 'marker', markerId: 'moscow', delay: 2000 },
    { action: 'route', delay: 4000 },
    { action: 'plane', delay: 6000 },
    { action: 'marker', markerId: 'chelyabinsk', delay: 8000 },
    { action: 'plane', delay: 10000 },
    { action: 'marker', markerId: 'kamchatka', delay: 12000 },
    { action: 'complete', delay: 15000 }
  ];

  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    }
  }, [isPlaying]);

  const startAnimation = () => {
    let stepIndex = 0;
    const executeStep = () => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        setTimeout(() => {
          setCurrentStep(stepIndex);
          
          switch (step.action) {
            case 'start':
              setShowRoute(false);
              setPlanePosition({ x: 0, y: 0 });
              break;
            case 'marker':
              // Метка уже отображается
              break;
            case 'route':
              setShowRoute(true);
              break;
            case 'plane':
              animatePlane(step.markerId as string);
              break;
            case 'complete':
              setIsPlaying(false);
              break;
          }
          
          stepIndex++;
          executeStep();
        }, step.delay);
      }
    };
    executeStep();
  };

  const animatePlane = (targetMarkerId: string) => {
    const targetMarker = markers.find(m => m.id === targetMarkerId);
    if (!targetMarker) return;

    const startMarker = markers[markers.findIndex(m => m.id === targetMarkerId) - 1];
    if (!startMarker) return;

    const startPos = startMarker.position;
    const endPos = targetMarker.position;
    
    let progress = 0;
    const animate = () => {
      progress += 0.02;
      if (progress <= 1) {
        const x = startPos.x + (endPos.x - startPos.x) * progress;
        const y = startPos.y + (endPos.y - startPos.y) * progress;
        setPlanePosition({ x, y });
        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const getRoutePath = () => {
    if (!showRoute) return '';
    return markers.map((marker, index) => {
      return `${index === 0 ? 'M' : 'L'} ${marker.position.x}% ${marker.position.y}%`;
    }).join(' ');
  };

  const handleStartDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setShowRoute(false);
    setPlanePosition({ x: 0, y: 0 });
  };

  const shouldShowMarker = (marker: Marker) => {
    const markerIndex = markers.indexOf(marker);
    return currentStep >= markerIndex + 1;
  };

  return (
    <div className="relative w-full h-[400px] bg-white rounded-xl overflow-hidden border border-gray-200 shadow-lg">
      {/* Упрощенная карта России */}
      <div 
        ref={mapRef}
        className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50"
      >
        {/* Контур России (упрощенный SVG) */}
        <svg className="absolute inset-0 w-full h-full">
          <path
            d="M 5 20 Q 15 10 25 15 Q 35 20 45 18 Q 55 16 65 20 Q 75 24 85 22 Q 90 20 95 25 L 95 35 Q 90 40 85 38 Q 80 36 75 40 Q 70 44 65 42 Q 60 40 55 44 Q 50 48 45 46 Q 40 44 35 48 Q 30 52 25 50 Q 20 48 15 52 Q 10 56 5 54 Z"
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgba(59, 130, 246, 0.4)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Маршрут */}
        {showRoute && (
          <svg className="absolute inset-0 w-full h-full">
            <path
              d={getRoutePath()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4,4"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Самолёт */}
        {currentStep >= 4 && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ 
              left: `${planePosition.x}%`, 
              top: `${planePosition.y}%`,
              transition: 'all 0.1s ease-out'
            }}
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Plane className="w-4 h-4 text-white" />
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
                  <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse">
                    <MapPin className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  
                  {/* Попап */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 p-3 animate-fadeIn">
                    <h3 className="font-bold text-gray-900 text-sm">{marker.title}</h3>
                    <p className="text-gray-600 text-xs mt-1">{marker.description}</p>
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
            <button
              onClick={handleStartDemo}
              disabled={isPlaying}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{isPlaying ? 'Демо запущено...' : 'Запустить демо'}</span>
            </button>
            
            <div className="text-sm text-gray-600">
              Шаг {currentStep + 1} из {steps.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleMapDemo;
