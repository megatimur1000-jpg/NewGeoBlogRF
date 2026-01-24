import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'bestuser_temp',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'bestsite',
  password: process.env.DB_PASSWORD || '55555',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  client_encoding: 'utf8'
});

/**
 * Проверяет лимиты на отправку SMS для номера телефона
 * Лимиты: 3 SMS за 5 минут, 10 SMS за час, 50 SMS за сутки
 */
async function checkSMSSendLimits(phone) {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    // Проверка: не более 3 SMS за 5 минут
    const recentCount = await pool.query(
      `SELECT COUNT(*) as count FROM sms_codes 
       WHERE phone = $1 AND created_at > $2 AND type IN ('verification', 'password_reset')`,
      [phone, fiveMinutesAgo]
    );

    if (parseInt(recentCount.rows[0].count) >= 3) {
      return {
        allowed: false,
        limit: '5 минут',
        count: parseInt(recentCount.rows[0].count),
        maxCount: 3,
        message: 'Слишком много попыток. Попробуйте через несколько минут.'
      };
    }

    // Проверка: не более 10 SMS за час
    const hourlyCount = await pool.query(
      `SELECT COUNT(*) as count FROM sms_codes 
       WHERE phone = $1 AND created_at > $2 AND type IN ('verification', 'password_reset')`,
      [phone, oneHourAgo]
    );

    if (parseInt(hourlyCount.rows[0].count) >= 10) {
      return {
        allowed: false,
        limit: 'час',
        count: parseInt(hourlyCount.rows[0].count),
        maxCount: 10,
        message: 'Превышен лимит отправок за час. Попробуйте позже.'
      };
    }

    // Проверка: не более 50 SMS за сутки
    const dailyCount = await pool.query(
      `SELECT COUNT(*) as count FROM sms_codes 
       WHERE phone = $1 AND created_at > $2 AND type IN ('verification', 'password_reset')`,
      [phone, oneDayAgo]
    );

    if (parseInt(dailyCount.rows[0].count) >= 50) {
      return {
        allowed: false,
        limit: 'сутки',
        count: parseInt(dailyCount.rows[0].count),
        maxCount: 50,
        message: 'Превышен суточный лимит отправок. Попробуйте завтра.'
      };
    }

    // Все проверки пройдены
    return {
      allowed: true,
      recent: parseInt(recentCount.rows[0].count),
      hourly: parseInt(hourlyCount.rows[0].count),
      daily: parseInt(dailyCount.rows[0].count)
    };

  } catch (error) {
    console.error('Ошибка проверки лимитов SMS:', error);
    // В случае ошибки разрешаем отправку, чтобы не блокировать легитимных пользователей
    return { allowed: true, error: true };
  }
}

/**
 * Логирует попытку отправки SMS
 */
async function logSMSTry(phone, type, success, error = null) {
  try {
    await pool.query(
      `INSERT INTO sms_logs (phone, type, success, error_message, created_at) 
       VALUES ($1, $2, $3, $4, NOW())`,
      [phone, type, success, error]
    );
  } catch (err) {
    console.error('Ошибка логирования SMS:', err);
  }
}

/**
 * Получает статистику SMS для номера
 */
async function getSMSStats(phone, timeWindow = 'hour') {
  let timeAgo;
  switch (timeWindow) {
    case '5min':
      timeAgo = new Date(Date.now() - 5 * 60 * 1000);
      break;
    case 'hour':
      timeAgo = new Date(Date.now() - 60 * 60 * 1000);
      break;
    case 'day':
      timeAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      break;
    default:
      timeAgo = new Date(Date.now() - 60 * 60 * 1000);
  }

  try {
    const result = await pool.query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
              SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed
       FROM sms_logs 
       WHERE phone = $1 AND created_at > $2`,
      [phone, timeAgo]
    );

    return result.rows[0];

  } catch (error) {
    console.error('Ошибка получения статистики SMS:', error);
    return null;
  }
}

export { checkSMSSendLimits, logSMSTry, getSMSStats, pool };



