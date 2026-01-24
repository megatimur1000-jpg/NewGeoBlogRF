import { createContext, useContext, useState, ReactNode } from 'react';
import { RouteBuilderState, RouteOptimizationOptions, EnhancedRouteData } from '../types/route';

export interface RoutePoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
}

interface RoutePlannerContextType {
  // Базовые функции
  routePoints: RoutePoint[];
  setRoutePoints: (points: RoutePoint[]) => void;
  clearRoutePoints: () => void;
  addRoutePoint: (point: RoutePoint) => void;
  removeRoutePoint: (id: string) => void;
  
  // Улучшенные функции построения маршрута
  routeBuilderState: RouteBuilderState;
  setRouteBuilderState: (state: RouteBuilderState) => void;
  
  // Функции для работы с маршрутом
  startRouteBuilding: () => void;
  stopRouteBuilding: () => void;
  addPointToRoute: (point: RoutePoint) => void;
  removePointFromRoute: (pointId: string) => void;
  reorderRoutePoints: (newOrder: string[]) => void;
  optimizeRoute: (options: RouteOptimizationOptions) => Promise<void>;
  
  // Функции для сохранения маршрута
  saveRoute: (routeData: Partial<EnhancedRouteData>) => Promise<EnhancedRouteData>;
  updateRoute: (routeId: string, updates: Partial<EnhancedRouteData>) => Promise<EnhancedRouteData>;
  deleteRoute: (routeId: string) => Promise<void>;
  
  // Состояние текущего маршрута
  currentRoute: EnhancedRouteData | null;
  setCurrentRoute: (route: EnhancedRouteData | null) => void;
}

const RoutePlannerContext = createContext<RoutePlannerContextType | undefined>(undefined);

export const RoutePlannerProvider = ({ children }: { children: ReactNode }) => {
  const [routePoints, setRoutePointsState] = useState<RoutePoint[]>([]);
  const [currentRoute, setCurrentRoute] = useState<EnhancedRouteData | null>(null);
  
  // Состояние построения маршрута
  const [routeBuilderState, setRouteBuilderState] = useState<RouteBuilderState>({
    selectedPoints: [],
    routeOrder: [],
    isBuilding: false,
    currentStep: 'select'
  });

  // Базовые функции
  const setRoutePoints = (points: RoutePoint[]) => setRoutePointsState(points);
  const clearRoutePoints = () => setRoutePointsState([]);
  const addRoutePoint = (point: RoutePoint) => setRoutePointsState(prev => [...prev, point]);
  const removeRoutePoint = (id: string) => setRoutePointsState(prev => prev.filter(p => p.id !== id));

  // Функции построения маршрута
  const startRouteBuilding = () => {
    setRouteBuilderState(prev => ({
      ...prev,
      isBuilding: true,
      currentStep: 'select',
      selectedPoints: [],
      routeOrder: []
    }));
  };

  const stopRouteBuilding = () => {
    setRouteBuilderState(prev => ({
      ...prev,
      isBuilding: false,
      currentStep: 'select',
      selectedPoints: [],
      routeOrder: []
    }));
  };

  const addPointToRoute = (point: RoutePoint) => {
    setRouteBuilderState(prev => ({
      ...prev,
      selectedPoints: [...prev.selectedPoints, point],
      routeOrder: [...prev.routeOrder, point.id]
    }));
  };

  const removePointFromRoute = (pointId: string) => {
    setRouteBuilderState(prev => ({
      ...prev,
      selectedPoints: prev.selectedPoints.filter(p => p.id !== pointId),
      routeOrder: prev.routeOrder.filter(id => id !== pointId)
    }));
  };

  const reorderRoutePoints = (newOrder: string[]) => {
    setRouteBuilderState(prev => ({
      ...prev,
      routeOrder: newOrder,
      selectedPoints: newOrder.map(id => 
        prev.selectedPoints.find(p => p.id === id)!
      ).filter(Boolean)
    }));
  };

  const optimizeRoute = async (options: RouteOptimizationOptions): Promise<void> => {
    // Здесь будет логика оптимизации маршрута
    // Пока заглушка
    };

  // Функции сохранения маршрута
  const saveRoute = async (routeData: Partial<EnhancedRouteData>): Promise<EnhancedRouteData> => {
    // Здесь будет API вызов для сохранения
    // Пока заглушка
    const newRoute: EnhancedRouteData = {
      id: `route_${Date.now()}`,
      title: routeData.title || 'Новый маршрут',
      description: routeData.description || '',
      points: routeData.points || [],
      waypoints: routeData.waypoints || [],
      routePolyline: routeData.routePolyline || [],
      metadata: routeData.metadata || {
        totalDistance: 0,
        estimatedDuration: 0,
        estimatedCost: 0,
        difficultyLevel: 1,
        transportType: [],
        tags: []
      },
      settings: routeData.settings || {
        isPublic: true
      },
      stats: {
        likesCount: 0,
        viewsCount: 0,
        sharesCount: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCurrentRoute(newRoute);
    return newRoute;
  };

  const updateRoute = async (routeId: string, updates: Partial<EnhancedRouteData>): Promise<EnhancedRouteData> => {
    // Здесь будет API вызов для обновления
    // Пока заглушка
    if (currentRoute && currentRoute.id === routeId) {
      const updatedRoute = { ...currentRoute, ...updates, updatedAt: new Date().toISOString() };
      setCurrentRoute(updatedRoute);
      return updatedRoute;
    }
    throw new Error('Route not found');
  };

  const deleteRoute = async (routeId: string): Promise<void> => {
    // Здесь будет API вызов для удаления
    // Пока заглушка
    if (currentRoute && currentRoute.id === routeId) {
      setCurrentRoute(null);
    }
  };

  return (
    <RoutePlannerContext.Provider value={{ 
      routePoints, 
      setRoutePoints, 
      clearRoutePoints, 
      addRoutePoint, 
      removeRoutePoint,
      routeBuilderState,
      setRouteBuilderState,
      startRouteBuilding,
      stopRouteBuilding,
      addPointToRoute,
      removePointFromRoute,
      reorderRoutePoints,
      optimizeRoute,
      saveRoute,
      updateRoute,
      deleteRoute,
      currentRoute,
      setCurrentRoute
    }}>
      {children}
    </RoutePlannerContext.Provider>
  );
};

export const useRoutePlanner = () => {
  const ctx = useContext(RoutePlannerContext);
  if (!ctx) {
    // Возвращаем заглушку вместо undefined для предотвращения блокировки рендеринга
    return {
      routePoints: [],
      setRoutePoints: () => {},
      clearRoutePoints: () => {},
      addRoutePoint: () => {},
      removeRoutePoint: () => {},
      routeBuilderState: { 
        selectedPoints: [], 
        isBuilding: false, 
        isOptimizing: false,
        currentStep: 'select',
        routeOrder: []
      },
      setRouteBuilderState: () => {},
      startRouteBuilding: () => {},
      stopRouteBuilding: () => {},
      addPointToRoute: () => {},
      removePointFromRoute: () => {},
      reorderRoutePoints: () => {},
      optimizeRoute: async () => {},
      saveRoute: async () => ({} as EnhancedRouteData),
      updateRoute: async () => ({} as EnhancedRouteData),
      deleteRoute: async () => {},
      currentRoute: null,
      setCurrentRoute: () => {},
    };
  }
  return ctx;
}; 