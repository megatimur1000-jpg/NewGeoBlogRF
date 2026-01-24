import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MirrorGradientContainer, usePanelRegistration } from '../components/MirrorGradientProvider';
import { FaStar, FaRoute, FaHeart, FaCog } from 'react-icons/fa';
import FivePointStar from '../components/Map/FivePointStar';
import LazyYandexMap from '../components/YandexMap/LazyYandexMap';
import { getAllZones, checkRoute } from '../services/zoneService';
import PlannerAccordion from '../components/Planner/PlannerAccordion';
import FavoritesPanel from '../components/FavoritesPanel';
import RouteRebuildModal from '../components/Planner/RouteRebuildModal';
// import RouteOrderPanel from '../components/Planner/RouteOrderPanel'; // Убрано - функциональность перенесена в настройки
import RouteCategoryModal, { RouteCreationData } from '../components/Planner/RouteCategoryModal';
import RouteCategorySelector from '../components/Planner/RouteCategorySelector';
import CoordinateInput from '../components/Planner/CoordinateInput';

import { MarkerData } from '../types/marker';
import { RouteData } from '../types/route';
import { getRoutePolyline } from '../services/routingService';
import { createRoute, deleteRoute } from '../api/routes';
import apiClient from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useRoutePlanner } from '../contexts/RoutePlannerContext';
import { useRouteBuilder } from '../hooks/useRouteBuilder';
import { RoutePoint as UnifiedRoutePoint, PointSource } from '../types/routeBuilder';
import { useLayoutState } from '../contexts/LayoutContext';
import '../styles/GlobalStyles.css';
import '../styles/PageLayout.css';
import '../styles/FireMarkers.css';

// Стабильный компонент карты - НЕ ПЕРЕСОЗДАЕТСЯ
const StableMap = React.memo(({ 
  onMapReady, 
  onMapClick, 
  markers, 
  routeLine,
  displayedRoutePolylines,
  shouldCenterOnRoute,
  zones,
  suppressAutoFit
}: {
  onMapReady: () => void;
  onMapClick: (coordinates: [number, number]) => void;
  markers: Array<{ id: string; coordinates: [number, number]; title: string; description?: string; source?: string }>;
  routeLine: [number, number][];
  displayedRoutePolylines: Array<{id: string, polyline: [number, number][], color: string}>;
  shouldCenterOnRoute: boolean;
  zones: Array<{ severity?: string; polygons: number[][][]; name?: string; type?: string }>;
  suppressAutoFit: boolean;
}) => {
  // Динамически определяем центр карты на основе маркеров
  const getMapCenter = () => {
    // Если нужно центрироваться на маршруте и есть маркеры - принудительно центрируем
    if (shouldCenterOnRoute && markers.length > 0) {
      if (markers.length === 1) {
        return markers[0].coordinates;
      } else {
        // Вычисляем центр между всеми маркерами маршрута
        const latitudes = markers.map(m => m.coordinates[0]);
        const longitudes = markers.map(m => m.coordinates[1]);
        
        const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
        const centerLon = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
        
        return [centerLat, centerLon] as [number, number];
      }
    }
    
    // Если есть маршрут (полилиния) - центрируем на нем
    if (routeLine && routeLine.length > 0) {
      const routeLatitudes = routeLine.map(point => point[0]);
      const routeLongitudes = routeLine.map(point => point[1]);
      
      const centerLat = (Math.min(...routeLatitudes) + Math.max(...routeLatitudes)) / 2;
      const centerLon = (Math.min(...routeLongitudes) + Math.max(...routeLongitudes)) / 2;
      
      return [centerLat, centerLon] as [number, number];
    }
    
    // Обычная логика центрирования
    if (markers.length === 0) {
      // Если нет маркеров - возвращаем null, чтобы карта использовала свои настройки
      return null;
    } else if (markers.length === 1) {
      // Если только одна точка и не нужно центрироваться на маршруте — не трогаем центр,
      // чтобы избежать прыжков при добавлении первой метки
      return null;
    } else {
      // Если несколько маркеров - вычисляем центр между всеми маркерами
      const latitudes = markers.map(m => m.coordinates[0]);
      const longitudes = markers.map(m => m.coordinates[1]);
      
      const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
      const centerLon = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
      
      return [centerLat, centerLon] as [number, number];
    }
  };

  // Динамически определяем зум на основе маркеров
  const getMapZoom = () => {
    // Если нужно центрироваться на маршруте и есть маркеры - принудительно масштабируем
    if (shouldCenterOnRoute && markers.length > 0) {
      if (markers.length === 1) {
        return 12; // Детальный вид одной точки
      } else {
        // Вычисляем подходящий зум для охвата всех точек маршрута
        const latitudes = markers.map(m => m.coordinates[0]);
        const longitudes = markers.map(m => m.coordinates[1]);
        
        const latDiff = Math.max(...latitudes) - Math.min(...latitudes);
        const lonDiff = Math.max(...longitudes) - Math.min(...longitudes);
        const maxDiff = Math.max(latDiff, lonDiff);
        
        // Адаптивный зум для восстановленного маршрута
        if (maxDiff > 5) return 6;      // Большие расстояния (между городами)
        if (maxDiff > 1) return 8;      // Средние расстояния
        if (maxDiff > 0.1) return 10;   // Малые расстояния
        return 12;                       // Очень близкие точки
      }
    }
    
    // Если есть маршрут - масштабируем под него
    if (routeLine && routeLine.length > 0) {
      const routeLatitudes = routeLine.map(point => point[0]);
      const routeLongitudes = routeLine.map(point => point[1]);
      
      const latDiff = Math.max(...routeLatitudes) - Math.min(...routeLatitudes);
      const lonDiff = Math.max(...routeLongitudes) - Math.min(...routeLongitudes);
      const maxDiff = Math.max(latDiff, lonDiff);
      
      // Адаптивный зум для маршрута
      if (maxDiff > 5) return 6;      // Большие расстояния (между городами)
      if (maxDiff > 1) return 8;      // Средние расстояния
      if (maxDiff > 0.1) return 10;   // Малые расстояния
      return 12;                       // Очень близкие точки
    }
    
    // Обычная логика зума
    if (markers.length === 0) {
      return 10; // дефолтный зум при отсутствии точек
    } else if (markers.length === 1) {
      // Если только одна точка и не нужно центрироваться — возвращаем стандартный зум,
      // чтобы избежать эффекта "пульсации" при добавлении первой метки
      return 10;
    } else {
      // Если несколько маркеров - вычисляем подходящий зум для охвата всех точек
      const latitudes = markers.map(m => m.coordinates[0]);
      const longitudes = markers.map(m => m.coordinates[1]);
      
      const latDiff = Math.max(...latitudes) - Math.min(...latitudes);
      const lonDiff = Math.max(...longitudes) - Math.min(...longitudes);
      const maxDiff = Math.max(latDiff, lonDiff);
      
      // Адаптивный зум на основе расстояния между точками
      if (maxDiff > 5) return 6;      // Большие расстояния (между городами)
      if (maxDiff > 1) return 8;      // Средние расстояния
      if (maxDiff > 0.1) return 10;   // Малые расстояния
      return 12;                       // Очень близкие точки
    }
  };

  return (
    <LazyYandexMap
      key="planner-map-stable-component"
      center={getMapCenter()}
      zoom={getMapZoom()}
      markers={markers}
      onMapClick={onMapClick}
      routeLine={routeLine}
      displayedRoutePolylines={displayedRoutePolylines}
      onMapReady={onMapReady}
      autoFitBounds={Boolean(!suppressAutoFit && (shouldCenterOnRoute || routeLine.length > 1 || markers.length > 1))}
      zones={zones}
    />
  );
});

