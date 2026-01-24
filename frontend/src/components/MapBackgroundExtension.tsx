import React from 'react';
import { useContentStore } from '../stores/contentStore';

/**
 * Компонент для отображения статичного картографического фона на постах/активности
 * Показывает красивый картографический паттерн, подходящий под стиль карт
 */
const MapBackgroundExtension: React.FC = () => {
  const leftContent = useContentStore((state) => state.leftContent);
  const isMapOpen = leftContent === 'map' || leftContent === 'planner';

  return (
    <div
      className="map-background-extension"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: isMapOpen ? 0.4 : 0.6, // Более прозрачный когда карта открыта
      }}
    >
      {/* Статичный картографический фон */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Паттерн картографической сетки */}
          <pattern
            id="mapGrid"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* Горизонтальные линии (параллели) */}
            <line
              x1="0"
              y1="0"
              x2="60"
              y2="0"
              stroke="rgba(76, 201, 240, 0.2)"
              strokeWidth="0.5"
            />
            <line
              x1="0"
              y1="30"
              x2="60"
              y2="30"
              stroke="rgba(76, 201, 240, 0.15)"
              strokeWidth="0.3"
            />
            <line
              x1="0"
              y1="60"
              x2="60"
              y2="60"
              stroke="rgba(76, 201, 240, 0.2)"
              strokeWidth="0.5"
            />
            {/* Вертикальные линии (меридианы) */}
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="60"
              stroke="rgba(76, 201, 240, 0.2)"
              strokeWidth="0.5"
            />
            <line
              x1="30"
              y1="0"
              x2="30"
              y2="60"
              stroke="rgba(76, 201, 240, 0.15)"
              strokeWidth="0.3"
            />
            <line
              x1="60"
              y1="0"
              x2="60"
              y2="60"
              stroke="rgba(76, 201, 240, 0.2)"
              strokeWidth="0.5"
            />
            {/* Точки на пересечениях */}
            <circle cx="0" cy="0" r="1.5" fill="rgba(76, 201, 240, 0.3)" />
            <circle cx="30" cy="0" r="1" fill="rgba(76, 201, 240, 0.25)" />
            <circle cx="60" cy="0" r="1.5" fill="rgba(76, 201, 240, 0.3)" />
            <circle cx="0" cy="30" r="1" fill="rgba(76, 201, 240, 0.25)" />
            <circle cx="30" cy="30" r="1.5" fill="rgba(76, 201, 240, 0.3)" />
            <circle cx="60" cy="30" r="1" fill="rgba(76, 201, 240, 0.25)" />
            <circle cx="0" cy="60" r="1.5" fill="rgba(76, 201, 240, 0.3)" />
            <circle cx="30" cy="60" r="1" fill="rgba(76, 201, 240, 0.25)" />
            <circle cx="60" cy="60" r="1.5" fill="rgba(76, 201, 240, 0.3)" />
          </pattern>

          {/* Паттерн для дополнительных деталей карты */}
          <pattern
            id="mapDetails"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/* Крупные линии координатной сетки */}
            <line
              x1="0"
              y1="0"
              x2="120"
              y2="0"
              stroke="rgba(76, 201, 240, 0.12)"
              strokeWidth="0.8"
            />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="120"
              stroke="rgba(76, 201, 240, 0.12)"
              strokeWidth="0.8"
            />
            {/* Контурные линии (имитация рельефа) */}
            <path
              d="M 20 40 Q 40 30, 60 40 T 100 40"
              fill="none"
              stroke="rgba(76, 201, 240, 0.08)"
              strokeWidth="0.5"
            />
            <path
              d="M 40 20 Q 60 10, 80 20 T 120 20"
              fill="none"
              stroke="rgba(76, 201, 240, 0.08)"
              strokeWidth="0.5"
            />
            <path
              d="M 10 80 Q 30 70, 50 80 T 90 80"
              fill="none"
              stroke="rgba(76, 201, 240, 0.08)"
              strokeWidth="0.5"
            />
          </pattern>

          {/* Градиент для фона */}
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(240, 248, 255, 0.95)" stopOpacity="1" />
            <stop offset="50%" stopColor="rgba(230, 240, 250, 0.9)" stopOpacity="1" />
            <stop offset="100%" stopColor="rgba(220, 235, 245, 0.85)" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Основной фон с градиентом */}
        <rect width="100%" height="100%" fill="url(#mapGradient)" />

        {/* Картографическая сетка */}
        <rect width="100%" height="100%" fill="url(#mapGrid)" />

        {/* Дополнительные детали карты */}
        <rect width="100%" height="100%" fill="url(#mapDetails)" />
      </svg>
    </div>
  );
};

export default MapBackgroundExtension;
