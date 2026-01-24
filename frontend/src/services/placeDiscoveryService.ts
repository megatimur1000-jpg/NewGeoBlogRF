import apiClient from '../api/apiClient';

// Типы для обнаруженных мест
export interface DiscoveredPlace {
  id?: string;
  name: string;
  address: string;
  type: string;
  category: string;
  source: 'yandex' | 'osm' | 'foursquare' | 'google';
  confidence: number; // 0-1, насколько уверены в результате
  coordinates: {
    latitude: number;
    longitude: number;
  };
  metadata?: {
    phone?: string;
    website?: string;
    openingHours?: string;
    rating?: number;
  };
}

// Интерфейс для результатов поиска
export interface PlaceSearchResult {
  places: DiscoveredPlace[];
  bestMatch?: DiscoveredPlace;
  totalFound: number;
}

// Кэш для результатов поиска (5 минут)
interface CacheEntry {
  data: PlaceSearchResult;
  timestamp: number;
}

class PlaceDiscoveryService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 минут

  /**
   * Валидация координат
   */
  private validateCoordinates(latitude: number, longitude: number): boolean {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return false;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return false;
    }
    if (isNaN(latitude) || isNaN(longitude)) {
      return false;
    }
    return true;
  }

  /**
   * Генерация ключа кэша
   */
  private getCacheKey(latitude: number, longitude: number, type: string): string {
    // Округляем координаты до 4 знаков для группировки близких точек
    const lat = Math.round(latitude * 10000) / 10000;
    const lng = Math.round(longitude * 10000) / 10000;
    return `${type}:${lat}:${lng}`;
  }

  /**
   * Получение данных из кэша
   */
  private getFromCache(key: string): PlaceSearchResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Сохранение данных в кэш
   */
  private setCache(key: string, data: PlaceSearchResult): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Очистка старых записей (если кэш больше 100 записей)
    if (this.cache.size > 100) {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.CACHE_TTL) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Основной метод для обнаружения места по координатам
   */
  async discoverPlace(latitude: number, longitude: number): Promise<PlaceSearchResult> {
    try {
      // Валидация координат
      if (!this.validateCoordinates(latitude, longitude)) {
        return { places: [], totalFound: 0 };
      }

      // Проверяем кэш
      const cacheKey = this.getCacheKey(latitude, longitude, 'discover');
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Сначала делаем reverse (Nominatim) через наш API - это более надежно
      const reverse = await this.searchLocalPlaces(latitude, longitude);
      if (reverse.places.length > 0 && reverse.bestMatch) {
        this.setCache(cacheKey, reverse);
        return reverse;
      }

      // Если reverse не дал результатов, пробуем nearby (Overpass)
      const nearby = await this.searchExternalPlaces(latitude, longitude);
      if (nearby.places.length > 0) {
        this.setCache(cacheKey, nearby);
        return nearby;
      }

      // Если ничего не найдено
      this.setCache(cacheKey, { places: [], totalFound: 0 });
      return { places: [], totalFound: 0 };
    } catch (error) {
      return {
        places: [],
        totalFound: 0
      };
    }
  }

  /**
   * Поиск мест в нашей базе данных
   */
  private async searchLocalPlaces(latitude: number, longitude: number): Promise<PlaceSearchResult> {
    try {
      // Проверяем кэш для reverse
      const cacheKey = this.getCacheKey(latitude, longitude, 'reverse');
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // reverse lookup
      const response = await apiClient.get(`/places/reverse`, {
        params: {
          lat: latitude,
          lng: longitude,
        }
      });
      
      const result = response.data || { places: [], totalFound: 0 };
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      return { places: [], totalFound: 0 };
    }
  }

  /**
   * Поиск через внешние API (пока заглушка)
   */
  private async searchExternalPlaces(latitude: number, longitude: number): Promise<PlaceSearchResult> {
    try {
      // Проверяем кэш для nearby
      const cacheKey = this.getCacheKey(latitude, longitude, 'nearby');
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await apiClient.get(`/places/nearby`, {
        params: { lat: latitude, lng: longitude, radius: 120 }
      });
      
      const result = response.data || { places: [], totalFound: 0 };
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      return { places: [], totalFound: 0 };
    }
  }

  /**
   * Получение детальной информации о месте
   */
  async getPlaceDetails(placeId: string, source: string): Promise<DiscoveredPlace | null> {
    try {
      if (source === 'local') {
        const response = await apiClient.get(`/places/${placeId}`);
        return response.data;
      }
      
      // TODO: Реализовать для внешних источников
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Проверка, существует ли уже метка для этого места
   */
  async checkExistingMarker(latitude: number, longitude: number): Promise<boolean> {
    try {
      // Валидация координат
      if (!this.validateCoordinates(latitude, longitude)) {
        return false;
      }

      const response = await apiClient.get('/markers/nearby', {
        params: {
          lat: latitude,
          lng: longitude,
          radius: 50 // метров
        }
      });

      return response.data && response.data.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Очистка кэша
   */
  clearCache(): void {
    this.cache.clear();
    }

  /**
   * Принудительное обновление места (игнорируя кэш)
   */
  async forceRefreshPlace(latitude: number, longitude: number): Promise<PlaceSearchResult> {
    // Очищаем кэш для этих координат
    const cacheKey = this.getCacheKey(latitude, longitude, 'discover');
    this.cache.delete(cacheKey);
    
    // Заново ищем место
    return this.discoverPlace(latitude, longitude);
  }
}

export const placeDiscoveryService = new PlaceDiscoveryService();
export default placeDiscoveryService;
