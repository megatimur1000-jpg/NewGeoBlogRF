const pool = require('./config/database');
const logger = require('./utils/logger');

async function testConnection() {
  try {
    // Тестируем подключение
    const client = await pool.connect();
    // Проверяем таблицу map_markers
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     const result = await client.query('SELECT COUNT(*) as count FROM map_markers');
    // Проверяем структуру таблицы
    const structureResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'map_markers' 
      ORDER BY ordinal_position
    `);
    
    structureResult.rows.forEach(row => {
      });
    
    client.release();
    } catch (error) {
    } finally {
    await pool.end();
  }
}

testConnection();
