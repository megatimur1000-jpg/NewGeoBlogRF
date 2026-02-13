/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, no-useless-catch, no-empty */
// TODO: temporary — relax lint rules in large files while we migrate types (follow-up task)
/**
 * Сервис для работы с геолокацией и определением местоположения
 */

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  accuracy?: number;
}

export interface LocationBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

class LocationService {
  private cachedLocation: UserLocation | null = null;
  private readonly CACHE_KEY = 'user_location';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа
  private isRequestingLocation: boolean = false; // Флаг для предотвращения параллельных запросов

  /**
   * Проверить разрешение на геолокацию
   */
  async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!navigator.permissions || !navigator.permissions.query) {
      // Permissions API не поддерживается, возвращаем 'prompt'
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return result.state as 'granted' | 'denied' | 'prompt';
    } catch (error) {
      // Если не поддерживается, возвращаем 'prompt'
      return 'prompt';
    }
  }

  /**
   * Получить текущее местоположение пользователя
   */
  async getCurrentLocation(): Promise<UserLocation> {
    // Используем кеш, чтобы избежать множественных запросов к Nominatim
    // Кеш проверяется только на срок действия (24 часа), но не на точность
    const cached = this.getCachedLocation();
    if (cached) {
      // Если в кеше есть валидное местоположение, возвращаем его
      // Это предотвращает множественные запросы к Nominatim при каждом рендере
      return cached;
    }

    // Предотвращаем параллельные запросы к геолокации
    if (this.isRequestingLocation) {
      // Если запрос уже выполняется, ждем его завершения
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!this.isRequestingLocation) {
            clearInterval(checkInterval);
            const cachedAfterWait = this.getCachedLocation();
            if (cachedAfterWait) {
              resolve(cachedAfterWait);
            } else {
              reject(new Error('Не удалось получить местоположение'));
            }
          }
        }, 100);
        
        // Таймаут на случай, если запрос зависнет
        setTimeout(() => {
          clearInterval(checkInterval);
          if (this.isRequestingLocation) {
            this.isRequestingLocation = false;
            reject(new Error('Превышено время ожидания получения местоположения'));
          }
        }, 15000);
      });
    }

    this.isRequestingLocation = true;

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Геолокация не поддерживается браузером'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 минут
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          try {
            // Получаем информацию о городе
            const cityInfo = await this.getCityByCoordinates(location.latitude, location.longitude);
            location.city = cityInfo.city;
            location.region = cityInfo.region;
            location.country = cityInfo.country;

            // Кешируем результат
            this.cacheLocation(location);
            this.isRequestingLocation = false;
            resolve(location);
          } catch (error) {
            // Возвращаем координаты без информации о городе
            this.cacheLocation(location);
            this.isRequestingLocation = false;
            resolve(location);
          }
        },
        (error) => {
          this.isRequestingLocation = false;
          // Улучшенная обработка ошибок геолокации
          let errorMessage = 'Не удалось определить местоположение';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Доступ к геолокации запрещен.\n\n' +
                'Как разрешить доступ:\n' +
                '1. Нажмите на иконку замка 🔒 в адресной строке\n' +
                '2. Найдите "Местоположение" и выберите "Разрешить"\n' +
                '3. Обновите страницу или нажмите "Попробовать снова"\n\n' +
                'Или используйте сохраненное местоположение в настройках профиля.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Информация о местоположении недоступна.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Превышено время ожидания определения местоположения.';
              break;
            default:
              errorMessage = `Ошибка геолокации: ${error.message || 'Неизвестная ошибка'}`;
              break;
          }
          
          const locationError = new Error(errorMessage);
          (locationError as any).code = error.code;
          reject(locationError);
        },
        options
      );
    });
  }

  /**
   * Определить город по координатам через Nominatim API
   */
  private async getCityByCoordinates(lat: number, lng: number): Promise<{
    city: string;
    region: string;
    country: string;
  }> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Ошибка запроса к Nominatim');
      }

      const data = await response.json();
      
      if (!data.address) {
        throw new Error('Адрес не найден');
      }

      const address = data.address;
      
      // Улучшенная логика определения города для Владимира и других городов
      // Проверяем различные поля адреса для более точного определения
      const city = address.city || 
                   address.town || 
                   address.city_district || 
                   address.municipality ||
                   address.village || 
                   address.hamlet || 
                   'Неизвестный город';
      
      // Улучшенная логика определения региона
      // Nominatim может возвращать регион в разных полях в зависимости от местоположения
      let region = address.state || 
                   address.region || 
                   address.province || 
                   address.state_district ||
                   address.administrative ||
                   'Неизвестный регион';
      
      // Нормализация названия региона для корректного сопоставления
      region = this.normalizeRegionName(region);
      
      return {
        city,
        region,
        country: address.country || 'Россия'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Нормализовать название региона для корректного сопоставления
   */
  private normalizeRegionName(regionName: string): string {
    if (!regionName) return 'Неизвестный регион';
    
    // Убираем лишние пробелы
    const normalized = regionName.trim().replace(/\s+/g, ' ');
    
    // Маппинг английских названий на русские
    const regionMapping: { [key: string]: string } = {
      'vladimir oblast': 'Владимирская область',
      'vladimirskaya oblast': 'Владимирская область',
      'moscow oblast': 'Московская область',
      'moskovskaya oblast': 'Московская область',
      'moscow': 'Москва',
      'saint petersburg': 'Санкт-Петербург',
      'leningrad oblast': 'Ленинградская область',
    };
    
    const lowerNormalized = normalized.toLowerCase();
    for (const [en, ru] of Object.entries(regionMapping)) {
      if (lowerNormalized.includes(en)) {
        return ru;
      }
    }
    
    // Специальная обработка для Владимирской области
    // Nominatim может возвращать "Vladimir Oblast" или "Владимирская область" в разных форматах
    if (lowerNormalized.includes('владимир') || lowerNormalized.includes('vladimir')) {
      // Проверяем, что это именно область, а не город
      if (lowerNormalized.includes('область') || lowerNormalized.includes('oblast')) {
        return 'Владимирская область';
      }
    }
    
    // Если название уже на русском, возвращаем как есть
    // Проверяем, содержит ли строка кириллицу
    if (/[а-яё]/i.test(normalized)) {
      return normalized;
    }
    
    return normalized;
  }

  /**
   * Получить границы для отображения на карте
   */
  getBoundsForLocation(location: UserLocation, zoomLevel: number = 0.1): LocationBounds {
    return {
      north: location.latitude + zoomLevel,
      south: location.latitude - zoomLevel,
      east: location.longitude + zoomLevel,
      west: location.longitude - zoomLevel
    };
  }

  /**
   * Получить границы для города (больше область)
   */
  getCityBounds(location: UserLocation): LocationBounds {
    return this.getBoundsForLocation(location, 0.2);
  }

  /**
   * Получить границы для региона (еще больше область)
   */
  getRegionBounds(location: UserLocation): LocationBounds {
    return this.getBoundsForLocation(location, 0.5);
  }

  /**
   * Кешировать местоположение
   */
  private cacheLocation(location: UserLocation): void {
    const cacheData = {
      location,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      this.cachedLocation = location;
    } catch (error) {
      }
  }

  /**
   * Получить кешированное местоположение
   */
  private getCachedLocation(): UserLocation | null {
    if (this.cachedLocation) {
      return this.cachedLocation;
    }

    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }

      this.cachedLocation = cacheData.location;
      return cacheData.location;
    } catch (error) {
      return null;
    }
  }

  /**
   * Очистить кеш местоположения
   */
  clearLocationCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    this.cachedLocation = null;
  }

  /**
   * Получить fallback местоположение (Москва)
   */
  getFallbackLocation(): UserLocation {
    return {
      latitude: 55.751244,
      longitude: 37.618423,
      city: 'Москва',
      region: 'Московская область',
      country: 'Россия'
    };
  }

  /**
   * Проверить, находится ли пользователь в России
   */
  isInRussia(location: UserLocation): boolean {
    return location.latitude >= 41.2 && location.latitude <= 81.9 &&
           location.longitude >= 19.6 && location.longitude <= 169.0;
  }
}

export const locationService = new LocationService();
