import express from 'express';
import { checkSMSSendLimits, getSMSStats } from '../services/smsLimiter.js';
import { authenticateToken } from '../middleware/auth.js';
import pool from '../../db.js';
import logger from '../../logger.js';


const router = express.Router();

// Получение статистики SMS для администратора
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Проверяем, что пользователь - администратор
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({
        message: 'Доступ запрещен. Требуются права администратора.'
      });
    }

    const { phone, timeWindow } = req.query;

    if (phone) {
      // Статистика для конкретного номера
      const stats = await getSMSStats(phone, timeWindow || 'hour');
      const limits = await checkSMSSendLimits(phone);
      
      res.json({
        phone,
        stats,
        limits: limits.allowed ? limits : { allowed: false, ...limits }
      });
    } else {
      // Общая статистика системы
      const stats = await pool.query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
          SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed,
          COUNT(DISTINCT phone) as unique_phones
         FROM sms_logs 
         WHERE created_at > NOW() - INTERVAL '24 hours'`
      );

      const topPhones = await pool.query(
        `SELECT phone, COUNT(*) as attempts
         FROM sms_logs
         WHERE created_at > NOW() - INTERVAL '24 hours'
         GROUP BY phone
         ORDER BY attempts DESC
         LIMIT 10`
      );

      res.json({
        system: stats.rows[0],
        topPhones: topPhones.rows
      });
    }

  } catch (error) {
    logger.error('Ошибка получения статистики SMS:', error);
    res.status(500).json({
      message: 'Ошибка сервера при получении статистики'
    });
  }
});

// Получение логов неудачных попыток
router.get('/failed-attempts', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({
        message: 'Доступ запрещен. Требуются права администратора.'
      });
    }

    const { limit = 50 } = req.query;

    const result = await pool.query(
      `SELECT phone, type, error_message, created_at
       FROM sms_logs
       WHERE success = FALSE
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      failedAttempts: result.rows
    });

  } catch (error) {
    logger.error('Ошибка получения логов неудачных попыток:', error);
    res.status(500).json({
      message: 'Ошибка сервера при получении логов'
    });
  }
});

export default router;



