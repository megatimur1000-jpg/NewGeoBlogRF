/**
 * Утилита для проверки согласия на аналитику
 * Используется во всех аналитических сервисах для проверки флага analytics_opt_out
 */

import { useAuth } from '../../contexts/AuthContext';
import storageService from '../../services/storageService';

/**
 * Проверяет, разрешена ли аналитика для текущего пользователя
 * @param user - Объект пользователя из AuthContext
 * @returns {boolean} - true если аналитика разрешена, false если отключена
 */
export const isAnalyticsEnabled = (user: any): boolean => {
  if (!user) {
    // Для гостей разрешаем только анонимную аналитику (PageView без userID)
    return true;
  }

  // Если analytics_opt_out = true, аналитика отключена
  return !user.analytics_opt_out;
};

/**
 * Получить текущее состояние согласия на аналитику
 * Используется в компонентах для проверки без хука
 */
export const getAnalyticsConsent = (): boolean => {
  try {
    // Пытаемся получить пользователя из storageService
    const savedUser = storageService.getItem('user') || storageService.getItem('user_in_session') || storageService.getItem('user');
    if (!savedUser) {
      return true; // Для гостей разрешаем анонимную аналитику
    }

    const user = JSON.parse(savedUser);
    return !user.analytics_opt_out;
  } catch {
    return true; // В случае ошибки разрешаем аналитику (fail-open)
  }
};

