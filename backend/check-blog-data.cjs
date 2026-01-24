// Проверка данных для тестирования блогов
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'best_site',
  password: 'postgres',
  port: 5432,
});

async function checkBlogData() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Проверка данных для тестирования блогов...\n');
    
    // Проверяем маркеры
    const markersResult = await client.query('SELECT COUNT(*) as count FROM map_markers');
    const markersCount = parseInt(markersResult.rows[0].count);
    console.log(`📍 Маркеры: ${markersCount} шт.`);
    
    if (markersCount > 0) {
      const sampleMarkers = await client.query('SELECT id, title, category FROM map_markers LIMIT 3');
      console.log('   Примеры:');
      sampleMarkers.rows.forEach(marker => {
        console.log(`   - ${marker.title} (${marker.category}) - ID: ${marker.id}`);
      });
    }
    
    // Проверяем события
    const eventsResult = await client.query('SELECT COUNT(*) as count FROM events');
    const eventsCount = parseInt(eventsResult.rows[0].count);
    console.log(`\n📅 События: ${eventsCount} шт.`);
    
    if (eventsCount > 0) {
      const sampleEvents = await client.query('SELECT id, title, date FROM events LIMIT 3');
      console.log('   Примеры:');
      sampleEvents.rows.forEach(event => {
        console.log(`   - ${event.title} (${event.date}) - ID: ${event.id}`);
      });
    }
    
    // Проверяем блоги
    const blogsResult = await client.query('SELECT COUNT(*) as count FROM blog_posts');
    const blogsCount = parseInt(blogsResult.rows[0].count);
    console.log(`\n📝 Блоги: ${blogsCount} шт.`);
    
    if (blogsCount > 0) {
      const sampleBlogs = await client.query('SELECT id, title, constructor_data FROM blog_posts LIMIT 3');
      console.log('   Примеры:');
      sampleBlogs.rows.forEach(blog => {
        const hasConstructorData = blog.constructor_data ? '✅' : '❌';
        console.log(`   - ${blog.title} - Constructor data: ${hasConstructorData}`);
      });
    }
    
    // Проверяем книги
    const booksResult = await client.query('SELECT COUNT(*) as count FROM books');
    const booksCount = parseInt(booksResult.rows[0].count);
    console.log(`\n📚 Книги: ${booksCount} шт.`);
    
    if (booksCount > 0) {
      const sampleBooks = await client.query('SELECT id, title, category FROM books LIMIT 3');
      console.log('   Примеры:');
      sampleBooks.rows.forEach(book => {
        console.log(`   - ${book.title} (${book.category}) - ID: ${book.id}`);
      });
    }
    
    console.log('\n🎯 Рекомендации для тестирования:');
    
    if (markersCount === 0) {
      console.log('❌ Нет маркеров - создайте несколько маркеров на карте');
    } else {
      console.log('✅ Маркеры есть - можно тестировать крючки с метками');
    }
    
    if (eventsCount === 0) {
      console.log('❌ Нет событий - создайте несколько событий в календаре');
    } else {
      console.log('✅ События есть - можно тестировать крючки с событиями');
    }
    
    if (blogsCount === 0) {
      console.log('❌ Нет блогов - создайте тестовый блог');
    } else {
      console.log('✅ Блоги есть - можно тестировать просмотр');
    }
    
    console.log('\n🚀 Для тестирования:');
    console.log('1. Откройте http://localhost:5173/blogs');
    console.log('2. Нажмите "Создать блог"');
    console.log('3. Нажмите "Добавить контент"');
    console.log('4. Выберите маркер или событие');
    console.log('5. Опубликуйте блог');
    console.log('6. Откройте блог и проверьте интерактивность');
    
  } catch (error) {
    console.error('❌ Ошибка проверки данных:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkBlogData();
