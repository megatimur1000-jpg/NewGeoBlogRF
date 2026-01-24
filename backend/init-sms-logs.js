import { pool } from './src/services/smsLimiter.js';

async function createSMSLogsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sms_logs (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) NOT NULL,
        type VARCHAR(20) NOT NULL,
        success BOOLEAN NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Создаем индекс для быстрого поиска по телефону и времени
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sms_logs_phone_time 
      ON sms_logs(phone, created_at);
    `);

    console.log('✅ Таблица sms_logs создана успешно');
  } catch (error) {
    console.error('❌ Ошибка создания таблицы sms_logs:', error);
  }
}

// Запускаем создание таблицы
createSMSLogsTable();
