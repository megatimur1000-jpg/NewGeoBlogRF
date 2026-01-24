import pool from './db.js';

async function checkRouteWaypoints() {
  try {
    console.log('🔍 Проверяем таблицу route_waypoints...');
    const result = await pool.query('SELECT * FROM route_waypoints LIMIT 1');
    console.log('✅ Таблица route_waypoints существует');
    console.log('Структура:', result.fields.map(f => `${f.name}: ${f.dataTypeID}`));
  } catch (err) {
    console.log('❌ Таблица route_waypoints не существует:', err.message);
  } finally {
    process.exit();
  }
}

checkRouteWaypoints();
