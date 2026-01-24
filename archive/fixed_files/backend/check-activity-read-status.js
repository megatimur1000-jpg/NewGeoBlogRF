import pool from './src/database/config.js';

async function checkActivityReadStatus() {
  try {
    // Проверяем существование таблицы
    const result = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'activity_read_status'
    `);
    
    if (result.rows[0].count === '0') {
      return;
    }
    
    // Проверяем количество записей
// SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original:     const countResult = await pool.query('SELECT COUNT(*) as count FROM activity_read_status');
    // Проверяем структуру таблицы
    const structureResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'activity_read_status'
      ORDER BY ordinal_position
    `);
    
    structureResult.rows.forEach(row => {
      });
    
  } catch (error) {
    } finally {
    process.exit(0);
  }
}

checkActivityReadStatus();




