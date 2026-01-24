import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isInstalled: boolean;
  isActive: boolean;
  isUpdating: boolean;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isInstalled: false,
    isActive: false,
    isUpdating: false
  });

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Регистрация Service Worker
  const register = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setRegistration(reg);
      setState(prev => ({ ...prev, isInstalled: true }));

      return reg;
    } catch (error) {
      return null;
    }
  }, []);

  // Обновление Service Worker
  const update = useCallback(async () => {
    if (!registration) return;

    try {
      setState(prev => ({ ...prev, isUpdating: true }));
      
      await registration.update();
      } catch (error) {
      } finally {
      setState(prev => ({ ...prev, isUpdating: false }));
    }
  }, [registration]);

  // Очистка кэша
  const clearCache = useCallback(async () => {
    if (!registration) return;

    try {
      // Отправляем сообщение Service Worker для очистки кэша
      if (registration.active) {
        registration.active.postMessage({ type: 'CLEAR_CACHE' });
      }

      // Очищаем кэши напрямую
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );

      } catch (error) {
      }
  }, [registration]);

  // Обработка обновлений
  useEffect(() => {
    if (!registration) return;

    const handleUpdateFound = () => {
      setState(prev => ({ ...prev, isUpdating: true }));
    };

    const handleControllerChange = () => {
      setState(prev => ({ ...prev, isActive: true, isUpdating: false }));
    };

    registration.addEventListener('updatefound', handleUpdateFound);
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      registration.removeEventListener('updatefound', handleUpdateFound);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, [registration]);

  // Автоматическая регистрация при монтировании (только в production)
  useEffect(() => {
    if (state.isSupported && process.env.NODE_ENV === 'production') {
      register();
    }
  }, [state.isSupported, register]);

  // Проверка состояния
  useEffect(() => {
    if (registration) {
      setState(prev => ({
        ...prev,
        isActive: !!registration.active,
        isInstalled: true
      }));
    }
  }, [registration]);

  return {
    ...state,
    registration,
    register,
    update,
    clearCache
  };
}

export default useServiceWorker;

