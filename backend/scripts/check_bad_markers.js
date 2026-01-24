// Скрипт для проверки проблемных маркеров в базе данных
import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkBadMarkers() {
  try {
    console.log('Проверка проблемных маркеров в базе данных...\n');
    
    // Проверяем общее количество маркеров
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM map_markers');
    console.log(`Всего маркеров в базе: ${totalResult.rows[0].count}`);
    
    // Проверяем метки "Без названия"
    const badNameResult = await pool.query(`
      SELECT id, title, category, subcategory, created_at 
      FROM map_markers 
      WHERE title = 'Без названия' OR title = 'Unnamed' OR title = 'Неизвестно'
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`\nМетки "Без названия": ${badNameResult.rows.length}`);
    if (badNameResult.rows.length > 0) {
      console.log('Примеры:');
      badNameResult.rows.forEach(marker => {
        console.log(`- ID: ${marker.id}, Название: "${marker.title}", Категория: ${marker.category}, Дата: ${marker.created_at}`);
      });
    }
    
    // Проверяем метки с пустыми названиями
    const emptyResult = await pool.query(`
      SELECT id, title, category, subcategory, created_at 
      FROM map_markers 
      WHERE title IS NULL OR title = '' OR LENGTH(TRIM(title)) < 3
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`\nМетки с пустыми названиями: ${emptyResult.rows.length}`);
    if (emptyResult.rows.length > 0) {
      console.log('Примеры:');
      emptyResult.rows.forEach(marker => {
        console.log(`- ID: ${marker.id}, Название: "${marker.title}", Категория: ${marker.category}, Дата: ${marker.created_at}`);
      });
    }
    
    // Проверяем метки в категории "природа"
    const natureResult = await pool.query(`
      SELECT id, title, category, subcategory, created_at 
      FROM map_markers 
      WHERE category = 'nature' AND (title = 'Без названия' OR title = 'Unnamed' OR title = 'Неизвестно')
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`\nМетки "Без названия" в категории "природа": ${natureResult.rows.length}`);
    if (natureResult.rows.length > 0) {
      console.log('Примеры:');
      natureResult.rows.forEach(marker => {
        console.log(`- ID: ${marker.id}, Название: "${marker.title}", Категория: ${marker.category}, Дата: ${marker.created_at}`);
      });
    }
    
    // Проверяем последние добавленные метки
    const recentResult = await pool.query(`
      SELECT id, title, category, subcategory, created_at 
      FROM map_markers 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log('\nПоследние добавленные метки:');
    recentResult.rows.forEach(marker => {
      console.log(`- ID: ${marker.id}, Название: "${marker.title}", Категория: ${marker.category}, Дата: ${marker.created_at}`);
    });
    
  } catch (error) {
    console.error('Ошибка при проверке базы данных:', error);
  } finally {
    await pool.end();
  }
}

checkBadMarkers();
