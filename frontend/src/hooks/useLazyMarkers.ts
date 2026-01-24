import { useState, useEffect, useCallback, useRef } from 'react';
import { MarkerData } from '../types/marker';
import { getMarkersByBounds } from '../services/markerService';

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface UseLazyMarkersOptions {
  categories?: string[];
  limit?: number;
  debounceMs?: number;
}

export const useLazyMarkers = (options: UseLazyMarkersOptions = {}) => {
  const {
    categories = [],
    limit = 100,
    debounceMs = 500
  } = options;

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedBounds, setLoadedBounds] = useState<Bounds | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Функция для загрузки маркеров по области
  const loadMarkers = useCallback(async (bounds: Bounds, forceReload = false) => {
    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Создаем новый AbortController
    abortControllerRef.current = new AbortController();

    // Проверяем, нужно ли загружать маркеры
    if (!forceReload && loadedBounds && 
        bounds.north <= loadedBounds.north + 0.01 &&
        bounds.south >= loadedBounds.south - 0.01 &&
        bounds.east <= loadedBounds.east + 0.01 &&
        bounds.west >= loadedBounds.west - 0.01) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newMarkers = await getMarkersByBounds(bounds, categories, limit);
      
      if (!abortControllerRef.current.signal.aborted) {
        setMarkers(newMarkers);
        setLoadedBounds(bounds);
      }
    } catch (err: any) {
      if (!abortControllerRef.current.signal.aborted) {
        setError(err.message || 'Ошибка загрузки маркеров');
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [categories, limit, loadedBounds]);

  // Дебаунсированная загрузка
  const loadMarkersDebounced = useCallback((bounds: Bounds) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      loadMarkers(bounds);
    }, debounceMs);
  }, [loadMarkers, debounceMs]);

  // Принудительная перезагрузка
  const reloadMarkers = useCallback((bounds: Bounds) => {
    loadMarkers(bounds, true);
  }, [loadMarkers]);

  // Очистка маркеров
  const clearMarkers = useCallback(() => {
    setMarkers([]);
    setLoadedBounds(null);
    setError(null);
  }, []);

  // Загрузка при изменении категорий
  useEffect(() => {
    if (loadedBounds) {
      loadMarkers(loadedBounds, true);
    }
  }, [categories, loadMarkers, loadedBounds]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    markers,
    loading,
    error,
    loadedBounds,
    loadMarkers: loadMarkersDebounced,
    reloadMarkers,
    clearMarkers
  };
};
