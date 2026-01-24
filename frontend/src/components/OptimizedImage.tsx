import React from 'react';
import useLazyImage from '../hooks/useLazyImage';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean; // Для критически важных изображений
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  placeholder,
  fallback,
  onLoad,
  onError,
  priority = false
}) => {
  const {
    imageSrc,
    isLoading,
    hasError,
    imgRef,
    retry
  } = useLazyImage(src, {
    threshold: priority ? 0 : 0.1,
    rootMargin: priority ? '0px' : '50px',
    placeholder,
    fallback
  });

  const handleLoad = () => {
    if (onLoad) onLoad();
  };

  const handleError = () => {
    if (onError) onError();
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: width || 'auto',
    height: height || 'auto',
    overflow: 'hidden',
    ...style
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoading ? 0.6 : 1
  };

  return (
    <div style={containerStyle} className={`optimized-image ${className}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        style={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Error state with retry button */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-100 bg-opacity-50">
          <div className="text-red-600 text-sm mb-2">Ошибка загрузки</div>
          <button
            onClick={retry}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
          >
            Повторить
          </button>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;

