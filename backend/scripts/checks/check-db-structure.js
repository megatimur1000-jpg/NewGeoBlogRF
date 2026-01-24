import pool from './db.js';

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Проверяем структуру базы данных...\n');

    // Проверяем таблицу map_markers
    console.log('📍 Таблица map_markers:');
    const markersStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'map_markers' 
      ORDER BY ordinal_position
    `);
    
    markersStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });
    
    // Проверяем есть ли creator_id
    const hasCreatorId = markersStructure.rows.some(row => row.column_name === 'creator_id');
    console.log(`  ✅ creator_id поле: ${hasCreatorId ? 'ЕСТЬ' : 'ОТСУТСТВУЕТ'}\n`);

    // Проверяем таблицу travel_routes
    console.log('🛣️ Таблица travel_routes:');
    try {
      const routesStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'travel_routes' 
        ORDER BY ordinal_position
      `);
      
      routesStructure.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
      });
      
      const hasRouteCreatorId = routesStructure.rows.some(row => row.column_name === 'creator_id');
      console.log(`  ✅ creator_id поле: ${hasRouteCreatorId ? 'ЕСТЬ' : 'ОТСУТСТВУЕТ'}\n`);
    } catch (err) {
      console.log('  ❌ Таблица travel_routes не найдена\n');
    }

    // Проверяем таблицу events
    console.log('📅 Таблица events:');
    try {
      const eventsStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'events' 
        ORDER BY ordinal_position
      `);
      
      eventsStructure.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
      });
      
      const hasEventCreatorId = eventsStructure.rows.some(row => row.column_name === 'creator_id');
      console.log(`  ✅ creator_id поле: ${hasEventCreatorId ? 'ЕСТЬ' : 'ОТСУТСТВУЕТ'}\n`);
    } catch (err) {
      console.log('  ❌ Таблица events не найдена\n');
    }

    // Проверяем таблицу blog_posts
    console.log('📝 Таблица blog_posts:');
    try {
      const blogsStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        ORDER BY ordinal_position
      `);
      
      blogsStructure.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
      });
      
      const hasBlogAuthorId = blogsStructure.rows.some(row => row.column_name === 'author_id');
      console.log(`  ✅ author_id поле: ${hasBlogAuthorId ? 'ЕСТЬ' : 'ОТСУТСТВУЕТ'}\n`);
    } catch (err) {
      console.log('  ❌ Таблица blog_posts не найдена\n');
    }

    // Проверяем таблицу books
    console.log('📚 Таблица books:');
    try {
      const booksStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'books' 
        ORDER BY ordinal_position
      `);
      
      booksStructure.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
      });
      
      const hasBookAuthorId = booksStructure.rows.some(row => row.column_name === 'author_id');
      console.log(`  ✅ author_id поле: ${hasBookAuthorId ? 'ЕСТЬ' : 'ОТСУТСТВУЕТ'}\n`);
    } catch (err) {
      console.log('  ❌ Таблица books не найдена\n');
    }

    console.log('✅ Проверка завершена!');

  } catch (error) {
    console.error('❌ Ошибка при проверке структуры БД:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabaseStructure();
