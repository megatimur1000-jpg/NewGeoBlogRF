import pool from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Применение миграции модерации...\n');
    
    // Читаем SQL файл
    const sqlPath = path.join(__dirname, 'src', 'migrations', 'add-moderation-fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Удаляем COMMENT команды - они могут вызвать проблемы
    const cleanSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('COMMENT'))
      .join('\n');
    
    console.log('⏳ Выполнение SQL миграции...\n');
    
    // Выполняем весь SQL целиком
    // PostgreSQL может обработать несколько команд в одном запросе
    try {
      await client.query(cleanSql);
      console.log('✅ SQL миграция выполнена успешно!\n');
    } catch (error) {
      // Игнорируем ошибки "already exists" для таблиц и индексов
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate') ||
          error.code === '42P07' || // duplicate_table
          error.code === '42710') { // duplicate_object
        console.log('⚠️  Некоторые объекты уже существуют, продолжаем...\n');
      } else {
        console.error('❌ Ошибка выполнения SQL:', error.message);
        throw error;
      }
    }
    
    console.log('✅ Миграция применена успешно!');
    
    // Проверяем результат
    console.log('\n🔍 Проверка структуры таблиц...\n');
    
    const tables = ['events', 'posts', 'travel_routes', 'map_markers', 'blog_posts'];
    
    for (const table of tables) {
      try {
        const result = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 
            AND column_name IN ('status', 'moderation_reason', 'moderated_at', 'moderated_by')
          ORDER BY column_name
        `, [table]);
        
        if (result.rows.length > 0) {
          console.log(`✅ Таблица ${table}:`);
          result.rows.forEach(row => {
            console.log(`   - ${row.column_name}: ${row.data_type}`);
          });
        } else {
          console.log(`⚠️  Таблица ${table}: поля модерации не найдены`);
        }
      } catch (error) {
        console.log(`❌ Таблица ${table}: ошибка проверки - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка при применении миграции:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration()
  .then(() => {
    console.log('\n✅ Готово!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Критическая ошибка:', error);
    process.exit(1);
  });

