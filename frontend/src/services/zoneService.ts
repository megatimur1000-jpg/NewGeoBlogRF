import api from './api';
import { isWithinRussiaBounds } from '../utils/russiaBounds';
import { FEATURES } from '../config/features';

export interface ZoneCheckResult {
  zoneId: string;
  zoneName: string;
  severity: 'critical' | 'restricted' | 'warning';
  message: string;
  coordinates: [number, number];
}

export interface ZoneValidationResult {
  isValid: boolean;
  blocked: boolean;
  warnings: ZoneCheckResult[];
  criticalZones: ZoneCheckResult[];
  restrictedZones: ZoneCheckResult[];
  message?: string;
}

/**
 * Проверяет точку на соответствие запретным зонам с усиленными ограничениями для РФ
 * @param lat - широта
 * @param lon - долгота
 * @returns результат проверки зон
 */
export async function checkPoint(lat: number, lon: number): Promise<ZoneValidationResult> {
  // Сначала проверяем границы РФ
  if (FEATURES.GEOGRAPHIC_RESTRICTIONS_ENABLED && !isWithinRussiaBounds(lat, lon)) {
    return {
      isValid: false,
      blocked: true,
      warnings: [],
      criticalZones: [],
      restrictedZones: [],
      message: 'Точка находится за пределами РФ'
    };
  }

  try {
  const { data } = await api.post('/zones/check', { points: [[lon, lat]] });
    const results: ZoneCheckResult[] = data?.results || [];
    
    return processZoneResults(results);
  } catch (error) {
    console.error('Ошибка проверки зон:', error);
    // В случае ошибки API, блокируем для безопасности
    return {
      isValid: false,
      blocked: true,
      warnings: [],
      criticalZones: [],
      restrictedZones: [],
      message: 'Ошибка проверки запретных зон. Операция заблокирована для безопасности.'
    };
  }
}

/**
 * Проверяет маршрут на соответствие запретным зонам
 * @param coords - массив координат маршрута в формате [lat, lon]
 * @returns результат проверки зон
 */
export async function checkRoute(coords: [number, number][]): Promise<ZoneValidationResult> {
  // Проверяем все точки маршрута на границы РФ
  if (FEATURES.GEOGRAPHIC_RESTRICTIONS_ENABLED) {
    const invalidPoints = coords.filter(([lat, lon]) => !isWithinRussiaBounds(lat, lon));
    if (invalidPoints.length > 0) {
      return {
        isValid: false,
        blocked: true,
        warnings: [],
        criticalZones: [],
        restrictedZones: [],
        message: `Маршрут содержит ${invalidPoints.length} точек за пределами РФ`
      };
    }
  }

  try {
  // Преобразуем координаты из [lat, lon] в [lon, lat] для backend
  const backendCoords = coords.map(([lat, lon]) => [lon, lat]);
  const { data } = await api.post('/zones/check', { lineString: backendCoords });
    const results: ZoneCheckResult[] = data?.results || [];
    
    return processZoneResults(results);
  } catch (error) {
    console.error('Ошибка проверки зон маршрута:', error);
    return {
      isValid: false,
      blocked: true,
      warnings: [],
      criticalZones: [],
      restrictedZones: [],
      message: 'Ошибка проверки запретных зон маршрута. Операция заблокирована для безопасности.'
    };
  }
}

/**
 * Обрабатывает результаты проверки зон и определяет блокировку
 * @param results - результаты проверки зон
 * @returns обработанный результат
 */
function processZoneResults(results: ZoneCheckResult[]): ZoneValidationResult {
  const criticalZones = results.filter(zone => zone.severity === 'critical');
  const restrictedZones = results.filter(zone => zone.severity === 'restricted');
  const warnings = results.filter(zone => zone.severity === 'warning');

  // В режиме РФ блокируем для критических и ограниченных зон
  if (FEATURES.RUSSIA_COMPLIANCE_MODE) {
    if (criticalZones.length > 0) {
      return {
        isValid: false,
        blocked: true,
        warnings,
        criticalZones,
        restrictedZones,
        message: `Операция заблокирована: точка находится в критической зоне "${criticalZones[0].zoneName}"`
      };
    }

    if (restrictedZones.length > 0) {
      return {
        isValid: false,
        blocked: true,
        warnings,
        criticalZones,
        restrictedZones,
        message: `Операция заблокирована: точка находится в ограниченной зоне "${restrictedZones[0].zoneName}"`
      };
    }
  }

  // Если есть только предупреждения, разрешаем с предупреждением
  if (warnings.length > 0) {
    return {
      isValid: true,
      blocked: false,
      warnings,
      criticalZones,
      restrictedZones,
      message: `Внимание: ${warnings.length} предупреждений о зонах`
    };
  }

  // Все проверки пройдены
  return {
    isValid: true,
    blocked: false,
    warnings: [],
    criticalZones: [],
    restrictedZones: []
  };
}

/**
 * Получает все запретные зоны
 * @returns массив запретных зон
 */
export async function getAllZones() {
  try {
  const { data } = await api.get('/zones/all');
  return data?.zones || [];
  } catch (error) {
    console.error('Ошибка получения зон:', error);
    return [];
  }
}

/**
 * Проверяет, можно ли создать маркер в указанной точке
 * @param lat - широта
 * @param lon - долгота
 * @returns true, если маркер можно создать
 */
export async function canCreateMarker(lat: number, lon: number): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const result = await checkPoint(lat, lon);
  
  if (!result.isValid || result.blocked) {
    return {
      allowed: false,
      reason: result.message
    };
  }

  return { allowed: true };
}

/**
 * Проверяет, можно ли построить маршрут через указанные точки
 * @param coordinates - координаты маршрута
 * @returns true, если маршрут можно построить
 */
export async function canCreateRoute(coordinates: [number, number][]): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const result = await checkRoute(coordinates);
  
  if (!result.isValid || result.blocked) {
    return {
      allowed: false,
      reason: result.message
    };
  }

  return { allowed: true };
}

