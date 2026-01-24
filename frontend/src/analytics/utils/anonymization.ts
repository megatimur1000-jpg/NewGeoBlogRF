/**
 * Утилиты для анонимизации данных в аналитике
 * Соответствие требованиям 152-ФЗ о защите персональных данных
 */

/**
 * Округлить координаты до уровня региона (~10 км точности)
 * Это позволяет анализировать географические паттерны без раскрытия точного местоположения
 */
export function anonymizeCoordinates(lat: number, lon: number): {
  region: string;
  roundedLat: number;
  roundedLon: number;
} {
  // Округляем до ~10 км (0.1 градуса ≈ 11 км на экваторе)
  const roundedLat = Math.round(lat * 10) / 10;
  const roundedLon = Math.round(lon * 10) / 10;
  
  // Определяем регион
  const region = detectRegion(roundedLat, roundedLon);
  
  return {
    region,
    roundedLat,
    roundedLon
  };
}

/**
 * Определить регион по координатам (упрощённая версия)
 */
function detectRegion(lat: number, lon: number): string {
  if (lat > 55 && lon > 30 && lon < 40) return 'Москва и область';
  if (lat > 59 && lon > 28 && lon < 32) return 'Санкт-Петербург';
  if (lat > 44 && lon > 33 && lon < 37) return 'Крым';
  if (lat > 60 && lon > 30 && lon < 35) return 'Карелия';
  if (lat > 50 && lon > 82 && lon < 88) return 'Алтай';
  if (lat > 43 && lon > 39 && lon < 42) return 'Сочи';
  if (lat > 56 && lon > 37 && lon < 38) return 'Подмосковье';
  return 'Другой регион';
}

/**
 * Анонимизировать объект с геоданными
 * Удаляет точные координаты и заменяет их на регион
 */
export function anonymizeGeoData(data: Record<string, any>): Record<string, any> {
  const anonymized = { ...data };
  
  // Удаляем персональные идентификаторы
  delete anonymized.user_id;
  delete anonymized.email;
  delete anonymized.username;
  delete anonymized.phone;
  
  // Анонимизируем координаты
  if (anonymized.latitude !== undefined && anonymized.longitude !== undefined) {
    const { region } = anonymizeCoordinates(anonymized.latitude, anonymized.longitude);
    delete anonymized.latitude;
    delete anonymized.longitude;
    anonymized.region = region;
  }
  
  // Анонимизируем треки (GeoJSON)
  if (anonymized.track && anonymized.track.geometry) {
    const coords = anonymized.track.geometry.coordinates;
    if (coords && coords.length > 0) {
      const firstPoint = coords[0];
      if (Array.isArray(firstPoint) && firstPoint.length >= 2) {
        const { region } = anonymizeCoordinates(firstPoint[1], firstPoint[0]);
        delete anonymized.track;
        anonymized.track_region = region;
        anonymized.track_points_count = coords.length;
      }
    }
  }
  
  return anonymized;
}

/**
 * Проверить, что данные не содержат точных координат
 * Используется для валидации перед отправкой в аналитику
 */
export function validateAnonymized(data: Record<string, any>): boolean {
  // Не должно быть точных координат
  if (data.latitude !== undefined || data.longitude !== undefined) {
    return false;
  }
  
  // Не должно быть персональных данных
  if (data.user_id !== undefined || data.email !== undefined || data.username !== undefined) {
    return false;
  }
  
  return true;
}

