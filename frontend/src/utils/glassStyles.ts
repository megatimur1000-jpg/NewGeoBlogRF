/**
 * Утилиты для glassmorphism стилей
 * Основано на стилях из MapActionButtons.css
 */

export const glassStyles = {
  // Фоны
  background: 'rgba(255, 255, 255, 0.1)',
  backgroundGradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  backgroundHover: 'rgba(255, 255, 255, 0.15)',
  backgroundActive: 'rgba(59, 130, 246, 0.3)',
  
  // Размытие
  backdropFilter: 'blur(10px) saturate(180%)',
  backdropFilterWebkit: '-webkit-backdrop-filter: blur(10px) saturate(180%)',
  
  // Границы
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderHover: '1px solid rgba(255, 255, 255, 0.3)',
  borderActive: '2px solid rgba(59, 130, 246, 0.6)',
  
  // Радиусы
  borderRadius: '20px',
  borderRadiusSmall: '12px',
  borderRadiusLarge: '24px',
  borderRadiusRound: '50%',
  
  // Тени
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  boxShadowHover: '0 6px 20px rgba(0, 0, 0, 0.2)',
  boxShadowActive: '0 4px 12px rgba(59, 130, 246, 0.3)',
  
  // Анимации
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionFast: 'all 0.2s ease',
  transitionSlow: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Цвета
  textColor: 'rgba(0, 0, 0, 0.8)',
  textColorLight: 'rgba(0, 0, 0, 0.6)',
  accentColor: 'rgba(59, 130, 246, 1)',
  dangerColor: 'rgba(239, 68, 68, 1)',
  successColor: 'rgba(34, 197, 94, 1)',
  
  // Темная тема
  dark: {
    background: 'rgba(0, 0, 0, 0.1)',
    backgroundGradient: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)',
    backgroundHover: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderHover: '1px solid rgba(255, 255, 255, 0.2)',
    textColor: 'rgba(255, 255, 255, 0.9)',
    textColorLight: 'rgba(255, 255, 255, 0.7)',
  },
  
  // Fallback для старых браузеров
  fallback: {
    background: 'rgba(255, 255, 255, 0.85)',
    darkBackground: 'rgba(0, 0, 0, 0.75)',
  },
} as const;

/**
 * Генерирует CSS стили для glassmorphism элемента
 */
export const getGlassStyles = (options?: {
  variant?: 'default' | 'hover' | 'active';
  dark?: boolean;
  borderRadius?: 'small' | 'medium' | 'large' | 'round';
}): React.CSSProperties => {
  const { variant = 'default', dark = false, borderRadius = 'medium' } = options || {};
  
  const theme = dark ? glassStyles.dark : glassStyles;
  const radiusMap = {
    small: glassStyles.borderRadiusSmall,
    medium: glassStyles.borderRadius,
    large: glassStyles.borderRadiusLarge,
    round: glassStyles.borderRadiusRound,
  };
  
  const background = variant === 'active' 
    ? glassStyles.backgroundActive 
    : variant === 'hover' 
    ? theme.backgroundHover 
    : dark 
    ? theme.backgroundGradient 
    : glassStyles.backgroundGradient;
  
  const border = variant === 'active'
    ? glassStyles.borderActive
    : variant === 'hover'
    ? theme.borderHover
    : theme.border;
  
  const boxShadow = variant === 'active'
    ? glassStyles.boxShadowActive
    : variant === 'hover'
    ? glassStyles.boxShadowHover
    : glassStyles.boxShadow;
  
  return {
    background,
    backdropFilter: glassStyles.backdropFilter,
    WebkitBackdropFilter: glassStyles.backdropFilter,
    border,
    borderRadius: radiusMap[borderRadius],
    boxShadow,
    transition: glassStyles.transition,
  } as React.CSSProperties;
};

/**
 * Проверяет поддержку backdrop-filter
 */
export const supportsBackdropFilter = (): boolean => {
  if (typeof window === 'undefined') return false;
  return CSS.supports('backdrop-filter', 'blur(10px)') || 
         CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
};

/**
 * Получает fallback стили для старых браузеров
 */
export const getFallbackStyles = (dark = false): React.CSSProperties => {
  return {
    background: dark 
      ? glassStyles.fallback.darkBackground 
      : glassStyles.fallback.background,
  };
};

