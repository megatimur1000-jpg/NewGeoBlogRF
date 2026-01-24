/**
 * Скрипт для создания таблиц системы геймификации
 * 
 * Использование:
 * node src/migrations/create_gamification_tables.js
 */

import pool from '../../db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createGamificationTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Начинаю создание таблиц системы геймификации...');
    
    // Читаем SQL файл
    const sqlPath = join(__dirname, '../../create_gamification_tables.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    // Выполняем SQL
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Таблицы системы геймификации успешно созданы!');
    console.log('📋 Созданные таблицы:');
    console.log('   - user_levels');
    console.log('   - xp_history');
    console.log('   - daily_goals');
    console.log('   - daily_goals_history');
    console.log('   - user_achievements');
    console.log('   - gamification_actions');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Ошибка при создании таблиц:', error.message);
    
    if (error.code === '42P07') {
      console.log('ℹ️  Некоторые таблицы уже существуют. Это нормально.');
    } else {
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

// Запускаем миграцию
createGamificationTables()
  .then(() => {
    console.log('✅ Миграция завершена успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Ошибка миграции:', error);
    process.exit(1);
  });

