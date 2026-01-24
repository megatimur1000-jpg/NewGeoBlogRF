// Утилиты для определения визуальных состояний элементов

export interface VisualStateProps {
  isFavorite?: boolean;
  isUserModified?: boolean;
  usedInBlogs?: boolean;
}

/**
 * Определяет CSS классы для визуальных состояний маркера
 */
export const getMarkerVisualClasses = (marker: VisualStateProps): string => {
  const classes: string[] = [];
  
  // Приоритет: золотистая > неоновая > горящая
  if (marker.usedInBlogs) {
    classes.push('marker-used-in-blogs');
  } else if (marker.isUserModified) {
    classes.push('marker-user-modified');
  } else if (marker.isFavorite) {
    classes.push('marker-favorite');
  }
  
  return classes.join(' ');
};

/**
 * Определяет CSS классы для визуальных состояний маршрута
 */
export const getRouteVisualClasses = (route: VisualStateProps): string => {
  const classes: string[] = [];
  
  // Приоритет: золотистая > неоновая > горящая
  if (route.usedInBlogs) {
    classes.push('route-used-in-blogs');
  } else if (route.isUserModified) {
    classes.push('route-user-modified');
  } else if (route.isFavorite) {
    classes.push('route-favorite');
  }
  
  return classes.join(' ');
};

/**
 * Определяет CSS классы для визуальных состояний события
 */
export const getEventVisualClasses = (event: VisualStateProps): string => {
  const classes: string[] = [];
  
  // Приоритет: золотистая > неоновая > горящая
  if (event.usedInBlogs) {
    classes.push('event-used-in-blogs');
  } else if (event.isUserModified) {
    classes.push('event-user-modified');
  } else if (event.isFavorite) {
    classes.push('event-favorite');
  }
  
  return classes.join(' ');
};

/**
 * Универсальная функция для определения визуальных состояний
 */
export const getVisualClasses = (
  type: 'marker' | 'route' | 'event',
  props: VisualStateProps
): string => {
  switch (type) {
    case 'marker':
      return getMarkerVisualClasses(props);
    case 'route':
      return getRouteVisualClasses(props);
    case 'event':
      return getEventVisualClasses(props);
    default:
      return '';
  }
};

/**
 * Проверяет, есть ли у элемента визуальные состояния
 */
export const hasVisualStates = (props: VisualStateProps): boolean => {
  return !!(props.isFavorite || props.isUserModified || props.usedInBlogs);
};

/**
 * Получает описание визуального состояния для UI
 */
export const getVisualStateDescription = (props: VisualStateProps): string => {
  if (props.usedInBlogs) {
    return 'Используется в блогах';
  } else if (props.isUserModified) {
    return 'Изменено пользователем';
  } else if (props.isFavorite) {
    return 'В избранном';
  }
  return '';
};






