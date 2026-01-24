import pool from './db.js';

async function checkEventsSchema() {
  try {
    const result = await pool.query(`SELECT column_name, data_type, is_nullable 
                                    FROM information_schema.columns 
                                    WHERE table_name = 'events' 
                                    ORDER BY ordinal_position`);
    
    console.log('Структура таблицы events:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

checkEventsSchema();
