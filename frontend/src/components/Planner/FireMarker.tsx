import React, { useState } from 'react';
import { FaStar, FaSearch, FaMousePointer, FaRoute } from 'react-icons/fa';

interface FireMarkerProps {
  source: 'favorites' | 'map-click' | 'search' | 'imported';
  title: string;
  description?: string;
  coordinates: [number, number];
  onClick?: () => void;
  className?: string;
}

const FireMarker: React.FC<FireMarkerProps> = ({
  source,
  title,
  description,
  coordinates,
  onClick,
  className = ''
}) => {
  const [showPopup, setShowPopup] = useState(false);

  const getSourceIcon = () => {
    switch (source) {
      case 'favorites':
        return <FaStar size={12} />;
      case 'search':
        return <FaSearch size={12} />;
      case 'map-click':
        return <FaMousePointer size={12} />;
      case 'imported':
        return <FaRoute size={12} />;
      default:
        return <FaRoute size={12} />;
    }
  };

  const getSourceLabel = () => {
    switch (source) {
      case 'favorites':
        return 'Избранное';
      case 'search':
        return 'Поиск';
      case 'map-click':
        return 'Клик по карте';
      case 'imported':
        return 'Импорт';
      default:
        return source;
    }
  };

  const handleMarkerClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowPopup(!showPopup);
    }
  };

  return (
    <div className="relative">
      {/* Горящая метка */}
      <div
        className={`fire-marker ${source} ${className}`}
        onClick={handleMarkerClick}
        title={`${title} (${getSourceLabel()})`}
      >
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
          {getSourceIcon()}
        </div>
      </div>

      {/* Мини-попап */}
      {showPopup && (
        <div className={`fire-popup ${source}`}>
          {/* Иконка источника */}
          <div className={`popup-source-icon ${source}`}></div>
          
          {/* Заголовок */}
          <div className="popup-header font-semibold text-sm mb-2 pb-2">
            {title}
          </div>
          
          {/* Описание */}
          {description && (
            <div className="text-xs text-gray-600 mb-2">
              {description}
            </div>
          )}
          
          {/* Координаты */}
          <div className="text-xs text-gray-500 mb-2">
            [{coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}]
          </div>
          
          {/* Источник */}
          <div className="text-xs text-gray-400 flex items-center gap-1">
            {getSourceIcon()}
            {getSourceLabel()}
          </div>
          
          {/* Кнопка закрытия */}
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default FireMarker;



