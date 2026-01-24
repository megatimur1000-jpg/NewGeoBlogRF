const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Настройки подключения к базе данных
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'best_site',
  password: 'postgres',
  port: 5432,
});

async function createBooksTable() {
  const client = await pool.connect();
  
  try {
    // Читаем SQL скрипт
    const sqlScript = fs.readFileSync(path.join(__dirname, 'create-books-table.sql'), 'utf8');
    
    // Выполняем SQL скрипт
    await client.query(sqlScript);
    
    // Проверяем результат
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     const booksCount = await client.query('SELECT COUNT(*) FROM books');
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     const blogsWithBooks = await client.query('SELECT COUNT(*) FROM blog_posts WHERE book_id IS NOT NULL');
    
    } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

// Запускаем создание таблицы
createBooksTable()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });



