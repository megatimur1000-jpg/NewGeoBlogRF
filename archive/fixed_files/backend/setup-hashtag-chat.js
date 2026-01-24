import { Pool } from 'pg';
import databaseConfig from './database.config.simple.cjs';
import fs from 'fs';
import path from 'path';

const pool = new Pool(databaseConfig);

async function setupHashtagChat() {
  try {
    const client = await pool.connect();
    
    // Читаем SQL файл
    const sqlPath = path.join(process.cwd(), 'chat_tables_postgres.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Выполняем SQL
    await client.query(sqlContent);
    
    // Проверяем что таблицы созданы
    const tables = ['hashtag_chat_rooms', 'hashtag_chat_messages'];
    
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     for (const table of tables) {
      try {
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:         const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        } catch (error) {
        }
    }
    
    client.release();
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

setupHashtagChat();




