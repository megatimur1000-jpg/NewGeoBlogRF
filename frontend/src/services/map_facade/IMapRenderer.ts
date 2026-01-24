// Общие типы и интерфейс для адаптеров карт
export type MapContext = 'osm' | 'planner' | 'offline';

export type GeoPoint = {
  lat: number;
  lon: number;
};

export type LatLng = [number, number];

export type MapConfig = {
  center?: GeoPoint | LatLng;
  zoom?: number;
  markers?: UnifiedMarker[];
  [k: string]: any;
};

export interface UnifiedMarker {
  name: string | undefined;
  id: string;
  coordinates: GeoPoint;
  type?: string;
  shape?: string;
  color?: string;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
  popupContent?: any;
  // Доп. поля, используемые рендерами
  title?: string;
  description?: string;
  category?: string;
  iconSize?: [number, number];
  routeMarker?: string;
}

export interface PersistedRoute {
  id: string;
  waypoints: GeoPoint[];
  geometry?: any;
  distance?: number;
  duration?: number;
  createdAt?: Date;
}

export interface TrackedRoute {
  id: string;
  points: GeoPoint[];
  startTime: Date;
  endTime: Date;
  distance: number;
  duration: number;
  metadata?: any;
  bbox?: Bounds | null;
}

export interface CalendarEvent {
  id: string;
  title?: string;
  location?: { coordinates: GeoPoint };
  category?: any;
  startAt?: string | Date;
  [k: string]: any;
}

export type FavoriteItem = any;

export type DraftPost = any;
export type DraftMarker = any;
export type DraftRoute = any;
export type DraftEvent = any;


export interface MapMarker {
  id?: string;
  lat: number;
  lon: number;
  category?: string;
  type?: string;
  title?: string;
  description?: string;
  iconSize?: [number, number];
  routeMarker?: string;
  iconUrl?: string;
}

export interface Route {
  id?: string;
  points: Array<[number, number]>; // [lat, lon]
  geometry?: any;
}

export interface RouteStats {
  distance: number;
  duration: number;
  [k: string]: any;
}

export interface Bounds {
  north?: number;
  south?: number;
  east?: number;
  west?: number;
  // Альтернативный формат, который используется в некоторых компонентах
  southWest?: [number, number];
  northEast?: [number, number];
}

export type MapAnalyticsEvent = { action: string } & Record<string, any>;

export interface MapActionButton {
  id: string;
  icon: string;
  tooltip?: string;
  badge?: number;
  active?: boolean;
}

export type DateRange = { from: Date; to: Date };


export interface MapFacadeDependencies {
  accessControlService: { isPremium: () => boolean };
  storageService: {
    getDownloadedRegions: () => string[];
    addToFavorites?: (item: any) => void;
    getFavorites?: () => any[];
    removeFromFavorites?: (id: string) => void;
    saveRoute?: (r: PersistedRoute) => void;
    downloadRegion?: (id: string) => Promise<void>;
    deleteRegion?: (id: string) => Promise<void>;
  };
  notificationService?: { notify?: (opts: { type?: string; title?: string; message?: string }) => void };
  userService?: { getCurrentUser?: () => { id?: string } };
  offlineContentQueue: { saveDraft?: (type: string, draft: any) => Promise<void>; syncPosts?: () => Promise<void>; getDrafts?: (type?: string) => Promise<any[]>; syncAll?: () => Promise<void> };
  moderationService: { submitPost?: (d: any) => Promise<void> };
  eventsStore: { getEvents?: (range: DateRange) => Promise<CalendarEvent[]> };
  gamificationFacade: { recordAction?: (action: string, meta?: any) => Promise<void>; isActionRateLimited?: (action: string) => boolean };
  activityService: { recordActivity?: (a: any) => void };
  analyticsOrchestrator: { trackMapInteraction?: (e: MapAnalyticsEvent) => void };
}

export interface IMapRenderer {
  init(containerId: string, config?: MapConfig): Promise<void>;
  renderMarkers(markers: UnifiedMarker[]): void;
  renderRoute(route: PersistedRoute): void;
  // optional remove helpers used by facade
  removeMarker?: (id: string) => void;
  removeRoute?: (id: string) => void;
  setView(center: GeoPoint, zoom: number): void;
  // clear может быть опциональным — некоторые рендереры не реализуют его
  clear?: () => void;
  destroy(): void;
  planRoute?(waypoints: GeoPoint[]): Promise<PersistedRoute>;
  // Дополнительные hooks
  onClick?(handler: (latLng: [number, number]) => void): void;
  // Методы для двухоконного режима - опциональные
  setMapMargin?(rightMargin: number): void;
  resetMapMargin?(): void;
}
