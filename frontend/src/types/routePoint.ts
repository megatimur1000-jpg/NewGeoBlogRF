// Единая система управления точками маршрута
export interface UnifiedRoutePoint {
  id: string;
  coordinates: [number, number]; // [широта, долгота] для отображения на карте
  title: string;
  description?: string;
  source: 'favorites' | 'map-click' | 'search' | 'imported';
  sourceId?: string; // ID в оригинальном источнике
  orderIndex?: number; // Порядок в маршруте
  metadata?: {
    category?: string;
    rating?: number;
    photoUrls?: string[];
    hashtags?: string[];
    address?: string;
    isVerified?: boolean;
    creatorId?: string;
    authorName?: string;
    createdAt?: string;
    updatedAt?: string;
    likesCount?: number;
    commentsCount?: number;
    sharesCount?: number;
  };
}

// Состояние построения маршрута
export interface RouteBuildingState {
  points: UnifiedRoutePoint[];
  routeOrder: string[]; // ID точек в порядке маршрута
  isBuilding: boolean;
  currentStep: 'select' | 'order' | 'settings' | 'preview' | 'save';
  selectedSource: 'favorites' | 'map-click' | 'search' | 'mixed' | null;
}

// Источник точек для маршрута
export interface RoutePointSource {
  type: 'favorites' | 'map-click' | 'search' | 'imported';
  points: UnifiedRoutePoint[];
  count: number;
  isActive: boolean;
}

// Статистика по источникам точек
export interface RoutePointStats {
  totalPoints: number;
  sources: RoutePointSource[];
  canBuildRoute: boolean;
  estimatedDistance?: number;
  estimatedDuration?: number;
}

// Опции для построения маршрута
export interface RouteBuildingOptions {
  transportType: 'driving-car' | 'foot-walking' | 'cycling-regular';
  optimization: 'fastest' | 'shortest' | 'balanced';
  avoidHighways: boolean;
  avoidTolls: boolean;
  showAlternatives: boolean;
  maxDistance?: number;
  maxDuration?: number;
}

// Результат построения маршрута
export interface RouteBuildingResult {
  success: boolean;
  polyline?: [number, number][];
  distance?: number;
  duration?: number;
  points: UnifiedRoutePoint[];
  error?: string;
  warnings?: string[];
}































