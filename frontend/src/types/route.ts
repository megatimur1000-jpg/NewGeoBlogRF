// Основной интерфейс маршрута
export interface Route {
  id: string;
  title: string;
  description?: string;
  points: RoutePoint[];
  waypoints?: Array<{
    marker_id: string;
    order_index: number;
    arrival_time?: string;
    departure_time?: string;
    duration_minutes?: number;
    notes?: string;
    is_overnight?: boolean;
  }>;
  createdAt?: string;
  updatedAt?: string;
  totalDistance?: number;
  estimatedDuration?: number;
  isPublic?: boolean;
  category?: string;
  tags?: string[];
  difficulty?: string;
  rating?: number;
  
  // Новые поля для визуальных состояний:
  is_user_modified?: boolean; // Пользователь изменил (неоновый эффект)
  used_in_blogs?: boolean; // Используется в блогах (золотистая рамка)
}

// Определяем RoutePoint локально, так как он не экспортируется из контекста
export interface RoutePoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
}

export interface RouteData {
  id: string;
  title: string;
  description?: string;
  points: RoutePoint[];
  tags?: string[];
  waypoints?: Array<{
    marker_id: string;
    order_index: number;
    arrival_time?: string;
    departure_time?: string;
    duration_minutes?: number;
    notes?: string;
    is_overnight?: boolean;
  }>;
  createdAt?: string;
  updatedAt?: string;
  
  // Новые поля для визуальных состояний:
  is_user_modified?: boolean; // Пользователь изменил (неоновый эффект)
  used_in_blogs?: boolean; // Используется в блогах (золотистая рамка)
}

// Расширенные типы для улучшенной системы маршрутов
export interface WaypointData {
  id: string;
  markerId: string;
  orderIndex: number;
  arrivalTime?: string;
  departureTime?: string;
  durationMinutes?: number;
  notes?: string;
  isOvernight?: boolean;
}

export interface RouteMetadata {
  totalDistance: number;
  estimatedDuration: number;
  estimatedCost: number;
  difficultyLevel: number;
  transportType: string[];
  tags: string[];
}

export interface RouteSettings {
  isPublic: boolean;
  startDate?: string;
  endDate?: string;
}

export interface RouteStats {
  likesCount: number;
  viewsCount: number;
  sharesCount: number;
}

export interface EnhancedRouteData {
  id: string;
  title: string;
  description?: string;
  points: RoutePoint[];
  waypoints: WaypointData[];
  routePolyline?: [number, number][];
  metadata: RouteMetadata;
  settings: RouteSettings;
  stats: RouteStats;
  createdAt: string;
  updatedAt: string;
}

// Типы для создания маршрута
export interface CreateRouteRequest {
  title: string;
  description?: string;
  points: RoutePoint[];
  waypoints: WaypointData[];
  metadata: Partial<RouteMetadata>;
  settings: Partial<RouteSettings>;
}

// Типы для обновления маршрута
export interface UpdateRouteRequest {
  title?: string;
  description?: string;
  points?: RoutePoint[];
  waypoints?: WaypointData[];
  metadata?: Partial<RouteMetadata>;
  settings?: Partial<RouteSettings>;
}

// Типы для построения маршрута
export interface RouteBuilderState {
  selectedPoints: RoutePoint[];
  routeOrder: string[]; // ID точек в порядке маршрута
  isBuilding: boolean;
  currentStep: 'select' | 'order' | 'settings' | 'preview' | 'save';
}

// Типы для оптимизации маршрута
export interface RouteOptimizationOptions {
  algorithm: 'nearest' | 'fastest' | 'scenic' | 'custom';
  transportType: string;
  avoidHighways?: boolean;
  avoidTolls?: boolean;
  maxDistance?: number;
}
