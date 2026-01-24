import pool from './db.js';

async function checkStructure() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'route_waypoints' 
      ORDER BY ordinal_position
    `);
    
    console.log('Структура route_waypoints:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (err) {
    console.error('Ошибка:', err.message);
  } finally {
    process.exit();
  }
}

checkStructure();
