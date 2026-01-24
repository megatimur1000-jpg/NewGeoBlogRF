// Сервис для работы с офлайн-данными
import { getregioncity as getRegionCity } from '../stores/regionCities';

export interface OfflineRegionData {
  regionId: string;
  downloadType: 'user_data' | 'user_data_cities' | 'user_data_full';
  downloadedAt: number;
  userMarkers: any[];
  userRoutes: any[];
  userEvents: any[];
  userPosts: any[];
  mapTiles?: {
    cities?: string[]; // Список URL тайлов для городов
    full?: string[]; // Список URL тайлов для всей области
  };
  sizeEstimate?: number; // Оценка размера в байтах
}

export interface DownloadProgress {
  regionId: string;
  progress: number; // 0-100
  status: 'preparing' | 'downloading' | 'processing' | 'completed' | 'error';
  message?: string;
}

class OfflineService {
  private readonly DB_NAME = 'geoblog_offline';
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;

  /**
   * Инициализация IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Создаем хранилище для региональных данных
        if (!db.objectStoreNames.contains('regions')) {
          const regionStore = db.createObjectStore('regions', { keyPath: 'regionId' });
          regionStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        }

        // Создаем хранилище для тайлов карт
        if (!db.objectStoreNames.contains('mapTiles')) {
          const tileStore = db.createObjectStore('mapTiles', { keyPath: 'url' });
          tileStore.createIndex('regionId', 'regionId', { unique: false });
        }
      };
    });
  }

  /**
   * Проверка премиум-статуса пользователя
   */
  isPremiumUser(subscriptionExpiresAt?: string | null): boolean {
    if (!subscriptionExpiresAt) return false;
    const expiresAt = new Date(subscriptionExpiresAt).getTime();
    return expiresAt > Date.now();
  }

  /**
   * Оценка размера скачивания для региона
   */
  async estimateDownloadSize(
    regionId: string,
    downloadType: 'user_data' | 'user_data_cities' | 'user_data_full',
    userId: string
  ): Promise<number> {
    const cityInfo = getRegionCity(regionId);
    if (!cityInfo) return 0;

    let size = 0;

    // Размер пользовательских данных (примерная оценка)
    // Метки: ~2KB каждая, Маршруты: ~10KB каждый, События: ~5KB каждое, Посты: ~20KB каждый
    try {
      // Здесь можно сделать реальные запросы к API для оценки
      // Пока используем примерные значения
      size += 100 * 1024; // ~100KB для пользовательских данных
    } catch (error) {
      // Игнорируем ошибки при оценке
    }

    // Размер тайлов карт
    if (downloadType === 'user_data_cities') {
      // Тайлы для городов: ~50-100 тайлов на город, ~50KB каждый
      size += 5 * 1024 * 1024; // ~5MB для городов
    } else if (downloadType === 'user_data_full') {
      // Тайлы для всей области: может быть очень много
      // Оценка: ~500-1000 тайлов, ~50KB каждый
      size += 50 * 1024 * 1024; // ~50MB для всей области
    }

    return size;
  }

