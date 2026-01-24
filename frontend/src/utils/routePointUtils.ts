import { UnifiedRoutePoint, RoutePointSource, RoutePointStats } from '../types/routePoint';
import { MarkerData } from '../types/marker';

// Преобразование метки из избранного в UnifiedRoutePoint
export const convertFavoriteToRoutePoint = (marker: MarkerData): UnifiedRoutePoint => {
  return {
    id: `favorite-${marker.id}`,
    coordinates: [Number(marker.latitude), Number(marker.longitude)],
    title: marker.title,
    description: marker.description,
    source: 'favorites',
    sourceId: marker.id,
    metadata: {
      category: marker.category,
      rating: marker.rating,
      photoUrls: marker.photo_urls,
      hashtags: marker.hashtags,
      address: marker.address,
      isVerified: marker.is_verified,
      creatorId: marker.creator_id,
      authorName: marker.author_name,
      createdAt: marker.created_at,
      updatedAt: marker.updated_at,
      likesCount: marker.likes_count,
      commentsCount: marker.comments_count,
      sharesCount: marker.shares_count,
    },
  };
};

// Преобразование клик-метки в UnifiedRoutePoint
export const convertClickMarkerToRoutePoint = (marker: {
  id: string;
  coordinates: [number, number];
  title: string;
  description?: string;
}): UnifiedRoutePoint => {
  return {
    id: `click-${marker.id}`,
    coordinates: marker.coordinates,
    title: marker.title,
    description: marker.description || 'Добавлено кликом по карте',
    source: 'map-click',
    sourceId: marker.id,
  };
};

// Преобразование точки из поиска в UnifiedRoutePoint
export const convertSearchPointToRoutePoint = (point: {
  id: string;
  address: string;
  coordinates?: [number, number];
}): UnifiedRoutePoint | null => {
  if (!point.coordinates || !Array.isArray(point.coordinates) || point.coordinates.length !== 2) {
    return null;
  }
  
  return {
    id: `search-${point.id}`,
    coordinates: [point.coordinates[1], point.coordinates[0]], // [широта, долгота]
    title: point.address,
    description: 'Добавлено через поиск',
    source: 'search',
    sourceId: point.id,
  };
};

// Объединение точек из разных источников
export const mergeRoutePoints = (
  favorites: MarkerData[],
  clickMarkers: Array<{ id: string; coordinates: [number, number]; title: string; description?: string }>,
  searchPoints: Array<{ id: string; address: string; coordinates?: [number, number] }>,
  selectedIds: string[]
): UnifiedRoutePoint[] => {
  const allPoints: UnifiedRoutePoint[] = [];
  
  // Добавляем выбранные метки из избранного
  favorites
    .filter(fav => selectedIds.includes(fav.id))
    .forEach(marker => {
      allPoints.push(convertFavoriteToRoutePoint(marker));
    });
  
  // Добавляем выбранные клик-метки
  clickMarkers
    .filter(click => selectedIds.includes(click.id))
    .forEach(marker => {
      allPoints.push(convertClickMarkerToRoutePoint(marker));
    });
  
  // Добавляем точки из поиска
  searchPoints
    .filter(search => search.address.trim() && search.coordinates)
    .forEach(point => {
      const converted = convertSearchPointToRoutePoint(point);
      if (converted) {
        allPoints.push(converted);
      }
    });
  
  return allPoints;
};

// Получение статистики по точкам маршрута
export const getRoutePointStats = (points: UnifiedRoutePoint[]): RoutePointStats => {
  const sources = new Map<string, RoutePointSource>();
  
  // Группируем точки по источникам
  points.forEach(point => {
    if (!sources.has(point.source)) {
      sources.set(point.source, {
        type: point.source,
        points: [],
        count: 0,
        isActive: true,
      });
    }
    
    const source = sources.get(point.source)!;
    source.points.push(point);
    source.count++;
  });
  
  return {
    totalPoints: points.length,
    sources: Array.from(sources.values()),
    canBuildRoute: points.length >= 2,
  };
};

// Сортировка точек по порядку в маршруте
export const sortPointsByOrder = (points: UnifiedRoutePoint[], order: string[]): UnifiedRoutePoint[] => {
  if (!order || order.length === 0) {
    return points;
  }
  
  const sortedPoints: UnifiedRoutePoint[] = [];
  const remainingPoints = [...points];
  
  // Сортируем по указанному порядку
  order.forEach(id => {
    const pointIndex = remainingPoints.findIndex(p => p.id === id);
    if (pointIndex !== -1) {
      const point = remainingPoints.splice(pointIndex, 1)[0];
      point.orderIndex = sortedPoints.length;
      sortedPoints.push(point);
    }
  });
  
  // Добавляем оставшиеся точки
  remainingPoints.forEach((point, index) => {
    point.orderIndex = sortedPoints.length + index;
    sortedPoints.push(point);
  });
  
  return sortedPoints;
};

// Валидация координат для ORS API
export const validateCoordinatesForORS = (points: UnifiedRoutePoint[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  points.forEach((point, index) => {
    const [lat, lon] = point.coordinates;
    
    if (isNaN(lat) || isNaN(lon)) {
      errors.push(`Точка ${index + 1} (${point.title}): некорректные координаты [${lat}, ${lon}]`);
    }
    
    if (lat < -90 || lat > 90) {
      errors.push(`Точка ${index + 1} (${point.title}): широта ${lat} выходит за допустимые пределы (-90 до 90)`);
    }
    
    if (lon < -180 || lon > 180) {
      errors.push(`Точка ${index + 1} (${point.title}): долгота ${lon} выходит за допустимые пределы (-180 до 180)`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Преобразование координат для ORS API ([широта, долгота] -> [долгота, широта])
export const convertCoordinatesForORS = (points: UnifiedRoutePoint[]): [number, number][] => {
  return points.map(point => {
    const [lat, lon] = point.coordinates;
    return [lon, lat]; // ORS требует [долгота, широта]
  });
};

// Создание уникального ID для точки
export const createUniquePointId = (source: string, originalId: string): string => {
  return `${source}-${originalId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Проверка дублирования точек
export const findDuplicatePoints = (points: UnifiedRoutePoint[]): Array<{ point: UnifiedRoutePoint; duplicates: UnifiedRoutePoint[] }> => {
  const duplicates: Array<{ point: UnifiedRoutePoint; duplicates: UnifiedRoutePoint[] }> = [];
  const processed = new Set<string>();
  
  points.forEach(point => {
    if (processed.has(point.id)) return;
    
    const similarPoints = points.filter(p => 
      p.id !== point.id && 
      Math.abs(p.coordinates[0] - point.coordinates[0]) < 0.001 && 
      Math.abs(p.coordinates[1] - point.coordinates[1]) < 0.001
    );
    
    if (similarPoints.length > 0) {
      duplicates.push({
        point,
        duplicates: similarPoints,
      });
      processed.add(point.id);
      similarPoints.forEach(p => processed.add(p.id));
    }
  });
  
  return duplicates;
};































