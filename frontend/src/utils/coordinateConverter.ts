/**
 * СИСТЕМА РАБОТЫ С КООРДИНАТАМИ
 * 
 * Этот файл содержит ВСЕ функции для работы с координатами в проекте.
 * ВСЕГДА используйте этот файл для конвертации координат.
 * 
 * ВАЖНО: В нашем проекте везде координаты хранятся в формате [latitude, longitude] (широта, долгота)
 */

// ===================================
// ТИПЫ КООРДИНАТ
// ===================================

export type LatLng = [number, number]; // [latitude, longitude] - наш стандарт
export type LngLat = [number, number]; // [longitude, latitude] - для Yandex Maps

// ===================================
// ВАЛИДАЦИЯ КООРДИНАТ
// ===================================

/**
 * Проверяет, являются ли координаты валидными
 * @param lat - Широта (-90 до 90)
 * @param lng - Долгота (-180 до 180)
 */
export const validateCoordinates = (lat: number, lng: number): boolean => {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (!isFinite(lat) || !isFinite(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Проверяет, являются ли координаты в массиве валидными
 */
export const validateCoordinateArray = (coords: [number, number]): boolean => {
  if (!Array.isArray(coords) || coords.length < 2) return false;
  return validateCoordinates(coords[0], coords[1]);
};

/**
 * Исправляет перевернутые координаты
 * Определяет по диапазонам, какая координата широта, какая долгота
 */
export const autoCorrectCoordinates = (coord1: number, coord2: number): LatLng => {
  const val1 = Math.abs(coord1);
  const val2 = Math.abs(coord2);
  
  // Если первая координата > 90, это явно долгота (широта максимум 90)
  if (val1 > 90) {
    // console.log(`🔧 Автокоррекция: ${coord1} > 90, меняем местами`);
    return [coord2, coord1]; // Меняем местами
  }
  
  // Если вторая координата > 180, она не валидна - оставляем как есть
  if (val2 > 180) {
    return [coord1, coord2];
  }
  
  // Если обе в допустимых диапазонах, определяем по логике:
  // В России широта обычно 40-82, долгота обычно 20-180
  
  // Если первая координата явно в диапазоне долготы для России (20-180)
  // И вторая в диапазоне широты (40-90), то они перевернуты
  if (val1 >= 20 && val1 < 90 && val2 >= 40 && val2 <= 90) {
    // Проверяем, похоже ли это на перевернутые координаты России
    // Например: [37, 55] должно быть [55, 37] (Москва)
    if (val1 < 90 && val2 > 50) {
      // console.log(`🔧 Автокоррекция: координаты перевернуты для России (${coord1}, ${coord2})`);
      return [coord2, coord1];
    }
  }
  
  // Если первая координата в диапазоне широты России (40-82), а вторая в диапазоне долготы (20-180)
  // Значит порядок правильный
  if (val1 >= 40 && val1 <= 90 && val2 >= 20 && val2 <= 180) {
    return [coord1, coord2]; // Правильный порядок
  }
  
  // Если первая координата < 50 и вторая > 50, это перевернуто
  if (val1 < 50 && val2 > 50) {
    // console.log(`🔧 Автокоррекция: порядок перевернут (${coord1}, ${coord2})`);
    return [coord2, coord1];
  }
  
  // По умолчанию возвращаем как есть
  return [coord1, coord2];
};

// ===================================
// КОНВЕРТАЦИЯ ДЛЯ YANDEX MAPS
// ===================================

/**
 * Конвертирует наши координаты [lat, lng] в формат для Yandex Maps [lng, lat]
 * ВСЕГДА используйте эту функцию при передаче координат в YandexMap
 */
export const toYandexFormat = (coords: LatLng): LngLat => {
  return [coords[1], coords[0]]; // [lng, lat]
};

/**
 * Конвертирует координаты из Yandex Maps [lng, lat] в наш формат [lat, lng]
 * ВСЕГДА используйте эту функцию при получении координат из YandexMap
 */
export const fromYandexFormat = (coords: LngLat): LatLng => {
  return [coords[1], coords[0]]; // [lat, lng]
};

// ===================================
// КОНВЕРТАЦИЯ ДЛЯ LEAFLET
// ===================================

/**
 * Leaflet использует формат [lat, lng] - это наш стандарт, конвертация не нужна
 */
export const toLeafletFormat = (coords: LatLng): LatLng => {
  return coords; // Leaflet использует тот же формат
};

// ===================================
// РАБОТА С ОБЪЕКТАМИ MARKERDATA
// ===================================

/**
 * Получает координаты из объекта MarkerData в формате [lat, lng]
 */
export const getCoordinatesFromMarkerData = (marker: { latitude: number; longitude: number }): LatLng => {
  return [marker.latitude, marker.longitude];
};

/**
 * Получает координаты для отображения в Yandex Map
 */
export const getYandexCoordinatesFromMarker = (marker: { latitude: number; longitude: number }): LngLat => {
  return toYandexFormat([marker.latitude, marker.longitude]);
};

// ===================================
// РАБОТА С BOUNDS
// ===================================

/**
 * Создает bounds для Yandex Maps из массива координат
 */
export const createYandexBounds = (coords: LatLng[]): LngLat[] => {
  if (coords.length === 0) return [[37.6173, 55.7558], [37.6173, 55.7558]]; // Москва по умолчанию
  
  const lats = coords.map(c => c[0]);
  const lngs = coords.map(c => c[1]);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  // Yandex Maps bounds: [[minLng, minLat], [maxLng, maxLat]]
  return [[minLng, minLat], [maxLng, maxLat]];
};

// ===================================
// КОНВЕРТАЦИЯ МАССИВОВ
// ===================================

/**
 * Конвертирует массив координат для Yandex Maps
 */
export const convertCoordinatesArrayToYandex = (coords: LatLng[]): LngLat[] => {
  return coords.map(toYandexFormat);
};

// ===================================
// ИЗВЛЕЧЕНИЕ КООРДИНАТ ИЗ РАЗНЫХ ФОРМАТОВ
// ===================================

/**
 * Универсальная функция для извлечения координат из любого объекта
 */
export const extractCoordinates = (point: any): LatLng | null => {
  // Проверяем формат coordinates: [lat, lng]
  if (Array.isArray(point?.coordinates) && point.coordinates.length >= 2) {
    return autoCorrectCoordinates(point.coordinates[0], point.coordinates[1]);
  }
  
  // Проверяем формат latitude/longitude
  if (typeof point?.latitude === 'number' && typeof point?.longitude === 'number') {
    return [point.latitude, point.longitude];
  }
  
  // Проверяем формат lat/lng(lon)
  if (typeof point?.lat === 'number' && typeof point?.lng === 'number') {
    return [point.lat, point.lng];
  }
  if (typeof point?.lat === 'number' && typeof point?.lon === 'number') {
    return [point.lat, point.lon];
  }
  
  // Проверяем формат location { lat, lng }
  if (point?.location?.lat !== undefined && point?.location?.lng !== undefined) {
    return [point.location.lat, point.location.lng];
  }
  
  return null;
};

// ===================================
// ЛОГИРОВАНИЕ (для отладки)
// ===================================

/**
 * Безопасное логирование координат
 */
export const logCoordinates = (label: string, coords: LatLng | LngLat, format: 'lat-lng' | 'lng-lat' = 'lat-lng') => {
  if (format === 'lat-lng') {
    // console.log(`${label}: [lat=${coords[0]}, lng=${coords[1]}]`);
  } else {
    // console.log(`${label}: [lng=${coords[0]}, lat=${coords[1]}]`);
  }
};

