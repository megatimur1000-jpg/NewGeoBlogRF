const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'best_site',
  password: 'postgres',
  port: 5432,
});

async function clearBlogs() {
  try {
    console.log('🧹 Начинаем очистку блогов...');
    
    // Удаляем все блоги
    const deleteResult = await pool.query('DELETE FROM blog_posts');
    console.log('✅ Удалено блогов:', deleteResult.rowCount);
    
    // Сбросим автоинкремент
    await pool.query('ALTER SEQUENCE blog_posts_id_seq RESTART WITH 1');
    console.log('✅ Сброшен автоинкремент ID');
    
    // Проверяем результат
    const checkResult = await pool.query('SELECT COUNT(*) as count FROM blog_posts');
    console.log('📊 Осталось блогов:', checkResult.rows[0].count);
    
    await pool.end();
    console.log('🎯 Все блоги очищены! Готов к созданию легендарного блога!');
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await pool.end();
  }
}

clearBlogs();