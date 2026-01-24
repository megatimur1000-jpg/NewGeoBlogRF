import { useEffect, useState, useRef } from 'react';

export type AnimationType = 'scale' | 'slide' | 'fade' | 'slideScale';

export interface UseGlassAnimationOptions {
  isOpen: boolean;
  animationType?: AnimationType;
  duration?: number;
  delay?: number;
}

export interface GlassAnimationStyles {
  style: React.CSSProperties;
  className: string;
}

/**
 * Хук для управления анимациями glassmorphism компонентов
 */
export const useGlassAnimation = ({
  isOpen,
  animationType = 'slideScale',
  duration = 400,
  delay = 0,
}: UseGlassAnimationOptions): GlassAnimationStyles => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(isOpen);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Небольшая задержка для запуска анимации
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      // Ждем окончания анимации перед скрытием
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [isOpen, duration]);

  const getAnimationStyles = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      transitionDelay: `${delay}ms`,
    };

    if (!isVisible) {
      return {
        ...baseStyle,
        opacity: 0,
        pointerEvents: 'none' as const,
      };
    }

    switch (animationType) {
      case 'scale':
        return {
          ...baseStyle,
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
        };

      case 'slide':
        return {
          ...baseStyle,
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating ? 'translateX(0)' : 'translateX(20px)',
        };

      case 'fade':
        return {
          ...baseStyle,
          opacity: isAnimating ? 1 : 0,
        };

      case 'slideScale':
      default:
        return {
          ...baseStyle,
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating 
            ? 'translateX(0) scale(1)' 
            : 'translateX(20px) scale(0.95)',
        };
    }
  };

  const className = `glass-animation glass-animation-${animationType} ${isAnimating ? 'glass-animation-active' : ''}`;

  return {
    style: getAnimationStyles(),
    className,
  };
};

export default useGlassAnimation;

