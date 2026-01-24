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
    console.log('🚀 Создание таблицы books...');
    
    // Читаем SQL скрипт
    const sqlScript = fs.readFileSync(path.join(__dirname, 'create-books-table.sql'), 'utf8');
    
    // Выполняем SQL скрипт
    await client.query(sqlScript);
    
    console.log('✅ Таблица books создана успешно!');
    
    // Проверяем результат
    const booksCount = await client.query('SELECT COUNT(*) FROM books');
    const blogsWithBooks = await client.query('SELECT COUNT(*) FROM blog_posts WHERE book_id IS NOT NULL');
    
    console.log(`📚 Количество книг: ${booksCount.rows[0].count}`);
    console.log(`📝 Блогов с привязкой к книгам: ${blogsWithBooks.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Ошибка при создании таблицы books:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Запускаем создание таблицы
createBooksTable()
  .then(() => {
    console.log('🎉 Готово! Таблица books создана.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
