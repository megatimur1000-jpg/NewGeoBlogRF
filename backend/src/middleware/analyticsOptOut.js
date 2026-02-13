/**
 * Middleware для проверки флага отказа от аналитики
 * Если пользователь отключил аналитику (analytics_opt_out = true),
 * то не сохраняем поведенческие события
 */

import pool from '../../db.js';
import logger from '../../logger.js';


/**
 * Проверяет, разрешена ли аналитика для пользователя
 * @param {number|string} userId - ID пользователя
 * @returns {Promise<boolean>} - true если аналитика разрешена, false если отключена
 */
export const isAnalyticsEnabled = async (userId) => {
  if (!userId) {
    // Для гостей разрешаем только анонимную аналитику (PageView без userID)
    return true;
  }

  try {
    const result = await pool.query(
      'SELECT analytics_opt_out FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Пользователь не найден - разрешаем аналитику по умолчанию
      return true;
    }

    // Если analytics_opt_out = true, аналитика отключена
    return !result.rows[0].analytics_opt_out;
  } catch (error) {
    logger.error('Ошибка проверки флага аналитики:', error);
    // В случае ошибки разрешаем аналитику (fail-open)
    return true;
  }
};

/**
 * Middleware для проверки флага перед сохранением аналитики
 * Используется в маршрутах trackEvent и trackError
 */
export const checkAnalyticsOptOut = async (req, res, next) => {
  const userId = req.user?.id;

  // Проверяем флаг только для авторизованных пользователей
  if (userId) {
    const analyticsEnabled = await isAnalyticsEnabled(userId);
    
    if (!analyticsEnabled) {
      // Пользователь отключил аналитику - возвращаем успешный ответ, но не сохраняем данные
      return res.status(200).json({ 
        message: 'Событие не сохранено (аналитика отключена)',
        saved: false
      });
    }
  }

  // Для гостей или если аналитика включена - продолжаем обработку
  next();
};

