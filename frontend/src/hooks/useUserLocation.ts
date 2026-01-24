import { useState, useEffect, useCallback } from 'react';
import { locationService, UserLocation, LocationBounds } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';

interface UseUserLocationReturn {
  location: UserLocation | null;
  bounds: LocationBounds | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
  clearLocation: () => void;
}

export const useUserLocation = (): UseUserLocationReturn => {
  const { user, updatePreferredLocation } = useAuth();
  // Инициализируем с дефолтным местоположением сразу, чтобы карта загрузилась
  const [location, setLocation] = useState<UserLocation | null>(() => {
    // Сначала проверяем сохраненные предпочтения пользователя
    if (user?.preferred_location) {
      return {
        latitude: user.preferred_location.latitude,
        longitude: user.preferred_location.longitude,
        city: user.preferred_location.city,
        region: user.preferred_location.region,
        country: 'Россия'
      };
    }
    
    // Проверяем кеш localStorage (может содержать реальное местоположение)
    try {
      const cached = localStorage.getItem('user_location');
      if (cached) {
        const cacheData = JSON.parse(cached);
        // Используем кеш только если он не старше 24 часов
        const isExpired = Date.now() - cacheData.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired && cacheData.location) {
          const cachedLocation = cacheData.location;
          // Проверяем, что это не fallback (Москва)
          const fallback = locationService.getFallbackLocation();
          const isFallback = Math.abs(cachedLocation.latitude - fallback.latitude) < 0.01 &&
                             Math.abs(cachedLocation.longitude - fallback.longitude) < 0.01;
          if (!isFallback) {
            return cachedLocation;
          }
        }
      }
    } catch (error) {
      // Игнорируем ошибки парсинга кеша
    }
    
    // Если нет предпочтений и кеша, используем дефолтное местоположение (Москва)
    return locationService.getFallbackLocation();
  });
  const [bounds, setBounds] = useState<LocationBounds | null>(() => {
    // Устанавливаем границы для дефолтного местоположения
    const initialLocation = (() => {
      if (user?.preferred_location) {
        return {
          latitude: user.preferred_location.latitude,
          longitude: user.preferred_location.longitude,
          city: user.preferred_location.city,
          region: user.preferred_location.region,
          country: 'Россия'
        };
      }
      return locationService.getFallbackLocation();
    })();
    return locationService.getCityBounds(initialLocation);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Сначала проверяем сохраненные предпочтения пользователя
      if (user?.preferred_location) {
        const preferredLocation: UserLocation = {
          latitude: user.preferred_location.latitude,
          longitude: user.preferred_location.longitude,
          city: user.preferred_location.city,
          region: user.preferred_location.region,
          country: 'Россия'
        };
        
        setLocation(preferredLocation);
        const cityBounds = locationService.getCityBounds(preferredLocation);
        setBounds(cityBounds);
        setLoading(false);
        return;
      }

      // Если нет сохраненных предпочтений, получаем текущее местоположение
      // ВАЖНО: getCurrentLocation теперь всегда запрашивает свежее местоположение (кеш отключен)
      const userLocation = await locationService.getCurrentLocation();
      
      // Проверяем, что получено реальное местоположение, а не fallback
      const fallbackLocation = locationService.getFallbackLocation();
      const isFallback = Math.abs(userLocation.latitude - fallbackLocation.latitude) < 0.01 &&
                         Math.abs(userLocation.longitude - fallbackLocation.longitude) < 0.01;
      
      if (!isFallback) {
        // Это реальное местоположение - используем его
        setLocation(userLocation);
        
        // Сохраняем местоположение как предпочтительное
        if (userLocation.city && userLocation.region) {
          updatePreferredLocation({
            city: userLocation.city,
            region: userLocation.region,
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          });
        }
        
        // Устанавливаем границы для города
        const cityBounds = locationService.getCityBounds(userLocation);
        setBounds(cityBounds);
      } else {
        // Это fallback (Москва) - не обновляем местоположение, оставляем текущее
        // (которое уже установлено при инициализации)
        if (process.env.NODE_ENV === 'development') {
        }
      }
      
      // Устанавливаем границы для города
      const cityBounds = locationService.getCityBounds(userLocation);
      setBounds(cityBounds);
      
    } catch (err: any) {
      // Используем fallback на Москву без показа ошибки пользователю
      // Геолокация опциональна - карта должна работать без неё
      const fallbackLocation = locationService.getFallbackLocation();
      setLocation(fallbackLocation);
      
      const fallbackBounds = locationService.getCityBounds(fallbackLocation);
      setBounds(fallbackBounds);
      
      // НЕ показываем ошибку пользователю - геолокация опциональна
      // Просто используем дефолтное местоположение (Москва)
      setError(null);
      
      // Логируем только в dev режиме для отладки
      if (process.env.NODE_ENV === 'development') {
      }
    } finally {
      setLoading(false);
    }
  }, [user, updatePreferredLocation]);

  const clearLocation = useCallback(() => {
    locationService.clearLocationCache();
    setLocation(null);
    setBounds(null);
    setError(null);
  }, []);

  // Автоматически получаем местоположение при монтировании
  // Карта уже загружена с дефолтным местоположением, геолокация работает в фоне
  useEffect(() => {
    // Инициализируем границы для начального местоположения
    if (location && !bounds) {
      const initialBounds = locationService.getCityBounds(location);
      setBounds(initialBounds);
    }
    
    // Пытаемся получить реальное местоположение в фоне (не блокируя карту)
    // КРИТИЧНО: Вызываем только один раз при монтировании, не при каждом изменении refreshLocation
    // Используем флаг, чтобы избежать повторных вызовов
    let isMounted = true;
    refreshLocation().finally(() => {
      isMounted = false;
    });
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Пустой массив зависимостей - вызываем только при монтировании

  return {
    location,
    bounds,
    loading,
    error,
    refreshLocation,
    clearLocation
  };
};
