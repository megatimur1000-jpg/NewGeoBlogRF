/**
 * Конфигурация для работы в РФ
 */

import { RussiaRegionInfo, RussiaComplianceSettings } from '../types/russia';
import { RUSSIA_BOUNDS, RUSSIA_CENTER } from '../utils/russiaBounds';

// Федеральные округа РФ с их границами
export const RUSSIA_REGIONS: Record<string, RussiaRegionInfo> = {
  central: {
    id: 'central',
    name: 'Центральный федеральный округ',
    bounds: {
      north: 60.0,
      south: 50.0,
      east: 47.0,
      west: 30.0
    },
    center: {
      latitude: 55.0,
      longitude: 38.0
    },
    majorCities: [
      { name: 'Москва', lat: 55.7558, lng: 37.6176 },
      { name: 'Воронеж', lat: 51.6720, lng: 39.1843 },
      { name: 'Ярославль', lat: 57.6261, lng: 39.8845 }
    ]
  },
  northwestern: {
    id: 'northwestern',
    name: 'Северо-Западный федеральный округ',
    bounds: {
      north: 70.0,
      south: 55.0,
      east: 60.0,
      west: 19.0
    },
    center: {
      latitude: 62.0,
      longitude: 35.0
    },
    majorCities: [
      { name: 'Санкт-Петербург', lat: 59.9311, lng: 30.3609 },
      { name: 'Калининград', lat: 54.7065, lng: 20.5110 },
      { name: 'Мурманск', lat: 68.9585, lng: 33.0827 }
    ]
  },
  southern: {
    id: 'southern',
    name: 'Южный федеральный округ',
    bounds: {
      north: 50.0,
      south: 44.0,
      east: 50.0,
      west: 36.0
    },
    center: {
      latitude: 47.0,
      longitude: 42.0
    },
    majorCities: [
      { name: 'Ростов-на-Дону', lat: 47.2357, lng: 39.7015 },
      { name: 'Волгоград', lat: 48.7080, lng: 44.5133 },
      { name: 'Краснодар', lat: 45.0448, lng: 38.9760 }
    ]
  },
  volga: {
    id: 'volga',
    name: 'Приволжский федеральный округ',
    bounds: {
      north: 60.0,
      south: 50.0,
      east: 60.0,
      west: 45.0
    },
    center: {
      latitude: 55.0,
      longitude: 52.0
    },
    majorCities: [
      { name: 'Нижний Новгород', lat: 56.2965, lng: 43.9361 },
      { name: 'Казань', lat: 55.8304, lng: 49.0661 },
      { name: 'Самара', lat: 53.2001, lng: 50.1500 }
    ]
  },
  ural: {
    id: 'ural',
    name: 'Уральский федеральный округ',
    bounds: {
      north: 65.0,
      south: 50.0,
      east: 70.0,
      west: 55.0
    },
    center: {
      latitude: 57.0,
      longitude: 62.0
    },
    majorCities: [
      { name: 'Екатеринбург', lat: 56.8431, lng: 60.6454 },
      { name: 'Челябинск', lat: 55.1644, lng: 61.4368 },
      { name: 'Тюмень', lat: 57.1522, lng: 65.5272 }
    ]
  },
  siberian: {
    id: 'siberian',
    name: 'Сибирский федеральный округ',
    bounds: {
      north: 75.0,
      south: 50.0,
      east: 110.0,
      west: 70.0
    },
    center: {
      latitude: 62.0,
      longitude: 90.0
    },
    majorCities: [
      { name: 'Новосибирск', lat: 55.0084, lng: 82.9357 },
      { name: 'Красноярск', lat: 56.0184, lng: 92.8672 },
      { name: 'Омск', lat: 54.9885, lng: 73.3242 }
    ]
  },
  fareastern: {
    id: 'fareastern',
    name: 'Дальневосточный федеральный округ',
    bounds: {
      north: 77.0,
      south: 42.0,
      east: -169.0,
      west: 110.0
    },
    center: {
      latitude: 60.0,
      longitude: 150.0
    },
    majorCities: [
      { name: 'Владивосток', lat: 43.1056, lng: 131.8735 },
      { name: 'Хабаровск', lat: 48.4827, lng: 135.0840 },
      { name: 'Якутск', lat: 62.0278, lng: 129.7315 }
    ]
  }
};

// Настройки соответствия требованиям РФ
export const RUSSIA_COMPLIANCE_SETTINGS: RussiaComplianceSettings = {
  geographicRestrictions: {
    enabled: false, // Отключено для тестирования
    strictMode: false,
    bufferZoneKm: 5,
    allowedRegions: ['central', 'northwestern', 'southern', 'volga', 'ural', 'siberian', 'fareastern']
  },
  contentModeration: {
    enabled: true,
    strictMode: true
  },
  userInteraction: {
    chatEnabled: false, // Отключено для РФ
    realtimeEnabled: false, // Отключено для РФ
    userToUserMessaging: false // Отключено для РФ
  }
};

// Конфигурация по умолчанию для карты в РФ
export const RUSSIA_MAP_DEFAULT_CONFIG = {
  center: [RUSSIA_CENTER.latitude, RUSSIA_CENTER.longitude], // [lat, lng] для Leaflet
  zoom: 3,  // Исправлено: зум 3 для показа РФ в полную длину
  minZoom: 3,
  maxZoom: 16,
  maxBounds: [
    [RUSSIA_BOUNDS.south, RUSSIA_BOUNDS.west],
    [RUSSIA_BOUNDS.north, RUSSIA_BOUNDS.east]
  ]
};

// Популярные туристические места РФ
export const RUSSIA_TOURIST_ATTRACTIONS = [
  {
    name: 'Красная площадь',
    city: 'Москва',
    lat: 55.7539,
    lng: 37.6208,
    type: 'historical'
  },
  {
    name: 'Эрмитаж',
    city: 'Санкт-Петербург',
    lat: 59.9398,
    lng: 30.3146,
    type: 'museum'
  },
  {
    name: 'Озеро Байкал',
    city: 'Иркутская область',
    lat: 53.5053,
    lng: 108.0041,
    type: 'nature'
  },
  {
    name: 'Казанский Кремль',
    city: 'Казань',
    lat: 55.7985,
    lng: 49.1062,
    type: 'historical'
  },
  {
    name: 'Сочинский национальный парк',
    city: 'Сочи',
    lat: 43.5855,
    lng: 39.7231,
    type: 'nature'
  },
  {
    name: 'Кунгурская ледяная пещера',
    city: 'Пермский край',
    lat: 57.4333,
    lng: 57.0167,
    type: 'nature'
  },
  {
    name: 'Долина гейзеров',
    city: 'Камчатка',
    lat: 54.4300,
    lng: 160.1400,
    type: 'nature'
  },
  {
    name: 'Петергоф',
    city: 'Санкт-Петербург',
    lat: 59.8833,
    lng: 29.9000,
    type: 'historical'
  }
];

// Настройки геотаргетинга для российских компаний
export const RUSSIA_GEO_TARGETING = {
  enabled: true,
  defaultRadius: 50, // км
  maxRadius: 200, // км
  regions: RUSSIA_REGIONS,
  businessCategories: [
    'restaurant',
    'hotel',
    'attraction',
    'transport',
    'service',
    'entertainment'
  ]
};

export default {
  RUSSIA_REGIONS,
  RUSSIA_COMPLIANCE_SETTINGS,
  RUSSIA_MAP_DEFAULT_CONFIG,
  RUSSIA_TOURIST_ATTRACTIONS,
  RUSSIA_GEO_TARGETING
};
