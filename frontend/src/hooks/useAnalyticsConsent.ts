/**
 * Хук для управления согласием на аналитику
 * Предоставляет функции для проверки и изменения статуса аналитики
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/apiClient';

/**
 * Хук для управления согласием на аналитику
 * @returns {Object} Объект с функциями и состоянием
 */
export const useAnalyticsConsent = () => {
  const { user, token } = useAuth();
  const [isTrackingEnabled, setIsTrackingEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Инициализируем состояние из профиля пользователя
  useEffect(() => {
    if (user) {
      // Если analytics_opt_out = true, то трекинг отключен
      setIsTrackingEnabled(!user.analytics_opt_out);
    } else {
      // Для гостей трекинг включен по умолчанию (анонимная аналитика)
      setIsTrackingEnabled(true);
    }
  }, [user]);

  /**
   * Установить статус отказа от аналитики
   * @param {boolean} optOut - true = отключить аналитику, false = включить
   */
  const setAnalyticsOptOut = useCallback(async (optOut: boolean) => {
    if (!token || !user) {
      // Для гостей просто обновляем локальное состояние
      setIsTrackingEnabled(!optOut);
      return;
    }

    setIsLoading(true);
    try {
      // Обновляем на сервере
      const response = await apiClient.patch('/user/profile', {
        analytics_opt_out: optOut
      });

      // Обновляем локальное состояние
      setIsTrackingEnabled(!optOut);

      // Обновляем пользователя в контексте (если есть метод обновления)
      // Это будет сделано через перезагрузку профиля в AuthContext
      
      return response.data;
    } catch (error: any) {
      console.error('Ошибка обновления настройки аналитики:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  return {
    isTrackingEnabled,
    setAnalyticsOptOut,
    isLoading
  };
};

