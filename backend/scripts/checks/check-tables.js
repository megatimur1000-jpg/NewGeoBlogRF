import pool from './db.js';

async function checkTables() {
  try {
    console.log('🔍 Проверяем существование таблиц...\n');
    
    const tables = ['travel_routes', 'route_waypoints', 'activity_feed'];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table} LIMIT 1`);
        console.log(`✅ Таблица ${table}: существует (записей: ${result.rows[0].count})`);
      } catch (err) {
        console.log(`❌ Таблица ${table}: НЕ существует`);
        console.log(`   Ошибка: ${err.message}\n`);
      }
    }
    
    console.log('\n🔍 Проверяем структуру activity_feed...');
    try {
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'activity_feed' 
        ORDER BY ordinal_position
      `);
      
      if (structure.rows.length > 0) {
        console.log('📋 Структура activity_feed:');
        structure.rows.forEach(row => {
          console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
        });
      } else {
        console.log('❌ Таблица activity_feed не найдена');
      }
    } catch (err) {
      console.log(`❌ Ошибка при проверке структуры activity_feed: ${err.message}`);
    }
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