// Стабильный заголовок - НЕ ДЕРГАЕТСЯ
const StableHeader = React.memo(({ showZonesLayer, setShowZonesLayer }: { showZonesLayer: boolean; setShowZonesLayer: (show: boolean) => void }) => {
  return (
    <div className="map-content-header">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <FaRoute className="w-5 h-5 text-slate-400" />
          <h1 className="text-lg font-semibold text-slate-800">Планировщик маршрутов</h1>
        </div>
        
        <div className="flex items-center space-x-3 justify-center flex-1">
          {/* Переключатель слоя запрещённых зон */}
          <button
            onClick={() => setShowZonesLayer(!showZonesLayer)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${
              showZonesLayer 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
            title={showZonesLayer ? 'Скрыть запрещённые зоны' : 'Показать запрещённые зоны'}
          >
            <span className="text-sm">🚫</span>
            <span className="text-sm font-medium">
              {showZonesLayer ? 'Зоны скрыты' : 'Запрещённые зоны'}
            </span>
          </button>
          
          {/* Статус пользователя - стабилизирован */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
            <span className="text-lg">🎒</span>
            <span className="text-sm font-medium text-green-600">Путешественник</span>
          </div>
        </div>
      </div>
      
      {/* Вдохновляющее сообщение - стабилизировано */}
      <div className="text-sm text-gray-600 italic text-center mt-2 px-20">
        "Создайте маршрут, который расскажет историю"
      </div>
    </div>
  );
});

// Компонент выбора слоя карты

interface PlannerProps {
  selectedRouteId?: string;
  showOnlySelected?: boolean;
}

const Planner: React.FC<PlannerProps> = () => {
  const { registerPanel, unregisterPanel } = usePanelRegistration();
  const [zones, setZones] = useState<Array<{ severity?: string; polygons: number[][][]; name?: string; type?: string }>>([]);
  const [showZonesLayer, setShowZonesLayer] = useState(false);
  
  // Единая система построения маршрутов
  const {
    routeState,
    pointManager,
    activePoints,
    routePolyline: unifiedRoutePolyline,
    isBuilding,
    canBuild,
    stats
  } = useRouteBuilder();
  
  // Регистрируем панели при монтировании компонента
  // Состояние для выдвигающихся панелей (из FavoritesContext)
  const favoritesCtx = useFavorites();
  const favoritesOpen = (favoritesCtx as any)?.favoritesOpen ?? false;
  const setFavoritesOpen = (favoritesCtx as any)?.setFavoritesOpen ?? (() => {});
  useEffect(() => {
    registerPanel(); // Левая панель с настройками
    registerPanel(); // Правая панель с избранным
    return () => {
      unregisterPanel(); // Левая панель
      unregisterPanel(); // Правая панель
    };
  }, [registerPanel, unregisterPanel]);

  // Глобальный обработчик ошибок message channel
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Игнорируем ошибки message channel (обычно от расширений браузера)
      if (event.reason && event.reason.message && 
          event.reason.message.includes('message channel closed')) {
        event.preventDefault();
        return;
      }
    };

    const handleError = (event: ErrorEvent) => {
      // Игнорируем ошибки message channel
      if (event.message && event.message.includes('message channel closed')) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Загрузка запрещенных зон для отрисовки
  useEffect(() => {
    getAllZones().then(setZones).catch(() => {});
  }, []);

  // Состояние для выдвигающихся панелей
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Панели порядка следования
  const [isRebuildModalOpen, setIsRebuildModalOpen] = useState(false);
  // const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false); // Убрано - функциональность перенесена в настройки
  
  // Состояние для центрирования карты на маршруте при восстановлении
  const [shouldCenterOnRoute, setShouldCenterOnRoute] = useState(false);
  const autoCenterTimerRef = useRef<number | null>(null);
  const triggerAutoCenter = (durationMs: number = 800) => {
    try {
      if (autoCenterTimerRef.current) {
        clearTimeout(autoCenterTimerRef.current);
        autoCenterTimerRef.current = null;
      }
      setShouldCenterOnRoute(true);
      autoCenterTimerRef.current = window.setTimeout(() => {
        setShouldCenterOnRoute(false);
        autoCenterTimerRef.current = null;
      }, durationMs);
    } catch {}
  };
  
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Состояние для отображения выбранных маршрутов на карте
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const [displayedRoutePolylines, setDisplayedRoutePolylines] = useState<Array<{id: string, polyline: [number, number][], color: string}>>([]);
  
  // Состояние для отладочных уведомлений
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Отладка состояния
  useEffect(() => {
    console.log('🔧 Состояние маршрутов обновлено:', {
      selectedRouteIds,
      displayedPolylinesCount: displayedRoutePolylines.length
    });
  }, [selectedRouteIds, displayedRoutePolylines]);
  
  // Обработчик переключения отображения маршрутов
  const handleRouteToggle = async (route: RouteData, checked: boolean, mode: 'map' | 'planner') => {
    const info = `🔧 handleRouteToggle: ${route.title} (${checked ? 'включить' : 'выключить'}), точек: ${route.points?.length || 0} | waypoints: ${route.waypoints?.length || 0} | route_data: ${(route as any).route_data ? 'есть' : 'нет'}`;
    setDebugInfo(info);
    
    // Очищаем отладочную информацию через 5 секунд
    setTimeout(() => setDebugInfo(''), 5000);
    console.log('🔧 handleRouteToggle вызван:', { 
      routeId: route.id, 
      routeTitle: route.title,
      checked, 
      mode,
      pointsCount: route.points?.length || 0,
      points: route.points?.map(p => ({ lat: p.latitude, lon: p.longitude, title: p.title })),
      fullRoutePoints: route.points
    });
    if (mode !== 'planner') return;
    
    if (checked) {
      // Проверяем лимит в 3 маршрута
      if (selectedRouteIds.length >= 3) {
        alert('⚠️ Можно отображать не более 3 маршрутов одновременно');
        return;
      }
      
      setSelectedRouteIds(prev => prev.includes(route.id) ? prev : [...prev, route.id]);
      
      // ПРИНУДИТЕЛЬНАЯ ГИДРАЦИЯ: если route.points пустой, но есть waypoints или route_data
      let hydratedRoute = route;
      if ((!route.points || route.points.length === 0) && ((route.waypoints && route.waypoints.length > 0) || (route as any).route_data)) {
        console.log('🔧 Принудительная гидратация маршрута:', route.id);
        
        // Пытаемся восстановить точки из waypoints
        if (route.waypoints && route.waypoints.length > 0) {
          const byFavId = new Map(favoritePlaces.map(fp => [String(fp.id), fp]));
          const hydratedPoints = route.waypoints
            .map((wp: any) => byFavId.get(String(wp.marker_id)))
            .filter(Boolean)
            .map((m: any, idx: number) => ({
              id: m.id,
              title: m.title || `Точка ${idx + 1}`,
              description: m.description || '',
              latitude: Number(m.coordinates?.[0] ?? NaN),
              longitude: Number(m.coordinates?.[1] ?? NaN)
            }))
            .filter((p: any) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
          
          if (hydratedPoints.length > 0) {
            hydratedRoute = { ...route, points: hydratedPoints };
            console.log('🔧 Гидратация из waypoints успешна:', hydratedPoints.length, 'точек');
          }
        }
        
        // Если не получилось из waypoints, пытаемся из route_data
        if ((!hydratedRoute.points || hydratedRoute.points.length === 0) && (route as any).route_data) {
          try {
            const rdRaw: any = (route as any).route_data;
            const rd = typeof rdRaw === 'string' ? (JSON.parse(rdRaw) || {}) : (rdRaw || {});
            if (Array.isArray(rd.points) && rd.points.length > 0) {
              const hydratedPoints = rd.points
                .map((p: any, idx: number) => ({
                  id: String(p?.id || `pt-${idx}`),
                  title: p?.title || `Точка ${idx + 1}`,
                  description: p?.description || '',
                  latitude: Number(p?.latitude ?? NaN),
                  longitude: Number(p?.longitude ?? NaN)
                }))
                .filter((p: any) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
              
              if (hydratedPoints.length > 0) {
                hydratedRoute = { ...route, points: hydratedPoints };
                console.log('🔧 Гидратация из route_data успешна:', hydratedPoints.length, 'точек');
              }
            }
          } catch (e) {
            console.error('Ошибка парсинга route_data:', e);
          }
        }
      }

      // Строим полилинию для маршрута
      if (hydratedRoute.points && hydratedRoute.points.length >= 2) {
        try {
          console.log('🔧 Строим полилинию для маршрута:', hydratedRoute.id, hydratedRoute.points);
          // Нормализуем точки в формат [долгота, широта], убираем невалидные/нулевые
          const toNumber = (v: any) => (v === null || v === undefined ? NaN : Number(v));
          const isFiniteNumber = (n: number) => typeof n === 'number' && Number.isFinite(n);
          const isValidLon = (lon: number) => isFiniteNumber(lon) && lon >= -180 && lon <= 180 && Math.abs(lon) > 0.00001;
          const isValidLat = (lat: number) => isFiniteNumber(lat) && lat >= -90 && lat <= 90 && Math.abs(lat) > 0.00001;
          let normalized = (hydratedRoute.points || [])
            .map(p => [toNumber((p as any).longitude), toNumber((p as any).latitude)] as [number, number])
            .filter(([lon, lat]) => isValidLon(lon) && isValidLat(lat));

          // Фолбэк-гидратация: если в маршруте точки нулевые, пытаемся найти их среди избранных меток
          if (normalized.length < 2) {
            try {
              const byId = new Map<string, { lat: number; lon: number }>();
              const byTitle = new Map<string, { lat: number; lon: number }>();
              favoritePlaces.forEach((fav: any) => {
                const lat = Number(fav.coordinates?.[0] ?? fav.latitude);
                const lon = Number(fav.coordinates?.[1] ?? fav.longitude);
                if (isValidLat(lat) && isValidLon(lon)) {
                  if (fav.id) byId.set(String(fav.id), { lat, lon });
                  if (fav.name) byTitle.set(String(fav.name), { lat, lon });
                  if (fav.title) byTitle.set(String(fav.title), { lat, lon });
                }
              });

              const hydrated: [number, number][] = [];
              (hydratedRoute.points || []).forEach((p: any) => {
                const pid = p.id ? String(p.id) : '';
                const ptitle = p.title ? String(p.title) : '';
                let coord = pid && byId.get(pid);
                if (!coord && ptitle) coord = byTitle.get(ptitle);
                if (coord && isValidLat(coord.lat) && isValidLon(coord.lon)) {
                  hydrated.push([coord.lon, coord.lat]);
                }
              });
              if (hydrated.length >= 2) normalized = hydrated;
            } catch {}
          }

          if (normalized.length < 2) {
            console.warn('Маршрут содержит недостаточно валидных точек для ORS', { count: normalized.length, routeId: route.id });
            return;
          }

          console.log('🔧 Точки для полилинии (нормализованные):', normalized);
          console.log('🔧 Исходные hydratedRoute.points:', hydratedRoute.points?.map(p => ({ id: p.id, lat: p.latitude, lon: p.longitude, title: p.title })));
          setDebugInfo(prev => prev + ` | Нормализовано: ${normalized.length} точек`);

          // 1) Сразу отобразим точки маршрута: добавим их в единую систему точек
          // через pointManager (именно из activePoints формируются маркеры на карте)
          const routeMarkersToAdd = normalized.map(([lon, lat], index) => ({
            id: String((hydratedRoute.points?.[index] as any)?.id || `route-${hydratedRoute.id}-point-${index}`),
            coordinates: [lat, lon] as [number, number], // Исправлено: Yandex Maps ожидает [широта, долгота]
            title: (hydratedRoute.points?.[index] as any)?.title || `Точка ${index + 1}`,
            description: (hydratedRoute.points?.[index] as any)?.description || `Из маршрута: ${hydratedRoute.title}`,
          }));
          
          console.log('🔧 Восстанавливаем временные метки маршрута:', {
            routeId: hydratedRoute.id,
            markersToAdd: routeMarkersToAdd.map(m => ({ id: m.id, coords: m.coordinates, title: m.title }))
          });
          // Удаляем возможные старые точки этого маршрута и добавляем актуальные
          try { pointManager.removePointBySource('route', hydratedRoute.id); } catch {}
          try {
            routeMarkersToAdd.forEach(m => {
              pointManager.addPoint({
                coordinates: [m.coordinates[0], m.coordinates[1]], // [lat, lon] - правильный формат для pointManager
                title: m.title,
                description: m.description,
                source: 'route',
                sourceId: `${hydratedRoute.id}:${m.id}`
              });
            });
          } catch {}
          // Поддержим старую систему временных меток для обратной совместимости
          setMapClickMarkers(prev => {
            const existing = new Set(prev.map(m => m.id));
            const merged = [...prev];
            for (const m of routeMarkersToAdd) {
              if (!existing.has(m.id)) merged.push(m);
            }
            return merged;
          });

          const polyline = await getRoutePolyline(normalized);
          console.log('🔧 Получена полилиния:', polyline.length, 'точек');
          
          const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1']; // Разные цвета для маршрутов
          const color = colors[(selectedRouteIds.length + 1) % colors.length]; // +1 потому что мы еще не добавили текущий ID
          
          console.log('🔧 Добавляем полилинию в состояние:', { id: hydratedRoute.id, color, pointsCount: polyline.length });
          setDisplayedRoutePolylines(prev => [...prev, {
            id: hydratedRoute.id,
            polyline,
            color
          }]);
        } catch (error) {
          console.error('Ошибка построения полилинии маршрута, рисуем прямую линию:', error);
          // Фолбэк: рисуем простую линию между точками [lat,lon]
          const fallbackPolyline: [number, number][] = (hydratedRoute.points || [])
            .map((p: any) => [Number(p.longitude), Number(p.latitude)] as [number, number])
            .filter(([lon, lat]: [number, number]) => Number.isFinite(lon) && Number.isFinite(lat))
            .map(([lon, lat]: [number, number]) => [lat, lon] as [number, number]);
          const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
          const color = colors[(selectedRouteIds.length + 1) % colors.length];
          setDisplayedRoutePolylines(prev => [...prev, { id: hydratedRoute.id, polyline: fallbackPolyline, color }]);
        }
      } else {
        console.log('🔧 Недостаточно точек для маршрута:', hydratedRoute.points?.length || 0);
      }
    } else {
      // ПРИНУДИТЕЛЬНАЯ ГИДРАЦИЯ для удаления: если route.points пустой, но есть waypoints или route_data
      let hydratedRouteForRemoval = route;
      if ((!route.points || route.points.length === 0) && ((route.waypoints && route.waypoints.length > 0) || (route as any).route_data)) {
        console.log('🔧 Гидратация для удаления маршрута:', route.id);
        
        // Пытаемся восстановить точки из waypoints
        if (route.waypoints && route.waypoints.length > 0) {
          const byFavId = new Map(favoritePlaces.map(fp => [String(fp.id), fp]));
          const hydratedPoints = route.waypoints
            .map((wp: any) => byFavId.get(String(wp.marker_id)))
            .filter(Boolean)
            .map((m: any, idx: number) => ({
              id: m.id,
              title: m.title || `Точка ${idx + 1}`,
              description: m.description || '',
              latitude: Number(m.coordinates?.[0] ?? NaN),
              longitude: Number(m.coordinates?.[1] ?? NaN)
            }))
            .filter((p: any) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
          
          if (hydratedPoints.length > 0) {
            hydratedRouteForRemoval = { ...route, points: hydratedPoints };
            console.log('🔧 Гидратация для удаления из waypoints успешна:', hydratedPoints.length, 'точек');
          }
        }
        
        // Если не получилось из waypoints, пытаемся из route_data
        if ((!hydratedRouteForRemoval.points || hydratedRouteForRemoval.points.length === 0) && (route as any).route_data) {
          try {
            const rdRaw: any = (route as any).route_data;
            const rd = typeof rdRaw === 'string' ? (JSON.parse(rdRaw) || {}) : (rdRaw || {});
            if (Array.isArray(rd.points) && rd.points.length > 0) {
              const hydratedPoints = rd.points
                .map((p: any, idx: number) => ({
                  id: String(p?.id || `pt-${idx}`),
                  title: p?.title || `Точка ${idx + 1}`,
                  description: p?.description || '',
                  latitude: Number(p?.latitude ?? NaN),
                  longitude: Number(p?.longitude ?? NaN)
                }))
                .filter((p: any) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
              
              if (hydratedPoints.length > 0) {
                hydratedRouteForRemoval = { ...route, points: hydratedPoints };
                console.log('🔧 Гидратация для удаления из route_data успешна:', hydratedPoints.length, 'точек');
              }
            }
          } catch (e) {
            console.error('Ошибка парсинга route_data для удаления:', e);
          }
        }
      }

      console.log('🔧 Снимаем чекбокс маршрута, удаляем метки:', {
        routeId: route.id,
        routePoints: hydratedRouteForRemoval.points?.map(p => ({ id: p.id, title: p.title })),
        currentSelectedRouteIds: selectedRouteIds,
        currentDisplayedPolylines: displayedRoutePolylines.length
      });
      
      setSelectedRouteIds(prev => {
        const newIds = prev.filter(id => id !== route.id);
        console.log('🔧 Обновляем selectedRouteIds:', { было: prev, стало: newIds });
        return newIds;
      });
      setDisplayedRoutePolylines(prev => {
        const newPolylines = prev.filter(r => r.id !== route.id);
        console.log('🔧 Обновляем displayedRoutePolylines:', { было: prev.length, стало: newPolylines.length });
        return newPolylines;
      });
      
      // ВАЖНО: Также очищаем основную полилинию, если она была построена из этого маршрута
      // Проверяем, не является ли текущая routePolyline результатом этого маршрута
      if (routePolyline.length > 0) {
        console.log('🔧 Очищаем основную routePolyline при снятии чекбокса маршрута');
        setRoutePolyline([]);
      }
      
      // Также очищаем unifiedRoutePolyline через pointManager.clearRoute()
      console.log('🔧 Очищаем unifiedRoutePolyline через pointManager.clearRoute()');
      pointManager.clearRoute();
      
      // Удаляем временные метки, добавленные для этого маршрута (используем гидратированные точки)
      setMapClickMarkers(prev => {
        const toRemove = (hydratedRouteForRemoval.points || []).map((p: any, idx: number) => String(p?.id || `route-${route.id}-point-${idx}`));
        console.log('🔧 Удаляем метки с ID:', toRemove);
        return prev.filter(m => !toRemove.includes(m.id));
      });
      // Также удаляем точки маршрута из единой системы (именно они рендерятся на карте)
      // Удаляем все точки этого маршрута по префиксу sourceId
      try { 
        const pointsToRemove = activePoints.filter(p => p.source === 'route' && p.sourceId?.startsWith(`${route.id}:`));
        console.log('🔧 Удаляем точки маршрута из единой системы:', {
          routeId: route.id,
          pointsToRemove: pointsToRemove.map(p => ({ id: p.id, sourceId: p.sourceId, title: p.title })),
          totalActivePoints: activePoints.length
        });
        pointsToRemove.forEach(p => {
          console.log('🔧 Удаляем точку:', p.id);
          pointManager.removePoint(p.id);
        });
      } catch (error) {
        console.error('Ошибка при удалении точек маршрута:', error);
      }
    }
  };

  // Состояние для предотвращения повторного построения маршрута
  const [lastBuiltRoute, setLastBuiltRoute] = useState<string>('');
  
  // Новые состояния для построения маршрута
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCoordinateInput, setShowCoordinateInput] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [pendingRouteData, setPendingRouteData] = useState<{
    title: string;
    points: any[];
  } | null>(null);
  
  // Упрощенные состояния - убираем лишнее
  const [lastRouteCreated, setLastRouteCreated] = useState<string | null>(null);

  const auth = useAuth();
  const layoutContext = useLayoutState();
  const [favoritesTab] = useState<'places' | 'routes'>('places');
  const [favoritesPanelKey, setFavoritesPanelKey] = useState(0);
  const favoritesContext = useFavorites();
  const routePlannerContext = useRoutePlanner();
  const { selectedMarkerIds = [], setSelectedMarkerIds = () => {} } = (favoritesContext as any) || {};

  // Контекст хранит открытую панель и выбранные чекбоксы; локальная гидратация не нужна
  useEffect(() => {}, []);

  // Открытость синхронизируется внутри FavoritesContext

  // Выбор синхронизируется внутри FavoritesContext

  // Проверяем, что все контексты загружены
  if (!auth || !layoutContext || !favoritesContext || !routePlannerContext) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка планировщика...</p>
        </div>
      </div>
    );
  }

  const { token } = auth;
  const { setLeftContent, setRightContent } = layoutContext;
  const { favoritePlaces, removeFavoritePlace, favoriteRoutes } = favoritesContext || {
    favoritePlaces: [],
    removeFavoritePlace: () => {},
    favoriteRoutes: []
  };

  // Санитизация выбранных ID: удаляем те, которых нет в текущем списке избранного
  useEffect(() => {
    if (!Array.isArray(selectedMarkerIds)) return;
    const validIds = new Set(favoritePlaces.map(p => p.id));
    const filtered = selectedMarkerIds.filter(id => validIds.has(id));
    if (filtered.length !== selectedMarkerIds.length) {
      setSelectedMarkerIds(filtered as string[]);
    }
  }, [favoritePlaces, selectedMarkerIds, setSelectedMarkerIds]);

  // Преобразуем FavoritePlace в MarkerData для совместимости
  const favorites: MarkerData[] = favoritePlaces.map((place): MarkerData => ({
    id: place.id,
    latitude: place.coordinates[0],
    longitude: place.coordinates[1],
    title: place.name,
    description: place.type,
    address: place.location,
    category: place.type,
    rating: place.rating,
    rating_count: 0,
    photo_urls: [],
    hashtags: [],
    author_name: 'User',
    created_at: place.addedAt.toISOString(),
    updated_at: place.addedAt.toISOString(),
    likes_count: 0,
    comments_count: 0,
    shares_count: 0
  }));

  // Синхронизация чекбоксов избранного с единой системой активных точек
  useEffect(() => {
    try {
      if (!Array.isArray(selectedMarkerIds)) return;

      // Множество выбранных ID избранного
      const selectedSet = new Set(selectedMarkerIds);

      // 1) Удаляем из единой системы все точки-избранное, которые больше не выбраны
      routeState.activePoints
        .filter(p => p.source === 'favorites')
        .forEach(p => {
          if (p.sourceId && !selectedSet.has(p.sourceId)) {
            pointManager.removePointBySource('favorites', p.sourceId);
          }
        });

      // 2) Гарантируем наличие точек для всех выбранных чекбоксов
      const existingBySourceId = new Map(
        routeState.activePoints
          .filter(p => p.source === 'favorites' && p.sourceId)
          .map(p => [p.sourceId as string, true])
      );

      selectedMarkerIds.forEach(id => {
        if (existingBySourceId.has(id)) return;
        const fav = favorites.find(f => f.id === id);
        if (!fav) return;
        // Добавляем точку в единую систему
        pointManager.addPoint({
          coordinates: [Number(fav.latitude), Number(fav.longitude)],
          title: fav.title,
          description: fav.description || 'Из избранного',
          source: 'favorites',
          sourceId: id,
          address: fav.title
        });
      });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMarkerIds, favorites]);

  // Автопостроение маршрута при изменении активных точек
  useEffect(() => {
    try {
      const activeCount = routeState.activePoints.filter(p => p.isActive).length;
      if (activeCount >= 2) {
        // Добавляем небольшую задержку для стабильности
        const timeoutId = setTimeout(() => {
          pointManager.buildRoute().catch(error => {
            console.warn('Ошибка автопостроения маршрута:', error);
          });
        }, 100);
        
        return () => clearTimeout(timeoutId);
      } else {
        // Меньше 2 точек — очищаем линию
        // Не сбрасываем сами точки, только линию
        // routeState управляется хуком, поэтому мягко очищаем локальную визуализацию
        setRoutePolyline([]);
      }
    } catch (error) {
      console.warn('Ошибка в useEffect автопостроения:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeState.activePoints]);

  // Дополнительное отслеживание изменений порядка точек
  useEffect(() => {
    try {
      const activeCount = routeState.activePoints.filter(p => p.isActive).length;
      if (activeCount >= 2) {
        // Принудительно перестраиваем маршрут при изменении порядка
        const timeoutId = setTimeout(() => {
          pointManager.rebuildRoute().catch(error => {
            console.warn('Ошибка перестроения маршрута:', error);
          });
        }, 200);
        
        return () => clearTimeout(timeoutId);
      }
    } catch (error) {
      console.warn('Ошибка в useEffect перестроения:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeState.activePoints.map(p => `${p.id}-${p.order}-${p.isActive}`).join('|')]);

  // Преобразуем FavoriteRoute в RouteData с нормализацией и гидратацией
  const convertedRoutes: RouteData[] = favoriteRoutes.map(route => {
    console.log('🔧 convertedRoutes: обрабатываем маршрут', route.id, 'с points:', route.points?.length || 0);
    // Подготовим быстрый доступ к избранным местам для гидратации
    const byFavId = new Map(favoritePlaces.map(fp => [String(fp.id), fp]));

    const normalizedPoints = (route.points || []).map((p: any, idx: number) => {
      // Кандидаты на координаты
      const candidates: Array<{ lat: number | null; lon: number | null }> = [];
      // Явные поля
      candidates.push({ lat: Number(p?.latitude), lon: Number(p?.longitude) });
      // Массив coordinates может быть [lat,lon] или [lon,lat] — определим по допустимости диапазона
      if (Array.isArray(p?.coordinates) && p.coordinates.length >= 2) {
        const a = Number(p.coordinates[0]);
        const b = Number(p.coordinates[1]);
        if (Number.isFinite(a) && Number.isFinite(b)) {
          // Вариант [lat,lon]
          if (Math.abs(a) <= 90 && Math.abs(b) <= 180) candidates.push({ lat: a, lon: b });
          // Вариант [lon,lat]
          if (Math.abs(b) <= 90 && Math.abs(a) <= 180) candidates.push({ lat: b, lon: a });
        }
      }

      // Выбираем первую валидную пару
      let lat: number | null = null;
      let lon: number | null = null;
      for (const c of candidates) {
        if (
          c.lat != null && c.lon != null &&
          Number.isFinite(c.lat) && Number.isFinite(c.lon) &&
          Math.abs(c.lat) <= 90 && Math.abs(c.lon) <= 180 &&
          !(Math.abs(c.lat) < 0.0001 && Math.abs(c.lon) < 0.0001)
        ) { lat = c.lat; lon = c.lon; break; }
      }

      // Гидратация из избранных мест по id при отсутствии валидных координат
      if (lat == null || lon == null) {
        const fav = byFavId.get(String(p?.id));
        if (fav) {
          const la = Number(fav.coordinates?.[0] ?? NaN);
          const lo = Number(fav.coordinates?.[1] ?? NaN);
          if (
            Number.isFinite(la) && Number.isFinite(lo) &&
            Math.abs(la) <= 90 && Math.abs(lo) <= 180 &&
            !(Math.abs(la) < 0.0001 && Math.abs(lo) < 0.0001)
          ) {
            lat = la; lon = lo;
          }
        }
      }

      return {
        id: String(p?.id || `pt-${idx}`),
        title: p?.title || `Точка ${idx + 1}`,
        description: p?.description || '',
        latitude: lat as any,
        longitude: lon as any
      };
    }).filter((pt: any) =>
      Number.isFinite(pt.latitude) && Number.isFinite(pt.longitude)
    );

    const result = {
    id: route.id,
    title: route.title,
    description: '',
      points: normalizedPoints,
    waypoints: [],
    createdAt: route.addedAt.toISOString(),
    updatedAt: route.addedAt.toISOString()
    } as RouteData;
    
    console.log('🔧 convertedRoutes: результат для', route.id, 'points:', result.points.length);
    return result;
  });

  const { routePoints, clearRoutePoints, setRoutePoints } = routePlannerContext;

  // Добавляем состояние для меток, добавленных прямо на карту
  const [mapClickMarkers, setMapClickMarkers] = useState<Array<{
    id: string;
    coordinates: [number, number];
    title: string;
    description?: string;
  }>>([]);

  // Обработчик клика по карте для добавления меток - единая система
  const handleMapClick = (coordinates: [number, number]) => {
    try {
      // Добавляем точку через единую систему
      pointManager.addClickPoint(coordinates);
      
      console.log('🔧 handleMapClick:', {
        coordinates,
        activePointsCount: activePoints.length,
        canBuild,
        activePoints: activePoints.map(p => ({ id: p.id, title: p.title, source: p.source, isActive: p.isActive }))
      });
      
      // Автоматически строим маршрут если достаточно точек
      // Добавляем небольшую задержку для стабильности
      setTimeout(() => {
        if (canBuild) {
          pointManager.buildRoute().catch(error => {
            console.warn('Ошибка построения маршрута после клика:', error);
          });
        }
      }, 150);
      
      // Вдохновляющее сообщение вместо простого alert
      const inspirationMessages = [
        "✨ Отличный выбор! Эта точка может стать началом удивительного маршрута",
        "🌍 Каждое место имеет свою историю. Что вы здесь увидели?",
        "🎯 Хорошо! Теперь добавьте ещё несколько точек, чтобы создать полноценное путешествие",
        "💫 Красивое место! Поделитесь с другими, что делает его особенным"
      ];
      
      const message = inspirationMessages[Math.floor(Math.random() * inspirationMessages.length)];
      const lat = coordinates[0] || 0;
      const lng = coordinates[1] || 0;
      alert(`✅ ${message}\n\nКоординаты: [${lat.toFixed(4)}, ${lng.toFixed(4)}]\n\nМетка автоматически выбрана для построения маршрута.\n\n💡 Подсказка: Кликните по метке, чтобы удалить её.`);
    } catch (error) {
      // Игнорируем ошибки message channel (обычно от расширений браузера)
      console.warn('Ошибка при обработке клика по карте:', error);
    }
  };

  // Функция удаления маркера из единой системы
  const handleRemoveMarker = (markerId: string) => {
    try {
      // Удаляем точку из единой системы построения маршрутов
      pointManager.removePoint(markerId);
      console.log('🗑️ Маркер удален:', markerId);
    } catch (error) {
      console.warn('Ошибка при удалении маркера:', error);
    }
  };

  // Функция удаления метки, добавленной кликом - новая архитектура
  const handleRemoveClickMarker = (markerId: string) => {
    setMapClickMarkers((prev: typeof mapClickMarkers) => prev.filter(marker => marker.id !== markerId));
    setSelectedMarkerIds((prev: string[]) => (prev || []).filter((id: string) => id !== markerId));
    // Удаляем точку из единой системы
    try { pointManager.removePoint(markerId); } catch {}
  };

  // Функция очистки меток с выбором - новая умная архитектура
  const handleClearAllClickMarkers = () => {
    const clickMarkersCount = mapClickMarkers.filter(m => m.id.startsWith('map-click-')).length;
    const searchMarkersCount = mapClickMarkers.filter(m => m.id.startsWith('search-')).length;
    const favoritesCount = favorites.filter(f => selectedMarkerIds.includes(f.id)).length;
    const routesCount = selectedRouteIds.length;
    
    if (clickMarkersCount === 0 && searchMarkersCount === 0 && favoritesCount === 0 && routesCount === 0) {
      alert('🌿 Нет меток для очистки. Добавьте метки одним из способов!');
      return;
    }
    
    // Создаем детальное сообщение с вариантами
    let message = `🗑️ Выберите, что именно очистить:\n\n`;
    message += `Доступные метки:\n`;
    if (clickMarkersCount > 0) message += `📍 Клик-метки: ${clickMarkersCount}\n`;
    if (searchMarkersCount > 0) message += `🔍 Метки из поиска: ${searchMarkersCount}\n`;
    if (favoritesCount > 0) message += `⭐ Избранное на карте: ${favoritesCount}\n`;
    if (routesCount > 0) message += `🛣️ Маршруты: ${routesCount}\n`;
    message += `\n`;
    
    // Определяем варианты очистки
    const hasTemporary = clickMarkersCount > 0 || searchMarkersCount > 0;
    const hasFavorites = favoritesCount > 0;
    const hasRoutes = routesCount > 0;
    
    if (hasTemporary && hasFavorites) {
      // Есть и временные, и избранное - даем выбор
      message += `Варианты:\n`;
      message += `1️⃣ - Очистить только временные метки (клики + поиск)\n`;
      message += `2️⃣ - Очистить АБСОЛЮТНО ВСЕ метки (включая избранное и маршруты)\n`;
      message += `❌ - Отмена`;
      
      const choice = prompt(message);
      
      if (choice === '1') {
        // Очищаем только временные метки
        setMapClickMarkers([]);
        setSelectedMarkerIds((prev: string[]) => (prev || []).filter((id: string) => !id.startsWith('map-click-') && !id.startsWith('search-')));
        pointManager.clearRoute();
        alert('✅ Временные метки удалены! Избранное и маршруты сохранены.');
        
      } else if (choice === '2') {
        // Очищаем ВСЕ включая избранное и маршруты
        if (confirm('⚠️ ВНИМАНИЕ! Это удалит ВСЕ метки и маршруты с карты.\n\nВы уверены? Это действие нельзя отменить!')) {
          setMapClickMarkers([]);
          setSelectedMarkerIds([] as string[]);
          setSelectedRouteIds([]);
          setDisplayedRoutePolylines([]);
          setRoutePolyline([]); // Очищаем основную полилинию
          pointManager.clearRoute();
          alert('✅ Все метки и маршруты удалены с карты!');
        }
      }
      
    } else if (hasTemporary && !hasFavorites && !hasRoutes) {
      // Есть только временные метки
      message += `Будут удалены только временные метки.\nИзбранное и маршруты не затронуты.`;
      
      if (confirm(message)) {
        setMapClickMarkers([]);
        setSelectedMarkerIds((prev: string[]) => (prev || []).filter((id: string) => !id.startsWith('map-click-') && !id.startsWith('search-')));
        pointManager.clearRoute();
        alert('✅ Временные метки удалены!');
      }
      
    } else if (!hasTemporary && hasFavorites && !hasRoutes) {
      // Есть только избранное на карте
      message += `На карте только метки из избранного.\n\nУдалить их с карты? (из списка избранного они не удалятся)`;
      
      if (confirm(message)) {
        // Очищаем выбор только по подтверждению выше — оставляем выбор нетронутым здесь
        pointManager.clearRoute();
        alert('✅ Избранное убрано с карты! В списке избранного метки остались.');
      }
      
    } else if (!hasTemporary && !hasFavorites && hasRoutes) {
      // Есть только маршруты на карте
      message += `На карте только маршруты (${routesCount} шт.).\n\nУдалить их с карты? (из списка избранного маршруты останутся)`;
      
      if (confirm(message)) {
        setSelectedRouteIds([]);
        setDisplayedRoutePolylines([]);
        setRoutePolyline([]); // Очищаем основную полилинию
        // Удаляем точки маршрутов из единой системы
        selectedRouteIds.forEach(routeId => {
          try { 
            const pointsToRemove = activePoints.filter(p => p.source === 'route' && p.sourceId?.startsWith(`${routeId}:`));
            pointsToRemove.forEach(p => pointManager.removePoint(p.id));
          } catch {}
        });
        alert('✅ Маршруты убраны с карты! В списке избранного маршруты остались.');
      }
      
    } else {
      // Смешанный случай - есть несколько типов контента
      message += `На карте несколько типов контента.\n\nУдалить ВСЕ? (из списка избранного ничего не удалится)`;
      
      if (confirm(message)) {
        setMapClickMarkers([]);
        setSelectedMarkerIds([] as string[]);
        setSelectedRouteIds([]);
        setDisplayedRoutePolylines([]);
        setRoutePolyline([]); // Очищаем основную полилинию
        pointManager.clearRoute();
        alert('✅ Всё убрано с карты! В списке избранного всё осталось.');
      }
    }
  };


  // Единый источник меток для карты - используем активные точки из единой системы
  const allMapMarkers = useMemo(() => {
    if (!isMapReady) return [];
    
    const isValid = (lat: any, lon: any) => {
      const la = Number(lat);
      const lo = Number(lon);
      if (!Number.isFinite(la) || !Number.isFinite(lo)) return false;
      if (Math.abs(la) > 90 || Math.abs(lo) > 180) return false;
      // отсеиваем почти нулевые координаты (океан)
      if (Math.abs(la) < 0.0001 && Math.abs(lo) < 0.0001) return false;
      return true;
    };

    // Преобразуем активные точки в формат маркеров для карты
    const markers = activePoints
      .filter(point => point.isActive)
      .map(point => ({
        id: point.id,
        coordinates: point.coordinates,
        title: point.title,
        description: point.description || `Источник: ${point.source}`,
        source: point.source
      }))
      .filter(m => isValid(m.coordinates[0], m.coordinates[1]));
    
    console.log('🔧 allMapMarkers (единая система):', {
      activePoints: activePoints.length,
      markers: markers.length,
      sources: markers.map(m => m.source)
    });
    
    return markers;
  }, [activePoints, isMapReady]);

  // Мемоизированные пропсы для карты - единая система
  const mapProps = useMemo(() => {
    console.log('🔧 mapProps обновлены (единая система):', { 
      markersCount: allMapMarkers.length, 
      routeLineLength: unifiedRoutePolyline.length,
      displayedRoutesCount: displayedRoutePolylines.length,
      activePoints: activePoints.length,
      isBuilding
    });
    return {
    onMapReady: () => setIsMapReady(true),
    onMapClick: handleMapClick,
    onRemoveMarker: handleRemoveMarker,
      markers: allMapMarkers,
      // Если единая линия есть — используем её, иначе используем локальную routePolyline (совместимость)
      routeLine: (unifiedRoutePolyline && unifiedRoutePolyline.length > 0) ? unifiedRoutePolyline : routePolyline,
      displayedRoutePolylines,
    shouldCenterOnRoute,
      zones: showZonesLayer ? zones : [],
      suppressAutoFit: showCategoryModal
    };
  }, [allMapMarkers, unifiedRoutePolyline, displayedRoutePolylines, shouldCenterOnRoute, zones, showZonesLayer, showCategoryModal, activePoints.length, isBuilding]);

  // Экспортируем текущие маркеры карты для использования в редакторе маршрутов (через FavoritesPanel)
  useEffect(() => {
    try {
      const payload = allMapMarkers.map(m => ({ id: m.id, title: m.title, coordinates: m.coordinates }));
      localStorage.setItem('planner-current-markers', JSON.stringify(payload));
      localStorage.setItem('planner-selected-ids', JSON.stringify(selectedMarkerIds));
    } catch {}
  }, [allMapMarkers, selectedMarkerIds]);

  // Получение polyline маршрута через ORS при выборе маршрута - ТОЛЬКО КОГДА КАРТА ГОТОВА
  useEffect(() => {
    if (!isMapReady) return; // Не строим polyline, пока карта не готова
    
    try {
      if (selectedRoute && selectedRoute.points && Array.isArray(selectedRoute.points)) {
        // Нормализуем точки и фильтруем невалидные
        const toNumber = (v: any) => (v === null || v === undefined ? NaN : Number(v));
        const isFiniteNumber = (n: number) => typeof n === 'number' && Number.isFinite(n);
        const isValidLon = (lon: number) => isFiniteNumber(lon) && lon >= -180 && lon <= 180 && Math.abs(lon) > 0.00001;
        const isValidLat = (lat: number) => isFiniteNumber(lat) && lat >= -90 && lat <= 90 && Math.abs(lat) > 0.00001;
        const normalized: [number, number][] = (selectedRoute.points || [])
          .map(p => [toNumber((p as any).longitude), toNumber((p as any).latitude)] as [number, number])
          .filter(([lon, lat]) => isValidLon(lon) && isValidLat(lat));

        if (normalized.length < 2) {
          setRoutePolyline([]);
          return;
        }

        getRoutePolyline(normalized)
          .then(polyline => setRoutePolyline(polyline))
          .catch(() => setRoutePolyline([]));
    } else {
        setRoutePolyline([]);
      }
    } catch {
      setRoutePolyline([]);
    }
  }, [selectedRoute, isMapReady]);

  // Автоматическое построение маршрута — всегда по реальным точкам на карте (клики/поиск)
  useEffect(() => {
    if (!isMapReady) return;
    
    // Кандидаты: всегда реальные метки на карте (клики/поиск)
    const candidateMarkers = mapClickMarkers;
    if (candidateMarkers.length >= 2) {
      // Создаем уникальный ключ для текущего набора меток
      const currentRouteKey = candidateMarkers.map(m => m.id).sort().join('|');
      
      // Проверяем, не строили ли мы уже этот маршрут
      if (lastBuiltRoute === currentRouteKey) {
        return; // Маршрут уже построен, не перестраиваем
      }
      
      // Автоматически строим маршрут при наличии 2+ точек на карте
      const buildRouteFromSelectedMarkers = async () => {
        try {
          if (candidateMarkers.length >= 2) {
            // Строим маршрут через ORS
            const points: [number, number][] = candidateMarkers.map(marker => [
              Number(marker.coordinates[1]), // долгота
              Number(marker.coordinates[0])  // широта
            ]);
            
            const polyline = await getRoutePolyline(points);
            setRoutePolyline(polyline);
            
            // Запоминаем, что этот маршрут уже построен
            setLastBuiltRoute(currentRouteKey);
            
            // Сохраняем состояние маршрута в localStorage
            const routeState = {
              selectedMarkerIds,
              routePolyline: polyline,
              lastBuiltRoute: currentRouteKey
            };
            localStorage.setItem('planner-route-state', JSON.stringify(routeState));
          }
        } catch (error) {
          }
      };
      
      // Запускаем построение с небольшой задержкой для стабильности
      const timeoutId = setTimeout(() => {
        // Если открыто модальное окно категории, не дергаем карту
        if (showCategoryModal) return;
        buildRouteFromSelectedMarkers();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      // Очищаем маршрут, если на карте меньше 2 точек
      setRoutePolyline([]);
      setLastBuiltRoute(''); // Сбрасываем ключ построенного маршрута
    }
  }, [mapClickMarkers, isMapReady, lastBuiltRoute]);

  // Обработка routePoints при переходе с Map.tsx (жёсткая замена текущего набора)
  useEffect(() => {
    if (routePoints.length > 0) {
      // Полностью заменяем текущие временные маркеры на точки из контекста
      const nextMarkers = routePoints
        .map((p) => ({
              id: p.id,
              coordinates: [Number(p.latitude), Number(p.longitude)] as [number, number],
              title: p.title || 'Точка маршрута',
              description: p.description || 'Добавлено из избранного'
        }))
        .filter(m => Number.isFinite(m.coordinates[0]) && Number.isFinite(m.coordinates[1]) && !(Math.abs(m.coordinates[0]) < 0.0001 && Math.abs(m.coordinates[1]) < 0.0001));
      setMapClickMarkers(nextMarkers);

      // Выделяем строго эти точки (без домешивания старых)
      const markerIds = routePoints.map(p => p.id);
      setSelectedMarkerIds(markerIds as string[]);

      // Сбрасываем визуальное состояние маршрута для корректного авто‑построения
      setRoutePolyline([]);
      setLastBuiltRoute('');

      // Плавное авто‑центрирование на новом наборе
      triggerAutoCenter(900);

      // Очищаем буфер после применения
      clearRoutePoints();
    }
  }, [routePoints, clearRoutePoints]);

  // Фолбэк локального хранилища более не используется — всё через контекст
  useEffect(() => {}, [isMapReady]);

  // Восстановление состояния маршрута при загрузке компонента
  useEffect(() => {
    try {
      const savedRouteState = localStorage.getItem('planner-route-state');
      if (savedRouteState) {
        const routeState = JSON.parse(savedRouteState);
        
        // Проверяем, нужно ли сбрасывать состояние при перезагрузке
        const shouldResetOnReload = routeState.resetOnReload !== false;
        
        // Восстанавливаем состояние только если карта готова И пользователь явно не очистил маршрут И не требуется сброс
        if (isMapReady && routeState.shouldRestore !== false && !shouldResetOnReload) {
          // Восстанавливаем только если есть реальные данные
          if (routeState.selectedMarkerIds && routeState.selectedMarkerIds.length > 0) {
            setSelectedMarkerIds(routeState.selectedMarkerIds);
          }
          if (routeState.routePolyline && routeState.routePolyline.length > 0) {
            setRoutePolyline(routeState.routePolyline);
          }
          if (routeState.lastBuiltRoute) {
            setLastBuiltRoute(routeState.lastBuiltRoute);
          }
          
          // Устанавливаем флаг для центрирования на восстановленном маршруте
          if (routeState.routePolyline && routeState.routePolyline.length > 0) {
            triggerAutoCenter(1200);
          }
        }
      } else {
        // Если нет сохраненного состояния — НИЧЕГО не очищаем здесь,
        // чтобы не перетереть точки, пришедшие из Map/Favorites через контекст
        setRoutePolyline([]);
        setLastBuiltRoute('');
      }
      
      // Если требуется сброс при перезагрузке, очищаем localStorage
      if (savedRouteState) {
        const routeState = JSON.parse(savedRouteState);
        if (routeState.resetOnReload !== false) {
          localStorage.removeItem('planner-route-state');
        }
      }
      setShouldCenterOnRoute(false);
    } catch (error) {
      // При ошибке очищаем все
      setRoutePolyline([]);
      // Не очищаем глобальный выбор здесь, чтобы чекбоксы сохранялись
      setMapClickMarkers([]);
      setLastBuiltRoute('');
      setShouldCenterOnRoute(false);
    }
  }, [isMapReady]);

  // Автоматическое центрирование на маршруте при переключении в двухоконный режим
  useEffect(() => {
    if (layoutContext?.leftContent === 'planner' && layoutContext?.rightContent && routePolyline.length > 0) {
      // Плавное центрирование в двухоконном режиме
      triggerAutoCenter(1200);
    }
  }, [layoutContext?.leftContent, layoutContext?.rightContent, routePolyline.length]);

  // Обработчик построения маршрута из избранного - С АВТОМАТИЧЕСКИМ ПОСТРОЕНИЕМ
  const handleBuildRouteFromFavorites = (markerIds: string[]) => {
    if (!isMapReady) {
      alert('⏳ Подождите, карта еще загружается...');
      return;
    }
    
    // Добавляем точки из избранного в единую систему
    markerIds.forEach(markerId => {
      const favorite = favorites.find(f => f.id === markerId);
      if (favorite) {
        // Сначала удалим возможную старую точку с тем же sourceId, чтобы избежать дубликатов
        try { pointManager.removePointBySource('favorites', markerId); } catch {}
        // Добавим актуальную точку
        pointManager.addPoint({
          coordinates: [favorite.latitude, favorite.longitude],
          title: favorite.title,
          description: favorite.description || 'Из избранного',
          source: 'favorites',
          sourceId: markerId,
          address: favorite.title
        });
      }
    });
    
    // Обновляем выбранные ID в контексте
    setSelectedMarkerIds((prev: string[]) => ([...(prev || []), ...markerIds]));
    
    // Строим маршрут если достаточно точек
    if (canBuild) {
      pointManager.buildRoute();
    }
  };

  // Упрощенная функция построения маршрута - единая система
  const handleBuildRoute = async (routePointsFromForm?: Array<{ id: string; coordinates: [number, number]; title?: string; description?: string; address?: string }>) => {
    try {
      if (!isMapReady) {
        alert('⏳ Подождите, карта еще загружается...');
        return;
      }
      
      // Если переданы точки из формы, добавляем их в единую систему
      if (routePointsFromForm && routePointsFromForm.length > 0) {
        routePointsFromForm
          .filter(point => (point.address?.trim() || point.title?.trim()) && point.coordinates && Array.isArray(point.coordinates) && point.coordinates.length === 2)
          .forEach(point => {
            pointManager.addSearchPoint(
              point.address || point.title || 'Точка маршрута',
              [point.coordinates[0], point.coordinates[1]] // Уже в правильном формате [lat, lon]
            );
          });
      }
      
      // Проверяем, есть ли активные точки в unified системе
      if (activePoints.length < 2) {
        alert('🌿 Для построения маршрута нужно минимум 2 активные точки. Добавьте точки через:\n• Клик по карте\n• Поиск адресов\n• Выбор из избранного');
        return;
      }
      
      // Строим маршрут через unified систему
      await pointManager.buildRoute();
      
      alert(`✅ Маршрут построен из ${activePoints.length} активных точек!`);
      
    } catch (error) {
      alert(`❌ Ошибка построения маршрута: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  // Функция для перестроения маршрута с новыми точками
  const handleRebuildRoute = async (orderedPoints: Array<{ id: string; coordinates: [number, number]; title?: string; description?: string; address?: string }>) => {
    if (!isMapReady) {
      alert('⏳ Подождите, карта еще загружается...');
      return;
    }
    
    try {
      // Строим маршрут через ORS с новым порядком
      const points: [number, number][] = orderedPoints.map(point => [
        Number(point.coordinates[1]), // долгота
        Number(point.coordinates[0])  // широта
      ]);
      
      const polyline = await getRoutePolyline(points);
      setRoutePolyline(polyline);
      
      // Обновляем выбранные метки
      const newMarkerIds = orderedPoints.map(point => point.id);
      setSelectedMarkerIds(newMarkerIds as string[]);
      
      // Запоминаем, что этот маршрут уже построен
      setLastBuiltRoute(newMarkerIds.sort().join('|'));
      
      // Показываем сообщение об успехе
      alert('✅ Маршрут успешно перестроен с новым порядком следования!');
      
    } catch (error) {
      alert('❌ Ошибка перестроения маршрута. Попробуйте еще раз.');
    }
  };


  // Функция финального сохранения маршрута с названием (УДАЛЕНА - теперь используется handleCategoryConfirm)
  const handleFinalSaveRoute_DEPRECATED = async () => {
    if (!token) {
      alert('🔐 Для сохранения маршрута необходимо войти в систему');
      return;
    }

    // Проверяем маршрут на пересечение с запрещёнными зонами
    if (routePolyline.length > 0) {
      try {
        const zoneResults = await checkRoute(routePolyline);
        if (zoneResults.length > 0) {
          const criticalZones = zoneResults.filter((z: any) => z.severity === 'critical');
          const restrictedZones = zoneResults.filter((z: any) => z.severity === 'restricted');
          
          if (criticalZones.length > 0) {
            alert(`🚫 Невозможно создать маршрут: пересечение с критическими зонами (${criticalZones.length}). Включите слой "Запрещённые зоны" для просмотра.`);
            return;
          }
          
          if (restrictedZones.length > 0) {
            const proceed = confirm(`⚠️ Маршрут пересекает ограниченные зоны (${restrictedZones.length}). Рекомендуется включить слой "Запрещённые зоны" для проверки. Продолжить создание маршрута?`);
            if (!proceed) return;
          }
        }
      } catch (error) {
        console.warn('Ошибка проверки зон:', error);
      }
    }

    try {
      // Сначала сохраняем клик-метки в базу данных, чтобы получить реальные UUID
      const clickMarkersToSave = allMapMarkers.filter(marker => marker.source === 'click');
      const savedMarkerIds: string[] = [];

      if (clickMarkersToSave.length > 0) {
        for (const marker of clickMarkersToSave) {
          try {
                         const markerData = {
               title: marker.title,
               description: marker.description || 'Добавлена кликом на карту',
               latitude: marker.coordinates[1],
               longitude: marker.coordinates[0],
               category: 'other',
               visibility: 'private'
             };

            const response = await apiClient.post('/markers', markerData);

            const savedMarker = response.data;
            savedMarkerIds.push(savedMarker.id);
          } catch (error) {
            throw new Error(`Ошибка при сохранении метки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
          }
        }
      }

      // Теперь создаем маршрут с правильными UUID
      const waypoints: Array<{ marker_id: string; order_index: number }> = [];
      let waypointIndex = 0;

      // Добавляем метки из избранного (у них уже есть UUID)
      const favoritesMarkers = allMapMarkers.filter(marker => marker.source === 'favorites');
      favoritesMarkers.forEach(marker => {
        // Проверяем, что ID является валидным UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(String(marker.id))) {
          waypoints.push({
            marker_id: String(marker.id), // Это уже UUID из базы
            order_index: waypointIndex++
          });
        } else {
          console.warn('Пропускаем метку из избранного с невалидным UUID:', marker.id);
        }
      });

      // Добавляем сохраненные клик-метки
      savedMarkerIds.forEach(markerId => {
        waypoints.push({
          marker_id: markerId, // Это реальный UUID из базы
          order_index: waypointIndex++
        });
      });

      // Если нет меток, создаем пустой маршрут
      if (waypoints.length === 0) {
        alert('Для создания маршрута нужно добавить хотя бы одну метку на карту');
        return;
      }

      // Проверка зон перед созданием маршрута
      const routeCoords = allMapMarkers.map(marker => [marker.coordinates[0], marker.coordinates[1]] as [number, number]);
      const zoneResults = await checkRoute(routeCoords);
      const hasRestrictions = Array.isArray(zoneResults) && zoneResults.length > 0;
      
      if (hasRestrictions) {
        const zoneNames = zoneResults.flatMap((r: any) => r.zones?.map((z: any) => z.name)).filter(Boolean).join(', ');
        const hasCritical = zoneResults.some((r: any) => r.zones?.some((z: any) => (z.severity || 'restricted') === 'critical'));
        
        if (hasCritical) {
          alert(`🚫 Маршрут проходит через критическую зону: ${zoneNames}. Создание запрещено.`);
          return;
        }
        
        const proceed = window.confirm(`⚠️ Маршрут проходит через ограниченную зону: ${zoneNames}. Продолжить создание?`);
        if (!proceed) {
          return;
        }
      }

      // ВАЛИДАЦИЯ ОТКЛЮЧЕНА - используем все метки
      // Используем только валидные точки для сохранения
      const isFiniteNumber = (n: number) => typeof n === 'number' && Number.isFinite(n);
      const isValid = (lat: number, lon: number) => isFiniteNumber(lat) && isFiniteNumber(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && !(Math.abs(lat) < 0.00001 && Math.abs(lon) < 0.00001);
      const validMarkers = allMapMarkers.filter(m => isValid(m.coordinates[0], m.coordinates[1]));

      // Формируем точки маршрута для сохранения (карта хранит [lat, lon])
      const pointsForRouteData = validMarkers.map(marker => ({
        id: String(marker.id),
        latitude: marker.coordinates[0],
        longitude: marker.coordinates[1],
        title: marker.title,
        description: marker.description
      }));

      const routeData = {
        title: `Маршрут ${new Date().toLocaleDateString()}`,
        description: `Маршрут через ${validMarkers.length} мест`,
        start_date: undefined,
        end_date: undefined,
        transport_type: ['car'],
        // Каноничные точки маршрута для дальнейшего отображения (формат Яндекс)
        points: pointsForRouteData,
        route_data: {
          points: pointsForRouteData,
          metadata: {
            totalDistance: 0,
            estimatedDuration: 0,
            estimatedCost: 0,
            difficultyLevel: 1,
            transportType: ['car'],
            tags: [],
            ...(hasRestrictions && { restrictedZones: zoneResults })
          },
          settings: {
            isPublic: false // Все маршруты приватные по умолчанию
          }
        },
        total_distance: 0,
        estimated_duration: 0,
        estimated_cost: 0,
        difficulty_level: 1,
        is_public: false,
        tags: [],
        waypoints: waypoints
      };

      let newRoute;
      try {
        console.log('📤 Отправляем данные маршрута:', JSON.stringify(routeData, null, 2));
        newRoute = await createRoute(routeData, token);
        console.log('✅ Маршрут создан успешно:', newRoute);
        setLastRouteCreated(newRoute.title);
      } catch (error) {
        console.error('Error creating route:', error);
        alert('Ошибка при создании маршрута: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
        return;
      }

      // Добавляем созданный маршрут в избранное (с каноничными точками)
      if (favoritesContext && 'addFavoriteRoute' in favoritesContext) {
        try {
          favoritesContext.addFavoriteRoute({
            id: newRoute.id,
            title: newRoute.title || 'Без названия',
            distance: 0, // TODO: вычислить реальное расстояние
            duration: 0, // TODO: вычислить реальную продолжительность
            rating: 0,
            likes: 0,
            isOriginal: true,
            parentRouteId: undefined,
            points: pointsForRouteData // Передаем статичные точки маршрута
          } as any);
          } catch (e) {
          }
      }

      // Принудительно обновляем панель избранного для отображения нового маршрута
      setFavoritesPanelKey(prev => prev + 1);

      // Вдохновляющее сообщение об успехе
      const saveMessages = [
        `🎉 "${newRoute.title}" успешно сохранён! Спасибо за вклад в наше сообщество путешественников`,
        `✨ Маршрут "${newRoute.title}" готов! Другие путешественники смогут им вдохновиться`,
        `🌟 "${newRoute.title}" добавлен в вашу коллекцию! Продолжайте открывать новые места`,
        `💫 Путешествие "${newRoute.title}" сохранено! Вы создаёте что-то особенное`
      ];
      
      const message = saveMessages[Math.floor(Math.random() * saveMessages.length)];
      alert(message);

      // После сохранения:
      // 1) Сбрасываем чекбоксы меток (избранное больше не активно)
      // 2) Чистим временные метки с карты
      // 3) Автоматически активируем чекбокс сохранённого маршрута и отображаем его на карте
      try {
        const nr: any = newRoute as any;
        const createdPoints = (nr && nr.route_data && Array.isArray(nr.route_data.points))
          ? nr.route_data.points
          : pointsForRouteData;
        const newRouteData = {
          id: newRoute.id,
          title: newRoute.title || `Маршрут ${new Date().toLocaleDateString()}`,
          description: newRoute.description || `Маршрут через ${validMarkers.length} мест`,
          points: createdPoints,
          waypoints: newRoute.waypoints || [],
          createdAt: newRoute.createdAt,
          updatedAt: newRoute.updatedAt
        } as RouteData;

        // Снять выбор меток и убрать временные клик-метки с карты
        setSelectedMarkerIds([] as string[]);
      setMapClickMarkers([]);

        // Активировать чекбокс маршрута (ограничение до 3 одновременно)
        setSelectedRouteIds(prev => {
          const next = [...prev, newRoute.id];
          return next.length > 3 ? next.slice(next.length - 3) : next;
        });

        // Маршрут автоматически добавляется в displayedRoutePolylines при построении полилинии

        // Строим полилинию для нового маршрута и добавляем её в отображаемые
        try {
          const toNum = (v: any) => (v === null || v === undefined ? NaN : Number(v));
          const norm: [number, number][] = (newRouteData.points || [])
            .map((p: any) => [toNum(p.longitude), toNum(p.latitude)] as [number, number])
            .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));
          if (norm.length >= 2) {
            const poly = await getRoutePolyline(norm);
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
            const color = colors[(selectedRouteIds.length + 1) % colors.length];
            setDisplayedRoutePolylines(prev => [...prev, { id: newRouteData.id, polyline: poly, color }]);
          }
        } catch (e) {
          // Фолбэк: простая линия [lat,lon]
          const simple: [number, number][] = (newRouteData.points || [])
            .map((p: any) => [Number(p.latitude), Number(p.longitude)] as [number, number])
            .filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon));
          if (simple.length >= 2) {
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
            const color = colors[(selectedRouteIds.length + 1) % colors.length];
            setDisplayedRoutePolylines(prev => [...prev, { id: newRouteData.id, polyline: simple, color }]);
          }
        }

        // Выбираем маршрут в детальной панели
        setSelectedRoute(newRouteData as any);
      } catch {}
      // Сохраняем данные маршрута и показываем модальное окно выбора категории
      setPendingRouteData({
        title: `Маршрут ${new Date().toLocaleDateString()}`,
        points: pointsForRouteData
      });
      setShowCategoryModal(true);
      
    } catch (error) {
      alert(`❌ Не удалось сохранить маршрут: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}\n\nПопробуйте ещё раз или обратитесь в поддержку.`);
    }
  };

  const handleCategoryConfirm = async (routeData: RouteCreationData) => {
    if (!token || !pendingRouteData) {
      alert('❌ Ошибка: нет данных для создания маршрута');
      return;
    }

    try {
      // Сначала сохраняем клик-метки в базу данных, чтобы получить реальные UUID
      const clickMarkersToSave = allMapMarkers.filter(marker => marker.source === 'click');
      const savedMarkerIds: string[] = [];

      if (clickMarkersToSave.length > 0) {
        for (const marker of clickMarkersToSave) {
          try {
            const markerData = {
              title: marker.title,
              description: marker.description || 'Добавлена кликом на карту',
              latitude: marker.coordinates[1],
              longitude: marker.coordinates[0],
              category: 'other',
              visibility: 'private'
            };

            const response = await apiClient.post('/markers', markerData);
            const savedMarker = response.data;
            savedMarkerIds.push(savedMarker.id);
          } catch (error) {
            console.error('Ошибка сохранения маркера:', error);
          }
        }
      }

      const routePayload = {
        title: routeData.title,
        description: routeData.description || `Маршрут создан ${new Date().toLocaleDateString()}`,
        points: pendingRouteData.points,
        waypoints: pendingRouteData.points.map((point, index) => ({
          marker_id: point.id,
          order_index: index,
          notes: point.description || ''
        })),
        route_data: {
          points: pendingRouteData.points,
          category: routeData.category,
          purpose: routeData.purpose,
          tags: routeData.tags,
          visibility: routeData.visibility,
          isTemplate: routeData.isTemplate
        }
      };

      const newRoute = await createRoute(routePayload, token);
      
      if (!newRoute || !newRoute.id) {
        alert('❌ Ошибка при создании маршрута');
        return;
      }

      // Добавляем созданный маршрут в избранное с новыми полями
      if (favoritesContext && 'addFavoriteRoute' in favoritesContext) {
        try {
          favoritesContext.addFavoriteRoute({
            id: newRoute.id,
            title: newRoute.title || 'Без названия',
            distance: 0, // TODO: вычислить реальное расстояние
            duration: 0, // TODO: вычислить реальную продолжительность
            rating: 0,
            likes: 0,
            isOriginal: true,
            parentRouteId: undefined,
            points: pendingRouteData.points, // Передаем статичные точки маршрута
            // Новые поля
            category: routeData.category,
            purpose: routeData.purpose,
            tags: routeData.tags,
            description: routeData.description,
            visibility: routeData.visibility,
            isTemplate: routeData.isTemplate,
            lastUsed: new Date(),
            usageCount: 0,
            relatedContent: {}
          } as any);
        } catch (e) {
          console.error('Ошибка добавления в избранное:', e);
        }
      }

      // Принудительно обновляем панель избранного для отображения нового маршрута
      setFavoritesPanelKey(prev => prev + 1);

      // Вдохновляющее сообщение об успехе
      const saveMessages = [
        `🎉 "${newRoute.title}" успешно сохранён в категории "${routeData.category}"!`,
        `✨ Маршрут "${newRoute.title}" готов! Другие путешественники смогут им вдохновиться`,
        `🌟 "${newRoute.title}" добавлен в вашу коллекцию! Продолжайте открывать новые места`,
        `💫 Путешествие "${newRoute.title}" сохранено! Вы создаёте что-то особенное`
      ];
      
      const message = saveMessages[Math.floor(Math.random() * saveMessages.length)];
      alert(message);

      // После сохранения:
      setLastRouteCreated(newRoute.id);
      setPendingRouteData(null);
      
      // Очищаем выбранные маркеры и клик-метки
      setSelectedMarkerIds([]);
      setMapClickMarkers([]);
      
      // Автоматически выбираем созданный маршрут для отображения
      setSelectedRouteIds(prev => {
        const next = [...prev, newRoute.id];
        return next.length > 3 ? next.slice(next.length - 3) : next;
      });

      // Строим полилинию для нового маршрута
      try {
        const toNum = (v: any) => (v === null || v === undefined ? NaN : Number(v));
        const norm: [number, number][] = pendingRouteData.points
          .map((p: any) => [toNum(p.longitude), toNum(p.latitude)] as [number, number])
          .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));
        
        if (norm.length >= 2) {
          const poly = await getRoutePolyline(norm);
          const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
          const color = colors[(selectedRouteIds.length + 1) % colors.length];
          setDisplayedRoutePolylines(prev => [...prev, { id: newRoute.id, polyline: poly, color }]);
        }
      } catch (e) {
        // Фолбэк: простая линия [lat,lon]
        const simple: [number, number][] = pendingRouteData.points
          .map((p: any) => [Number(p.latitude), Number(p.longitude)] as [number, number])
          .filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon));
        
        if (simple.length >= 2) {
          const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
          const color = colors[(selectedRouteIds.length + 1) % colors.length];
          setDisplayedRoutePolylines(prev => [...prev, { id: newRoute.id, polyline: simple, color }]);
        }
      }
      
    } catch (error) {
      console.error('Ошибка при создании маршрута:', error);
      alert('❌ Ошибка при создании маршрута: ' + (error as Error).message);
    }
  };

  return (
    <>
    <MirrorGradientContainer className="page-layout-container page-container planner-mode">
      <div className="page-main-area">
        <div className="page-content-wrapper">
          <div className="page-main-panel relative">
            {/* Кнопки управления по бокам */}
            <div 
              className="page-side-buttons left"
              style={{
                '--left-button-size': '47px',
                '--left-button-border-width': '2px',
                '--left-button-border-color': '#8E9093',
                '--left-button-bg': '#ffffff',
                // ВЫРАВНИВАНИЕ ПО ВЕРТИКАЛИ И РАЗДВИГАНИЕ
    top: '55%',            // поднимите/опустите блок целиком (например, '45%' / '55%')
    transform: 'translateY(-50%)',
    gap: '14px'            // расстояние между двумя левыми кнопками
              } as React.CSSProperties}
            >
              {/* Настройки карты (вверху) */}
              <button
                className="page-side-button left"
                onClick={() => setSettingsOpen(true)}
                title="Настройки карты"
              >
                <FaCog className="text-gray-600" size={20} />
              </button>

            </div>
            
            {/* Правая группа кнопок с настраиваемыми переменными для страницы Planner */}
            <div
              className="page-side-buttons right"
              style={{
                '--right-top': '57%',
                '--right-translateY': '-50%',
                '--right-offset': '17px',
                '--right-gap': '15px',
                '--right-button-size': '47px',
                '--right-button-border-width': '2px',
                '--right-button-border-color': '#8E9093',
                '--right-button-bg': '#ffffff',
              } as React.CSSProperties}
            >
              <button
                className="page-side-button right"
                onClick={() => setFavoritesOpen(true)}
                title="Избранное"
              >
                <FivePointStar color="#EE8E1D" size={20} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* Кнопка "Порядок следования" убрана - функциональность перенесена в настройки маршрута */}
            </div>

            {/* --- Кнопка слоёв --- */}
            {/* Удалить импорт FaLayerGroup */}
            {/* Удалить объявление LAYER_OPTIONS */}
            {/* Основной контент */}
            <div className="h-full relative">
              <div className="map-content-container">
                {/* Заголовок контента - СТАБИЛИЗИРОВАН */}
                <StableHeader showZonesLayer={showZonesLayer} setShowZonesLayer={setShowZonesLayer} />

                {/* Область контента */}
                <div className="map-area">
                  <div className="full-height-content relative">
                    {/* Индикатор загрузки карты */}
                    {!isMapReady && (
                      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Загрузка карты...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Карта - НАСТОЯЩЕ СТАБИЛИЗИРОВАННАЯ */}
                    <StableMap {...mapProps} />
                  </div>
                </div>
              </div>
            </div>

            {/* Левая выдвигающаяся панель с настройками */}
            <div 
              className={`page-slide-panel left ${settingsOpen ? 'open' : ''}`}
            >
              <div className="page-slide-panel-content">
                {/* Аккордеон настроек - растянутый на всю панель */}
                <div className="w-full h-full flex flex-col">
                  <PlannerAccordion
                    onBuildRoute={(points) => {
                      // Добавляем точки из поиска в единую систему
                      if (points && points.length > 0) {
                        points.forEach(point => {
                          if (point.address && point.coordinates) {
                            pointManager.addSearchPoint(point.address, point.coordinates);
                          }
                        });
                      }
                      // Строим маршрут если достаточно точек
                      if (canBuild) {
                        pointManager.buildRoute();
                      }
                    }}
                    onSettingsChange={() => {}}
                    onClose={() => setSettingsOpen(false)}
                    
                    // Единая система построения маршрутов
                    activePoints={activePoints}
                    onRemovePoint={pointManager.removePoint}
                    onTogglePoint={pointManager.togglePoint}
                    onReorderPoints={pointManager.reorderPoints}
                    onAddCoordinatePoint={() => {
                      // Показываем модальное окно ввода координат
                      setShowCoordinateInput(true);
                    }}
                    onAddSearchPoint={() => {
                      // Показываем форму поиска
                      setShowSearchForm(true);
                    }}
                    onAddSearchPointFromForm={(address: string, coordinates: [number, number]) => {
                      // Добавляем точку из формы поиска в единую систему
                      pointManager.addSearchPoint(address, coordinates);
                    }}
                    onAddFavoritePoint={() => {
                      // Показываем панель избранного
                      setFavoritesOpen(true);
                    }}
                    onBuildRouteFromPoints={pointManager.buildRoute}
                    canBuildRoute={canBuild}
                    isBuilding={isBuilding}
                    showSearchForm={showSearchForm}
                    onSearchFormClose={() => setShowSearchForm(false)}
                    routeStats={stats}
                  />
                  
                  {/* Метки теперь отображаются в PlannerAccordion в секции "Метки маршрута" */}
                </div>
              </div>
            </div>

            {/* Правая выдвигающаяся панель с избранным */}
            <div 
              className={`page-slide-panel right ${favoritesOpen ? 'open' : ''}`}
            >
              <div className="page-slide-panel-content">
                  <FavoritesPanel
                    favorites={favorites}
                    routes={convertedRoutes}
                    isVip={false}
                    onRemove={(id) => {
                      removeFavoritePlace(id);
                      setSelectedMarkerIds((prev: string[]) => (prev || []).filter((markerId: string) => markerId !== id));
                    }}
                    onClose={() => setFavoritesOpen(false)}
                  onBuildRoute={handleBuildRouteFromFavorites}
                    onMoveToPlanner={(ids) => {
                      // Переносим выбранные метки в планировщик через единую систему
                      const selectedMarkers = ids
                        .map(id => favorites.find((m: any) => m.id === id))
                        .filter((m): m is MarkerData => Boolean(m));
                      
                      // Добавляем каждую метку через единую систему
                      selectedMarkers.forEach(marker => {
                        pointManager.addPoint({
                          coordinates: [Number(marker.latitude), Number(marker.longitude)],
                          title: marker.title,
                          description: marker.description || 'Из избранного',
                          source: 'favorites',
                          sourceId: marker.id,
                          address: marker.title
                        });
                      });
                      
                      setSelectedMarkerIds(ids);
                      
                      // Автоматически строим маршрут если достаточно точек
                      setTimeout(() => {
                        if (canBuild) {
                          pointManager.buildRoute().catch(error => {
                            console.warn('Ошибка построения маршрута после переноса из избранного:', error);
                          });
                        }
                      }, 200);
                      
                      alert(`✅ ${ids.length} меток перенесено в планировщик!`);
                    }}
                    onMoveToMap={(ids) => {
                      // Пишем напрямую в контекст, без промежуточного localStorage
                      setSelectedMarkerIds(Array.isArray(ids) ? ids : []);
                      setFavoritesOpen(true);
                      (window as any).appNavigate
                        ? (window as any).appNavigate('/map')
                        : (window.location.href = '/map');
                    }}
                    onLoadRoute={async (route, mode) => {
                      if (!route) {
                        alert('Ошибка: маршрут не найден');
                        return;
                      }
                      
                      // Проверяем, не отображается ли уже этот маршрут через чекбокс
                      if (selectedRouteIds.includes(route.id)) {
                        alert('⚠️ Этот маршрут уже отображается на карте. Используйте чекбокс для управления его видимостью.');
                        return;
                      }
                      
                      // Преобразуем EnhancedRouteData в RouteData для совместимости
                      const routeData: RouteData = {
                        id: route.id,
                        title: route.title,
                        description: route.description,
                        points: route.points || [],
                        createdAt: route.createdAt,
                        updatedAt: route.updatedAt,
                        is_user_modified: route.is_user_modified,
                        used_in_blogs: route.used_in_blogs
                      };
                      
                      setSelectedRoute(routeData);
                      
                      // Добавляем точки маршрута на карту как метки
                      if (route.points && route.points.length > 0) {
                        const routeMarkers = route.points
                          .map((point: any, index: number) => {
                            const lat = Number(point.latitude);
                            const lon = Number(point.longitude);
                            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
                            return {
                              id: point.id || `route-point-${index}`,
                              coordinates: [lat, lon] as [number, number], // карта ожидает [широта, долгота]
                              title: point.title || `Точка ${index + 1}`,
                              description: point.description || '',
                              source: 'route' as const
                            };
                          })
                          .filter(Boolean) as Array<{ id: string; coordinates: [number, number]; title: string; description: string; source: 'route' }>;

                        if (routeMarkers.length > 0) {
                          setMapClickMarkers((prev: any) => [...prev, ...routeMarkers]);
                          setSelectedMarkerIds(routeMarkers.map(m => m.id));
                        }
                      }
                      
                      alert(`✅ Маршрут "${route.title}" загружен! ${route.points?.length || 0} точек добавлено на карту.`);
                    }}
                    onRouteToggle={handleRouteToggle}
                    mode="planner"
                    initialTab={favoritesTab}
                    selectedMarkerIds={selectedMarkerIds}
                    onSelectedMarkersChange={setSelectedMarkerIds}
                    selectedRouteIds={selectedRouteIds}
                    onSelectedRouteIdsChange={setSelectedRouteIds}
                  isOpen={favoritesOpen}
                  />
              </div>
            </div>


            {/* Затемнение при открытых панелях */}
            <div className={`page-overlay ${(settingsOpen || favoritesOpen) ? 'active' : ''}`} />
          </div>
        </div>
      </div>
    </MirrorGradientContainer>

    {/* Плавающие кнопки действий */}
    <div className="fixed bottom-6 z-50 flex gap-3 left-1/2 -translate-x-1/2">
      {/* Кнопка очистки карты - показывается при наличии объектов */}
      {(allMapMarkers?.length > 0 || displayedRoutePolylines.length > 0) && (
        <button
          onClick={handleClearAllClickMarkers}
          className="px-4 py-3 rounded-full shadow-xl text-white bg-red-500 hover:bg-red-600 transition-colors"
          style={{
            border: '2px solid rgba(0,0,0,0.12)'
          }}
          title="Очистить карту"
        >
          🗑️ Очистить
        </button>
      )}
      
      {/* Кнопка создания маршрута - показывается при наличии 2+ меток */}
      {(allMapMarkers?.length || 0) >= 2 && (
        <button
          onClick={() => {
            // Фильтруем только валидные маркеры с координатами
            const validMarkers = allMapMarkers.filter(marker => 
              marker.coordinates && 
              marker.coordinates.length === 2 && 
              typeof marker.coordinates[0] === 'number' && 
              typeof marker.coordinates[1] === 'number' &&
              !isNaN(marker.coordinates[0]) && 
              !isNaN(marker.coordinates[1]) &&
              marker.coordinates[0] !== 0 && 
              marker.coordinates[1] !== 0
            );

            if (validMarkers.length < 2) {
              alert('⚠️ Недостаточно валидных точек для создания маршрута');
              return;
            }

            // Подготавливаем точки для маршрута
            const pointsForRouteData = validMarkers.map(marker => ({
        id: marker.id,
        title: marker.title,
              description: marker.description || '',
              latitude: marker.coordinates[0], // Широта
              longitude: marker.coordinates[1]  // Долгота
            }));

            // Сохраняем данные маршрута и показываем модальное окно выбора категории
            setPendingRouteData({
              title: `Маршрут ${new Date().toLocaleDateString()}`,
              points: pointsForRouteData
            });
            setShowCategoryModal(true);
          }}
          className="px-6 py-3 rounded-full shadow-xl text-white"
          style={{
            background: 'linear-gradient(90deg, #FF6B6B 0%, #FFD93D 50%, #6BCB77 100%)',
            border: '2px solid rgba(0,0,0,0.12)'
          }}
        >
          Создать маршрут
        </button>
      )}
    </div>


    {/* Уведомление о последнем созданном маршруте */}
    {lastRouteCreated && (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <FaHeart className="text-white" />
          <span>Маршрут "{lastRouteCreated}" создан!</span>
        </div>
      </div>
    )}
      {/* Модальное окно перестроения маршрута */}
      <RouteRebuildModal
        isOpen={isRebuildModalOpen}
        onClose={() => setIsRebuildModalOpen(false)}
        onRebuildRoute={handleRebuildRoute}
        existingPoints={allMapMarkers
          .filter(marker => selectedMarkerIds.includes(marker.id))
          .map(marker => ({
            id: marker.id,
            title: marker.title,
            coordinates: marker.coordinates,
            description: marker.description,
            category: 'category' in marker ? (marker.category as string) : 'other',
            isFavorite: marker.id.startsWith('favorite-'),
            isNew: false
          }))}
        newPoints={mapClickMarkers
          .filter(marker => !selectedMarkerIds.includes(marker.id))
          .map(marker => ({
            id: marker.id,
            title: marker.title,
            coordinates: marker.coordinates,
            description: marker.description,
            category: 'category' in marker ? (marker.category as string) : 'other',
            isFavorite: false,
            isNew: true
          }))}
      />

      {/* Панель порядка следования убрана - функциональность перенесена в настройки маршрута */}
      
      {/* Новое модальное окно выбора категории маршрута */}
      <RouteCategorySelector
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(category, visibility) => {
          // Преобразуем данные для совместимости со старой системой
          const routeData: RouteCreationData = {
            title: pendingRouteData?.title || 'Новый маршрут',
            description: undefined,
            category: category.id,
            purpose: category.purpose,
            tags: [],
            visibility,
            isTemplate: false
          };
          handleCategoryConfirm(routeData);
        }}
        routeTitle={pendingRouteData?.title || 'Новый маршрут'}
        pointsCount={pendingRouteData?.points?.length || 0}
      />

      {/* Модальное окно ввода координат */}
      {showCoordinateInput && (
        <CoordinateInput
          onAdd={(data) => {
            // Добавляем точку через единую систему
            pointManager.addCoordinatePoint([data.latitude, data.longitude], data.title);
            setShowCoordinateInput(false);
          }}
          onClose={() => setShowCoordinateInput(false)}
        />
      )}

      {/* Отладочная информация */}
      {debugInfo && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999,
          maxWidth: '90%',
          wordBreak: 'break-all'
        }}>
          {debugInfo}
        </div>
      )}
    </>
  );
};

export default Planner; 