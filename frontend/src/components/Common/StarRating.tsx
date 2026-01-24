import React from 'react';
import { FaStar } from 'react-icons/fa';

interface StarRatingProps {
  rating: number; // Рейтинг от 0 до 5
  isInteractive?: boolean; // Можно ли ставить рейтинг
  onRatingChange?: (rating: number) => void; // Колбэк для изменения рейтинга
  showNumber?: boolean; // Показывать ли числовое значение
  size?: 'sm' | 'md' | 'lg'; // Размер звезд
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  isInteractive = false,
  onRatingChange,
  showNumber = true,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleStarClick = (starIndex: number) => {
    if (isInteractive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  const renderStar = (index: number) => {
    const starNumber = index + 1;
    const isFilled = starNumber <= Math.floor(rating);
    const isHalfFilled = starNumber === Math.ceil(rating) && rating % 1 !== 0;
    
    return (
      <div
        key={index}
        className={`relative flex-shrink-0 ${isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-200`}
        onClick={() => handleStarClick(index)}
        title={isInteractive ? `Поставить ${starNumber} звезд` : undefined}
      >
        {/* Фоновая звезда (серая) - всегда видна */}
        <FaStar 
          className={`${sizeClasses[size]} text-gray-300`}
        />
        
        {/* Заполненная звезда (желтая) - накладывается поверх */}
        <div 
          className="absolute top-0 left-0 overflow-hidden"
          style={{ 
            width: isFilled ? '100%' : isHalfFilled ? '50%' : '0%',
            transition: 'width 0.3s ease-in-out'
          }}
        >
          <FaStar 
            className={`${sizeClasses[size]} text-yellow-400`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {Array.from({ length: 5 }, (_, index) => renderStar(index))}
      </div>
      {showNumber && (
        <span className="text-sm text-gray-600 ml-1 flex-shrink-0">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default StarRating;
