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
    // Проверяем маркеры
    const markersResult = await client.query('SELECT COUNT(*) as count FROM map_markers');
    const markersCount = parseInt(markersResult.rows[0].count);
    if (markersCount > 0) {
      const sampleMarkers = await client.query('SELECT id, title, category FROM map_markers LIMIT 3');
      sampleMarkers.rows.forEach(marker => {
        - ID: ${marker.id}`);
      });
    }
    
    // Проверяем события
    const eventsResult = await client.query('SELECT COUNT(*) as count FROM events');
    const eventsCount = parseInt(eventsResult.rows[0].count);
    if (eventsCount > 0) {
      const sampleEvents = await client.query('SELECT id, title, date FROM events LIMIT 3');
      sampleEvents.rows.forEach(event => {
        - ID: ${event.id}`);
      });
    }
    
    // Проверяем блоги
    const blogsResult = await client.query('SELECT COUNT(*) as count FROM blog_posts');
    const blogsCount = parseInt(blogsResult.rows[0].count);
    if (blogsCount > 0) {
      const sampleBlogs = await client.query('SELECT id, title, constructor_data FROM blog_posts LIMIT 3');
      sampleBlogs.rows.forEach(blog => {
        const hasConstructorData = blog.constructor_data ? '✅' : '❌';
        });
    }
    
    // Проверяем книги
    const booksResult = await client.query('SELECT COUNT(*) as count FROM books');
    const booksCount = parseInt(booksResult.rows[0].count);
    if (booksCount > 0) {
      const sampleBooks = await client.query('SELECT id, title, category FROM books LIMIT 3');
      sampleBooks.rows.forEach(book => {
        - ID: ${book.id}`);
      });
    }
    
    if (markersCount === 0) {
      } else {
      }
    
    if (eventsCount === 0) {
      } else {
      }
    
    if (blogsCount === 0) {
      } else {
      }
    
    } catch (error) {
    } finally {
    client.release();
    await pool.end();
  }
}

checkBlogData();

