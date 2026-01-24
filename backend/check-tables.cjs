const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'best_site',
  password: 'postgres',
  port: 5432,
});

async function checkTables() {
  try {
    const result = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log('Таблицы в базе данных:');
    result.rows.forEach(row => console.log('- ' + row.table_name));
  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();