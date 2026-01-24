/**
 * Типы для работы с географическими границами РФ
 */

export interface RussiaBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface RussiaCenter {
  latitude: number;
  longitude: number;
}

export interface RussiaCity {
  name: string;
  lat: number;
  lng: number;
  distance?: number;
}

export interface RouteValidationResult {
  isValid: boolean;
  invalidPoints: number[];
  message?: string;
}

export interface RussiaMapBounds {
  center: RussiaCenter;
  bounds: RussiaBounds;
}

export interface CoordinateValidationResult {
  isValid: boolean;
  errorMessage?: string;
  nearestCity?: RussiaCity;
}

export type RussiaRegion = 
  | 'central'      // Центральный федеральный округ
  | 'northwestern' // Северо-Западный федеральный округ
  | 'southern'     // Южный федеральный округ
  | 'northcaucasus' // Северо-Кавказский федеральный округ
  | 'volga'        // Приволжский федеральный округ
  | 'ural'         // Уральский федеральный округ
  | 'siberian'     // Сибирский федеральный округ
  | 'fareastern';  // Дальневосточный федеральный округ

export interface RussiaRegionInfo {
  id: RussiaRegion;
  name: string;
  bounds: RussiaBounds;
  center: RussiaCenter;
  majorCities: RussiaCity[];
}

export interface GeographicRestrictionConfig {
  enabled: boolean;
  strictMode: boolean;
  bufferZoneKm: number;
  allowedRegions?: RussiaRegion[];
  blockedRegions?: RussiaRegion[];
}

export interface RussiaComplianceSettings {
  geographicRestrictions: GeographicRestrictionConfig;
  contentModeration: {
    enabled: boolean;
    strictMode: boolean;
  };
  userInteraction: {
    chatEnabled: boolean;
    realtimeEnabled: boolean;
    userToUserMessaging: boolean;
  };
}