  /**
   * Скачивание данных региона
   */
  async downloadRegionData(
    regionId: string,
    downloadType: 'user_data' | 'user_data_cities' | 'user_data_full',
    userId: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<OfflineRegionData> {
    if (!this.db) {
      await this.init();
    }

    const cityInfo = getRegionCity(regionId);
    if (!cityInfo) {
      throw new Error('Регион не найден');
    }

    onProgress?.({
      regionId,
      progress: 0,
      status: 'preparing',
      message: 'Подготовка данных...'
    });

    // 1. Загружаем пользовательские данные
    onProgress?.({
      regionId,
      progress: 10,
      status: 'downloading',
      message: 'Загрузка ваших меток...'
    });

    const userMarkers = await this.fetchUserMarkers(regionId, userId);
    
    onProgress?.({
      regionId,
      progress: 30,
      status: 'downloading',
      message: 'Загрузка ваших маршрутов...'
    });

    const userRoutes = await this.fetchUserRoutes(regionId, userId);
    
    onProgress?.({
      regionId,
      progress: 50,
      status: 'downloading',
      message: 'Загрузка ваших событий...'
    });

    const userEvents = await this.fetchUserEvents(regionId, userId);
    
    onProgress?.({
      regionId,
      progress: 70,
      status: 'downloading',
      message: 'Загрузка ваших постов...'
    });

    const userPosts = await this.fetchUserPosts(regionId, userId);

    // 2. Загружаем тайлы карт (если нужно)
    let mapTiles: OfflineRegionData['mapTiles'] = undefined;

    if (downloadType === 'user_data_cities' || downloadType === 'user_data_full') {
      onProgress?.({
        regionId,
        progress: 80,
        status: 'downloading',
        message: 'Загрузка карт...'
      });

      mapTiles = await this.downloadMapTiles(regionId, downloadType, onProgress);
    }

    // 3. Сохраняем данные в IndexedDB
    onProgress?.({
      regionId,
      progress: 95,
      status: 'processing',
      message: 'Сохранение данных...'
    });

    const offlineData: OfflineRegionData = {
      regionId,
      downloadType,
      downloadedAt: Date.now(),
      userMarkers,
      userRoutes,
      userEvents,
      userPosts,
      mapTiles
    };

    await this.saveRegionData(offlineData);

    onProgress?.({
      regionId,
      progress: 100,
      status: 'completed',
      message: 'Скачивание завершено!'
    });

    return offlineData;
  }

  /**
   * Загрузка пользовательских меток
   */
  private async fetchUserMarkers(regionId: string, userId: string): Promise<any[]> {
    try {
      // Здесь должен быть реальный API запрос
      // Пока возвращаем пустой массив
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Загрузка пользовательских маршрутов
   */
  private async fetchUserRoutes(regionId: string, userId: string): Promise<any[]> {
    try {
      // Здесь должен быть реальный API запрос
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Загрузка пользовательских событий
   */
  private async fetchUserEvents(regionId: string, userId: string): Promise<any[]> {
    try {
      // Здесь должен быть реальный API запрос
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Загрузка пользовательских постов
   */
  private async fetchUserPosts(regionId: string, userId: string): Promise<any[]> {
    try {
      // Здесь должен быть реальный API запрос
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Скачивание тайлов карт
   */
  private async downloadMapTiles(
    regionId: string,
    downloadType: 'user_data_cities' | 'user_data_full',
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<OfflineRegionData['mapTiles']> {
    const cityInfo = getRegionCity(regionId);
    if (!cityInfo) return undefined;

    // Здесь должна быть реальная логика скачивания тайлов
    // Пока возвращаем пустой объект
    return {
      cities: downloadType === 'user_data_cities' ? [] : undefined,
      full: downloadType === 'user_data_full' ? [] : undefined
    };
  }

  /**
   * Сохранение данных региона в IndexedDB
   */
  private async saveRegionData(data: OfflineRegionData): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['regions'], 'readwrite');
      const store = transaction.objectStore('regions');
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получение скачанных данных региона
   */
  async getRegionData(regionId: string): Promise<OfflineRegionData | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['regions'], 'readonly');
      const store = transaction.objectStore('regions');
      const request = store.get(regionId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Проверка, скачан ли регион
   */
  async isRegionDownloaded(regionId: string): Promise<boolean> {
    const data = await this.getRegionData(regionId);
    return data !== null;
  }

  /**
   * Удаление скачанных данных региона
   */
  async deleteRegionData(regionId: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['regions'], 'readwrite');
      const store = transaction.objectStore('regions');
      const request = store.delete(regionId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получение списка всех скачанных регионов
   */
  async getDownloadedRegions(): Promise<string[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['regions'], 'readonly');
      const store = transaction.objectStore('regions');
      const request = store.getAll();

      request.onsuccess = () => {
        const regions = request.result.map((data: OfflineRegionData) => data.regionId);
        resolve(regions);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineService = new OfflineService();

